/**
 * Ask Guru rate limiting (TDD Part 3 §8.4). Per-user and per-IP fixed-window counters,
 * strictest on the AI endpoint; anonymous users get tighter limits (ADR-009). The
 * ALGORITHM is pure and tested; the COUNTER STORE is an injected interface (in-memory for
 * tests, Postgres `ai_rate_limit` for production). Limits are server config (§8A).
 */
export interface RateLimitConfig {
  perUserPerMinute: number;
  perIpPerMinute: number;
  anonPerUserPerMinute: number; // tighter for anonymous
}

export const RATE_LIMIT_DEFAULTS: RateLimitConfig = {
  perUserPerMinute: 12,
  perIpPerMinute: 30,
  anonPerUserPerMinute: 4,
};

/** Increment the counter for (key, windowStart) and return the new count. */
export interface RateLimitStore {
  incr(key: string, windowStartEpochMin: number): Promise<number>;
}

export function windowStartMinute(nowMs: number): number {
  return Math.floor(nowMs / 60_000);
}

export interface RateDecision {
  allowed: boolean;
  limit: number;
  remaining: number;
}

export async function checkRateLimit(
  store: RateLimitStore,
  opts: { userId: string; ip: string; isAnonymous: boolean; nowMs?: number },
  cfg: RateLimitConfig = RATE_LIMIT_DEFAULTS,
): Promise<RateDecision> {
  const w = windowStartMinute(opts.nowMs ?? Date.now());
  const userLimit = opts.isAnonymous ? cfg.anonPerUserPerMinute : cfg.perUserPerMinute;

  const userCount = await store.incr(`u:${opts.userId}`, w);
  const ipCount = await store.incr(`ip:${opts.ip}`, w);

  const overUser = userCount > userLimit;
  const overIp = ipCount > cfg.perIpPerMinute;
  const limit = overIp ? cfg.perIpPerMinute : userLimit;
  const used = overIp ? ipCount : userCount;
  return { allowed: !overUser && !overIp, limit, remaining: Math.max(0, limit - used) };
}

/** Simple in-memory store for unit tests. */
export class InMemoryRateLimitStore implements RateLimitStore {
  #m = new Map<string, number>();
  async incr(key: string, w: number): Promise<number> {
    const k = `${key}@${w}`;
    const n = (this.#m.get(k) ?? 0) + 1;
    this.#m.set(k, n);
    return n;
  }
}
