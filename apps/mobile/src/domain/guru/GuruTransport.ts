/**
 * Guru transport abstraction (TDD Part 4 §7).
 */

import type { GuruStreamEvent } from "./types";

export interface GuruTransport {
  stream(
    question: string,
    conversationId?: string
  ): AsyncIterable<GuruStreamEvent>;
}

export class UnavailableGuruTransport implements GuruTransport {
  stream(
    _question: string,
    _conversationId?: string
  ): AsyncIterable<GuruStreamEvent> {
    throw new Error('Guru transport not configured');
  }
}