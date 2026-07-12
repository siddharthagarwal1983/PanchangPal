import { RitualSessionRepository } from '../ritualSessionRepository';
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
