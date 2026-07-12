/**
 * @panchangpal/ai — server-shared RAG building blocks behind the LLMProvider /
 * EmbeddingProvider adapters (ADR-011). SERVER-ONLY: the mobile app must never import
 * this package or the OpenAI SDK (ADR-006). Grounded-or-silent is enforced here
 * (ADR-004); prompts, embeddings, and reasoning are never exposed (ADR-031).
 *
 * The concrete OpenAI implementations of the adapters are added with live keys in the
 * backend deploy; this package defines the interfaces, the prompt/config registries
 * (TDD Part 3 §2A/§5A/§8A), the retrieval confidence gate (§4.4, F-6), and the scope /
 * refusal taxonomy (§5) so SVC_ask_guru and SVC_content_ingest share one implementation.
 */
export * from './providers.js';
export * from './config.js';
export * from './retrieval.js';
export * from './scope.js';
