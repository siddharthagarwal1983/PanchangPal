/**
 * Deterministic content chunker (TDD Part 3 §3.3). Target ~350 tokens/chunk with ~15%
 * overlap, split on natural boundaries (paragraphs). Deterministic (pure function of text
 * + config) so re-ingestion is reproducible and diffable. Token count is approximated as
 * words * 1.3 (good enough for sizing; the embedding model does exact tokenization).
 * Vitest-testable.
 */
export interface Chunk {
  index: number;
  text: string;
  approxTokens: number;
}

const TOKENS_PER_WORD = 1.3;

function approxTokens(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.round(words * TOKENS_PER_WORD);
}

export function chunkText(text: string, targetTokens = 350, overlapPct = 0.15): Chunk[] {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (paragraphs.length === 0) return [];

  const chunks: Chunk[] = [];
  let buffer: string[] = [];
  let bufTokens = 0;
  const overlapTokens = Math.round(targetTokens * overlapPct);

  const flush = () => {
    if (buffer.length === 0) return;
    const textBlock = buffer.join('\n\n');
    chunks.push({ index: chunks.length, text: textBlock, approxTokens: approxTokens(textBlock) });
  };

  for (const p of paragraphs) {
    const t = approxTokens(p);
    if (bufTokens + t > targetTokens && buffer.length > 0) {
      flush();
      // carry overlap: keep trailing paragraphs up to ~overlapTokens
      const carried: string[] = [];
      let carriedTokens = 0;
      for (let i = buffer.length - 1; i >= 0 && carriedTokens < overlapTokens; i--) {
        carried.unshift(buffer[i]!);
        carriedTokens += approxTokens(buffer[i]!);
      }
      buffer = [...carried];
      bufTokens = carriedTokens;
    }
    buffer.push(p);
    bufTokens += t;
  }
  flush();
  return chunks;
}
