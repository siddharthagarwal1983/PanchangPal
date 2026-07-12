/**
 * AI cost monitoring + circuit breaker (TDD Part 3 §8.1/§8.4, F-11). Estimates per-answer
 * cost from token usage at model rates, records it to a ledger, and OPENS the circuit when
 * spend over a rolling window approaches the configured ceiling — degrading gracefully to
 * "Guru is busy" (calm ERR_AI_ERROR) BEFORE blowing the budget. Pure logic + injected
 * ledger interface. Rates/ceiling are server config (§8A), never hard-coded product values.
 */

/** USD per 1M tokens. Launch defaults are conservative placeholders — set from `ai_config`. */
export interface ModelRates {
  genInputPerM: number;
  genOutputPerM: number;
  embedPerM: number;
}

export const MODEL_RATES_DEFAULT: ModelRates = {
  genInputPerM: 0.25,
  genOutputPerM: 2.0,
  embedPerM: 0.02,
};

export interface TokenUsage {
  genInput: number;
  genOutput: number;
  embed: number;
}

export function estimateCostUsd(u: TokenUsage, rates: ModelRates = MODEL_RATES_DEFAULT): number {
  return (
    (u.genInput / 1_000_000) * rates.genInputPerM +
    (u.genOutput / 1_000_000) * rates.genOutputPerM +
    (u.embed / 1_000_000) * rates.embedPerM
  );
}

/** Persisted cost ledger; windowSpend sums a rolling window (e.g. current day/week). */
export interface CostLedger {
  record(costUsd: number, meta: { model: string; correlationId: string }): Promise<void>;
  windowSpendUsd(): Promise<number>;
}

export interface CircuitConfig {
  ceilingUsd: number; // budget for the window (§8A ai.cost.ceiling)
  openAtFraction: number; // open before the ceiling (e.g. 0.95)
}

export const CIRCUIT_DEFAULTS: CircuitConfig = { ceilingUsd: 50, openAtFraction: 0.95 };

/** True when the breaker should OPEN (stop serving new AI requests). */
export function circuitOpen(spendUsd: number, cfg: CircuitConfig = CIRCUIT_DEFAULTS): boolean {
  return spendUsd >= cfg.ceilingUsd * cfg.openAtFraction;
}

/** In-memory ledger for unit tests. */
export class InMemoryCostLedger implements CostLedger {
  #spend = 0;
  async record(costUsd: number): Promise<void> {
    this.#spend += costUsd;
  }
  async windowSpendUsd(): Promise<number> {
    return this.#spend;
  }
}
