import { RitualSessionRepository , getStorageBackend, resetStorageBackendForTests } from '../ritualSessionRepository';
import type { RitualSession } from '../../domain/ritual';

class MemoryStorage {
  private readonly values = new Map<string, string>();
  getString(key: string): string | undefined { return this.values.get(key); }
  set(key: string, value: string): void { this.values.set(key, value); }
  delete(key: string): void { this.values.delete(key); }
}

describe('RitualSessionRepository', () => {
  const session: RitualSession = { ritualId: 'r1', localDate: '2026-07-12', stepIndex: 1, status: 'paused', skippedStepIndices: [0], completionRecorded: false };

  it('persists and restores a full session for offline app restarts', async () => {
    const repository = new RitualSessionRepository(new MemoryStorage());
    await repository.save(session);
    await expect(repository.load('r1', '2026-07-12')).resolves.toEqual(session);
  });

  it('clears a persisted session', async () => {
    const repository = new RitualSessionRepository(new MemoryStorage());
    await repository.save(session);
    await repository.clear('r1', '2026-07-12');
    await expect(repository.load('r1', '2026-07-12')).resolves.toBeNull();
  });
});

describe('storage resolution', () => {
  it('constructs without touching native storage', () => {
    // Regression: `new MMKV()` was a default parameter, so building the repository ran it
    // immediately. In Expo Go that throws — synchronously, inside the ritual screen's
    // effect — so it bypassed the restore promise's .catch() and hit the ErrorBoundary as
    // a render error. Construction must resolve nothing.
    expect(() => new RitualSessionRepository()).not.toThrow();
  });

  it('still uses an injected store when given one', async () => {
    const repository = new RitualSessionRepository(new MemoryStorage());
    await repository.save({ ritualId: 'r1', localDate: '2026-07-19', stepIndex: 2, status: 'in_progress', completionRecorded: false });
    expect(await repository.load('r1', '2026-07-19')).toMatchObject({ stepIndex: 2 });
  });

  it('falls back to an in-memory store when native storage is unavailable', async () => {
    // Expo Go has no MMKV, and a device can fail too. Sessions stop surviving a restart;
    // the screen keeps working.
    const repository = new RitualSessionRepository();
    await repository.save({ ritualId: 'r2', localDate: '2026-07-19', stepIndex: 1, status: 'in_progress', completionRecorded: false });
    expect(await repository.load('r2', '2026-07-19')).toMatchObject({ stepIndex: 1 });
    await repository.clear('r2', '2026-07-19');
    expect(await repository.load('r2', '2026-07-19')).toBeNull();
  });
});

describe('storage backend observability', () => {
  it('reports nothing before storage is resolved', () => {
    // Resolution is lazy: constructing must not touch the native module.
    resetStorageBackendForTests();
    new RitualSessionRepository();
    expect(getStorageBackend()).toBeNull();
  });

  it('reports which backend served a write, and warns when it degraded', async () => {
    // The point of this test: "the session did not persist" and "MMKV was unavailable, so
    // memory was used and lost on restart" used to be indistinguishable from outside. They
    // are now distinguishable, and the degradation is announced.
    resetStorageBackendForTests();
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const repository = new RitualSessionRepository();
    await repository.save({ ritualId: 'r9', localDate: '2026-07-19', stepIndex: 0, status: 'in_progress', completionRecorded: false });

    const backend = getStorageBackend();
    expect(backend).not.toBeNull();
    if (backend === 'memory') {
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('will NOT'), expect.anything());
    } else {
      expect(warn).not.toHaveBeenCalled();
    }
    warn.mockRestore();
  });

  it('does not report a backend when an explicit store is injected', async () => {
    // An injected store bypasses device resolution entirely — nothing to report.
    resetStorageBackendForTests();
    const repository = new RitualSessionRepository(new MemoryStorage());
    await repository.save({ ritualId: 'r10', localDate: '2026-07-19', stepIndex: 0, status: 'in_progress', completionRecorded: false });
    expect(getStorageBackend()).toBeNull();
  });
});
