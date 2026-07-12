/**
 * Retrieval confidence gate (TDD Part 3 §4.4 — resolves F-6). Pure decision over the
 * top-k cosine similarities: answer only when the top chunk clears `confidence_top`
 * AND at least 2 chunks clear `confidence_support`. Below → honest decline
 * (ERR_RAG_LOW_CONFIDENCE); empty → ERR_RAG_EMPTY. Tunable via AiConfig, never hard-coded.
 */
import type { AiConfig } from './config.js';

export interface ScoredChunk {
  content_chunk_id: string;
  title: string;
  score: number; // cosine similarity
}

export type RetrievalOutcome =
  | { decision: 'answer'; sources: ScoredChunk[] }
  | { decision: 'decline'; reason: 'ERR_RAG_LOW_CONFIDENCE' }
  | { decision: 'decline'; reason: 'ERR_RAG_EMPTY' };

export function confidenceGate(chunks: ScoredChunk[], cfg: AiConfig['retrieval']): RetrievalOutcome {
  if (chunks.length === 0) return { decision: 'decline', reason: 'ERR_RAG_EMPTY' };
  const sorted = [...chunks].sort((a, b) => b.score - a.score);
  const topOk = sorted[0]!.score >= cfg.confidence_top;
  const supportOk = sorted.filter((c) => c.score >= cfg.confidence_support).length >= 2;
  if (topOk && supportOk) return { decision: 'answer', sources: sorted };
  return { decision: 'decline', reason: 'ERR_RAG_LOW_CONFIDENCE' };
}
