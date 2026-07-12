/**
 * AI Configuration Registry (TDD Part 3 §8A). Every operational AI parameter is
 * config-driven, versioned, server-tunable — NEVER hard-coded. These are the launch
 * DEFAULTS (AISET-2026.07); production reads them from the governed ai_config store.
 * Changing threshold / top_k / chunking requires an eval pass (§9) before promotion.
 */
export interface AiConfig {
  retrieval: {
    top_k: number; // T9
    ef_search: number;
    confidence_top: number; // top chunk cosine ≥ this
    confidence_support: number; // ≥2 chunks ≥ this (F-6)
  };
  chunk: { size_tokens: number; overlap_pct: number };
  context: { max_tokens: number };
  generation: { temperature: number; max_output_tokens: number };
  streaming: { enabled: boolean };
  groundedness: { enabled: boolean; risk_topics: string[] };
}

/** Launch defaults — TDD Part 3 §4.4/§8A (F-6/F-16 resolved as calibrated, tunable values). */
export const AI_CONFIG_DEFAULTS: AiConfig = {
  retrieval: { top_k: 6, ef_search: 40, confidence_top: 0.78, confidence_support: 0.72 },
  chunk: { size_tokens: 350, overlap_pct: 0.15 },
  context: { max_tokens: 2000 },
  generation: { temperature: 0.25, max_output_tokens: 600 },
  streaming: { enabled: true },
  groundedness: { enabled: true, risk_topics: ['dates', 'procedures', 'mantras'] },
};
