import type { GuruStreamEvent } from './types';

export interface GuruTransport { stream(question: string, conversationId?: string): AsyncIterable<GuruStreamEvent>; }

/** Safe launch gate until reviewed corpus/evaluation readiness enables the production transport. */
export class UnavailableGuruTransport implements GuruTransport {
  async *stream(_question: string, _conversationId?: string): AsyncIterable<GuruStreamEvent> {
    yield { type: 'done', outcome: 'declined', errorCode: 'ERR_RAG_EMPTY' };
  }
}
