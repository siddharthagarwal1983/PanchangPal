/**
 * Guru transport abstraction (TDD Part 4 §7).
 */

export interface GuruTransport {
  stream(
    _question: string,
    _conversationId?: string
  ): AsyncIterable<string>;
}

export class NoopGuruTransport implements GuruTransport {
  stream(
    _question: string,
    _conversationId?: string
  ): AsyncIterable<string> {
    throw new Error('Guru transport not configured');
  }
}