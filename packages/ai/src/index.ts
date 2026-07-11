/**
 * @panchangpal/ai — server-shared RAG building blocks (prompt builder, scope
 * guardrails, retrieval helpers) behind the LLMProvider/EmbeddingProvider adapters
 * (ADR-011). SERVER-ONLY: the mobile app must never import this package or the
 * OpenAI SDK (ADR-006). Grounded-or-silent is enforced here (ADR-004); prompts,
 * embeddings, and reasoning are never exposed (ADR-031).
 *
 * The concrete prompt/guardrail/eval spec is authored in TDD Part 3; this is the
 * package seam so SVC_ask_guru and SVC_content_ingest share one implementation.
 */

/** Adapter seam for LLM generation (ADR-011). Concrete impl added in TDD Part 3. */
export interface LLMProvider {
  readonly model: string;
}

/** Adapter seam for embeddings — text-embedding-3-small, 1536 dims (ADR-011). */
export interface EmbeddingProvider {
  readonly model: string;
  readonly dimensions: 1536;
}
