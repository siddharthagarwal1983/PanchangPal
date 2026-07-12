/**
 * @panchangpal/ai — server-shared RAG building blocks behind the LLMProvider /
 * EmbeddingProvider adapters (ADR-011). SERVER-ONLY: the mobile app must never import
 * this package or the OpenAI SDK (ADR-006). Grounded-or-silent is enforced here
 * (ADR-004); prompts, embeddings, and reasoning are never exposed (ADR-031).
 */
export * from './providers.js';
export * from './openai.js';
export * from './prompts.js';
export * from './pipeline.js';
export * from './config.js';
export * from './retrieval.js';
export * from './scope.js';
export * from './ratelimit.js';
export * from './cost.js';
