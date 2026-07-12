import { describe, it, expect } from 'vitest';
import { chunkText } from './chunker';

const para = (n: number) => Array.from({ length: n }, (_, i) => `word${i}`).join(' ');

describe('content chunker (TDD Part 3 §3.3)', () => {
  it('returns [] for empty text', () => {
    expect(chunkText('')).toEqual([]);
  });

  it('keeps a small document as a single chunk', () => {
    const chunks = chunkText('a short paragraph about diwali');
    expect(chunks).toHaveLength(1);
    expect(chunks[0].index).toBe(0);
  });

  it('splits a long document into multiple ~target-sized chunks with sequential indexes', () => {
    // 5 paragraphs of ~200 words (~260 tokens) each → exceeds 350-token target repeatedly.
    const doc = Array.from({ length: 5 }, () => para(200)).join('\n\n');
    const chunks = chunkText(doc, 350, 0.15);
    expect(chunks.length).toBeGreaterThan(1);
    chunks.forEach((c, i) => expect(c.index).toBe(i));
  });

  it('is deterministic (same input → identical chunks)', () => {
    const doc = Array.from({ length: 4 }, () => para(180)).join('\n\n');
    expect(chunkText(doc)).toEqual(chunkText(doc));
  });
});
