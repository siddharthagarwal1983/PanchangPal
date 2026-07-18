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

/**
 * Used while the server readiness gate is OFF (GURU_LIVE=false): never contacts a model and never
 * fabricates an answer — it yields a single honest-decline `done` event so the client shows the
 * calm "no verified answer" state (TDD Part 3 §9/§10B).
 */
export class UnavailableGuruTransport implements GuruTransport {
  async *stream(
    _question: string,
    _conversationId?: string
  ): AsyncIterable<GuruStreamEvent> {
    yield { type: 'done', outcome: 'declined', errorCode: 'ERR_RAG_EMPTY' };
  }
}