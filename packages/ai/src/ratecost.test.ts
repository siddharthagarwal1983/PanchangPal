import { describe, it, expect } from 'vitest';
import { checkRateLimit, InMemoryRateLimitStore, RATE_LIMIT_DEFAULTS } from './ratelimit';
import { estimateCostUsd, circuitOpen, InMemoryCostLedger, CIRCUIT_DEFAULTS } from './cost';

describe('Ask Guru rate limiting (TDD Part 3 §8.4)', () => {
  it('allows within the per-user window then blocks over it (anon tighter)', async () => {
    const store = new InMemoryRateLimitStore();
    const opts = { userId: 'u1', ip: '1.2.3.4', isAnonymous: true, nowMs: 1_000_000 };
    const limit = RATE_LIMIT_DEFAULTS.anonPerUserPerMinute; // 4
    let last;
    for (let i = 0; i < limit; i++) last = await checkRateLimit(store, opts);
    expect(last!.allowed).toBe(true);
    const over = await checkRateLimit(store, opts); // 5th in the same minute
    expect(over.allowed).toBe(false);
  });

  it('separates windows by minute', async () => {
    const store = new InMemoryRateLimitStore();
    const a = await checkRateLimit(store, { userId: 'u', ip: 'i', isAnonymous: false, nowMs: 60_000 });
    const b = await checkRateLimit(store, { userId: 'u', ip: 'i', isAnonymous: false, nowMs: 120_000 });
    expect(a.allowed && b.allowed).toBe(true);
  });
});

describe('AI cost + circuit breaker (TDD Part 3 §8.1, F-11)', () => {
  it('estimates cost from token usage', () => {
    const c = estimateCostUsd({ genInput: 1_000_000, genOutput: 1_000_000, embed: 1_000_000 });
    expect(c).toBeCloseTo(0.25 + 2.0 + 0.02, 6);
  });

  it('opens the breaker before the ceiling', () => {
    const ceiling = CIRCUIT_DEFAULTS.ceilingUsd;
    expect(circuitOpen(ceiling * 0.9)).toBe(false);
    expect(circuitOpen(ceiling * 0.96)).toBe(true);
  });

  it('ledger accumulates spend', async () => {
    const ledger = new InMemoryCostLedger();
    await ledger.record(1.5, { model: 'gpt-5-mini', correlationId: 'c' });
    await ledger.record(2.0, { model: 'gpt-5-mini', correlationId: 'c' });
    expect(await ledger.windowSpendUsd()).toBe(3.5);
  });
});
