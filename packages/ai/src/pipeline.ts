/**
 * RAG pipeline helpers (TDD Part 3 §5/§6) built on the provider adapters. These wrap the
 * LLM calls for scope classification and groundedness verification and parse their strict
 * JSON. Grounded-or-silent is enforced by the caller via confidenceGate (retrieval.ts) +
 * these checks. Retrieved text is treated as DATA, never instructions (§5.3).
 */
import type { LLMProvider } from './providers.js';
import { PROMPT_SCOPE_CLASSIFIER, PROMPT_GROUNDEDNESS_CHECK } from './prompts.js';
import type { ScopeDecision } from './scope.js';

function safeJson<T>(raw: string, fallback: T): T {
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    return match ? (JSON.parse(match[0]) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** Scope classification (§5.1). On classifier error, fail SAFE (treat as out-of-scope). */
export async function classifyScope(llm: LLMProvider, question: string): Promise<ScopeDecision> {
  try {
    const out = await llm.complete({ system: PROMPT_SCOPE_CLASSIFIER, prompt: question, temperature: 0 });
    return safeJson<ScopeDecision>(out, { in_scope: false, reason: 'classifier_unparseable' });
  } catch {
    return { in_scope: false, reason: 'classifier_error' };
  }
}

/** Groundedness post-check (§6.3, F-16). On judge error for a risk topic, fail SAFE (unsupported). */
export async function checkGroundedness(
  llm: LLMProvider,
  answer: string,
  context: string,
  opts: { failSafe: boolean } = { failSafe: true },
): Promise<{ supported: boolean; unsupported_spans?: string[] }> {
  try {
    const out = await llm.complete({
      system: PROMPT_GROUNDEDNESS_CHECK,
      prompt: `ANSWER:\n${answer}\n\nCONTEXT:\n${context}`,
      temperature: 0,
    });
    return safeJson(out, { supported: !opts.failSafe });
  } catch {
    return { supported: !opts.failSafe };
  }
}
