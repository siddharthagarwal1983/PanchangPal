/**
 * Provider adapters (ADR-011; TDD Part 3 §2A Model Registry). All model access goes
 * through these interfaces — no direct SDK calls in feature code. Concrete OpenAI impls
 * (GPT-5 mini + text-embedding-3-small) are constructed server-side with the API key.
 */

export interface GenerateOptions {
  system: string;
  prompt: string;
  temperature?: number; // ~0.2–0.3 (§6.1)
  maxOutputTokens?: number;
}

export interface LLMProvider {
  readonly modelId: string; // e.g. MODEL_GEN_PRIMARY
  /** Streaming generation (ADR-019). Yields answer tokens. */
  stream(opts: GenerateOptions): AsyncIterable<string>;
  /** Non-streaming completion (classifier / groundedness judge). */
  complete(opts: GenerateOptions): Promise<string>;
}

export interface EmbeddingProvider {
  readonly modelId: string; // MODEL_EMBED_PRIMARY
  readonly dimensions: 1536; // text-embedding-3-small (dimension-locked to corpus)
  embed(texts: string[]): Promise<number[][]>;
}

/** Registry IDs (TDD Part 3 §2A) — stable references, never inline model strings. */
export const MODEL_IDS = {
  generation: 'MODEL_GEN_PRIMARY',
  embedding: 'MODEL_EMBED_PRIMARY',
  classifier: 'MODEL_CLASSIFIER',
  judge: 'MODEL_JUDGE',
} as const;
