/**
 * The batching analytics service and the pseudonymous id (ADR-013, ADR-031).
 *
 * What matters here is that a metric can never become the user's problem — `track` swallows every
 * failure, including an invented EVT_* — and that a failed send re-queues rather than silently
 * losing a batch, which would make the very dashboards this exists for quietly wrong.
 */
import type { AnalyticsEventEnvelope } from '@panchangpal/shared';
import { ANALYTICS_BATCH_SIZE } from '../../domain/analytics';
import { BatchingAnalyticsService } from '../analyticsAdapter';
import { AnalyticsRepository } from '../analyticsRepository';
import { getUserPseudoId, resetPseudoIdForTests } from '../pseudoId';
import { createMemoryStore } from '../keyValueStore';

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: { extra: {}, version: '0.1.0' } },
}));

jest.mock('expo-crypto', () => {
  let n = 0;
  return { __esModule: true, randomUUID: () => `uuid-${++n}` };
});

class FakeRepository {
  batches: AnalyticsEventEnvelope[][] = [];
  failNext = false;

  async insertBatch(events: readonly AnalyticsEventEnvelope[]): Promise<void> {
    if (this.failNext) {
      this.failNext = false;
      throw new Error('network');
    }
    this.batches.push([...events]);
  }
}

function makeService(repo: FakeRepository) {
  return new BatchingAnalyticsService({
    repository: repo as unknown as AnalyticsRepository,
    pseudoId: () => 'pseudo-1',
    now: () => new Date('2026-07-25T09:30:00.000Z'),
  });
}

describe('BatchingAnalyticsService', () => {
  afterEach(() => jest.restoreAllMocks());

  it('queues events without sending until the batch size is reached', () => {
    const repo = new FakeRepository();
    const service = makeService(repo);

    for (let i = 0; i < ANALYTICS_BATCH_SIZE - 1; i += 1) service.track('EVT_012');

    expect(repo.batches).toHaveLength(0);
    expect(service.pending).toBe(ANALYTICS_BATCH_SIZE - 1);
  });

  it('sends automatically once the batch fills', async () => {
    const repo = new FakeRepository();
    const service = makeService(repo);

    for (let i = 0; i < ANALYTICS_BATCH_SIZE; i += 1) service.track('EVT_012');
    await service.flush();

    expect(repo.batches).toHaveLength(1);
    expect(repo.batches[0]).toHaveLength(ANALYTICS_BATCH_SIZE);
    expect(service.pending).toBe(0);
  });

  it('attaches the household id to subsequent events (North Star is household-grain)', async () => {
    const repo = new FakeRepository();
    const service = makeService(repo);

    service.setHouseholdId('house-9');
    service.track('EVT_017');
    await service.flush();

    expect(repo.batches[0]?.[0]?.household_id).toBe('house-9');
  });

  it('adds the §11.1 context props it can supply, and lets callers override nothing identity-bearing', async () => {
    const repo = new FakeRepository();
    const service = makeService(repo);

    service.track('EVT_012', { screen_id: 'SCR_TODAY_001' });
    await service.flush();

    expect(repo.batches[0]?.[0]?.props).toEqual({
      app_version: '0.1.0',
      platform: expect.any(String),
      screen_id: 'SCR_TODAY_001',
    });
    expect(repo.batches[0]?.[0]?.user_pseudo_id).toBe('pseudo-1');
  });

  it('drops an event outside the EVT_* taxonomy with a warning instead of throwing', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const repo = new FakeRepository();
    const service = makeService(repo);

    expect(() => service.track('EVT_999' as 'EVT_012')).not.toThrow();
    expect(service.pending).toBe(0);
    expect(warn).toHaveBeenCalled();
  });

  it('re-queues a failed batch ahead of later events, preserving order', async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const repo = new FakeRepository();
    const service = makeService(repo);

    service.track('EVT_012');
    repo.failNext = true;
    await service.flush();
    expect(service.pending).toBe(1);
    expect(repo.batches).toHaveLength(0);

    service.track('EVT_017');
    await service.flush();

    expect(repo.batches).toHaveLength(1);
    expect(repo.batches[0]?.map((e) => e.event_id)).toEqual(['EVT_012', 'EVT_017']);
  });

  it('does nothing on an empty flush', async () => {
    const repo = new FakeRepository();
    await makeService(repo).flush();
    expect(repo.batches).toHaveLength(0);
  });
});

describe('user_pseudo_id', () => {
  beforeEach(() => resetPseudoIdForTests(createMemoryStore()));
  afterEach(() => resetPseudoIdForTests());

  it('mints an id and returns the same one thereafter', () => {
    const first = getUserPseudoId();
    expect(first).toMatch(/^uuid-/);
    expect(getUserPseudoId()).toBe(first);
  });

  it('reuses the persisted id across a fresh resolution — it is stable, not per-launch', () => {
    const store = createMemoryStore();
    resetPseudoIdForTests(store);
    const first = getUserPseudoId();

    resetPseudoIdForTests(store); // same storage, new process
    expect(getUserPseudoId()).toBe(first);
  });

  it('is not derived from any identity — a fresh device gets an unrelated id', () => {
    const first = getUserPseudoId();
    resetPseudoIdForTests(createMemoryStore());
    expect(getUserPseudoId()).not.toBe(first);
  });
});
