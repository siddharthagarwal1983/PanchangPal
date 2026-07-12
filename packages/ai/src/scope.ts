/**
 * Scope + refusal taxonomy (TDD Part 3 §5.1/§5.4). The classifier itself is an LLM call
 * (PROMPT_SCOPE_CLASSIFIER, §5A) via LLMProvider; these are the deterministic types and
 * the answer-outcome enum shared across the pipeline. Retrieved text is treated as DATA,
 * never instructions (prompt-injection defense, §5.3).
 */

/** Terminal outcome recorded on TBL_MESSAGE.outcome (matches message_outcome enum). */
export type AnswerOutcome = 'grounded' | 'declined' | 'refused' | 'error';

export interface ScopeDecision {
  in_scope: boolean;
  topic?: string;
  reason?: string;
}

/** Out-of-scope categories that always refuse (EVT_034). Not exhaustive — the classifier decides. */
export const OUT_OF_SCOPE = [
  'astrology_prediction',
  'kundli_horoscope',
  'medical',
  'legal',
  'financial',
  'political',
  'personal_prediction',
  'individual_religious_authority',
] as const;
