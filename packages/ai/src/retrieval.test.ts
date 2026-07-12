import { describe, it, expect } from 'vitest';
import { confidenceGate, type ScoredChunk } from './retrieval';
import { AI_CONFIG_DEFAULTS } from './config';

const cfg = AI_CONFIG_DEFAULTS.retrieval;
const chunk = (id: string, score: number): ScoredChunk => ({
  content_chunk_id: id,
  title: id,
  score,
});

describe('confidenceGate (TDD Part 3 §4.4, F-6)', () => {
  it('declines on empty retrieval (ERR_RAG_EMPTY)', () => {
    expect(confidenceGate([], cfg)).toEqual({ decision: 'decline', reason: 'ERR_RAG_EMPTY' });
  });

  it('answers when top ≥ 0.78 AND ≥2 chunks ≥ 0.72', () => {
    const r = confidenceGate([chunk('a', 0.81), chunk('b', 0.74), chunk('c', 0.5)], cfg);
    expect(r.decision).toBe('answer');
  });

  it('declines when top is strong but support is thin', () => {
    const r = confidenceGate([chunk('a', 0.9), chunk('b', 0.5)], cfg);
    expect(r).toEqual({ decision: 'decline', reason: 'ERR_RAG_LOW_CONFIDENCE' });
  });

  it('declines when nothing clears the top threshold', () => {
    const r = confidenceGate([chunk('a', 0.6), chunk('b', 0.55)], cfg);
    expect(r).toEqual({ decision: 'decline', reason: 'ERR_RAG_LOW_CONFIDENCE' });
  });
});
