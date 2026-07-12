/**
 * ProductionGuruTransport — the real client SSE adapter to SVC_ask_guru (TDD Part 4 §7.1,
 * ADR-019). It ONLY streams from the server: it never calls an LLM, never fabricates an
 * answer, and never infers an outcome (the server decides grounded/declined/refused/error).
 * On network failure it yields a terminal `error` event so the UI recovers calmly (no
 * partial-as-complete). Gated behind the readiness flag (see transportFactory) so it is not
 * live until reviewed corpus + eval readiness permit.
 */
import type { GuruStreamEvent } from './types';
import type { GuruTransport } from './GuruTransport';
import { parseGuruSseFrame } from './sseParser';

export interface GuruEndpoint {
  url: string; // `${SUPABASE_FUNCTIONS_URL}/ask-guru`
  anonKey: string;
  getJwt: () => Promise<string | null>;
  fetchImpl?: typeof fetch;
}

export class ProductionGuruTransport implements GuruTransport {
  constructor(private endpoint: GuruEndpoint) {}

  async *stream(question: string, conversationId?: string): AsyncIterable<GuruStreamEvent> {
    const fetchImpl = this.endpoint.fetchImpl ?? fetch;
    const jwt = await this.endpoint.getJwt();
    let res: Response;
    try {
      res = await fetchImpl(this.endpoint.url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          accept: 'text/event-stream',
          apikey: this.endpoint.anonKey,
          authorization: `Bearer ${jwt ?? this.endpoint.anonKey}`,
        },
        body: JSON.stringify({ question, conversation_id: conversationId, idempotency_key: cryptoRandom() }),
      });
    } catch {
      yield { type: 'done', outcome: 'error', errorCode: 'ERR_AI_ERROR' };
      return;
    }

    if (!res.ok || !res.body) {
      yield { type: 'done', outcome: 'error', errorCode: res.status === 504 ? 'ERR_AI_TIMEOUT' : 'ERR_AI_ERROR' };
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    try {
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let boundary = buffer.indexOf('\n\n');
        while (boundary !== -1) {
          const frame = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);
          const event = parseGuruSseFrame(frame);
          if (event) yield event;
          boundary = buffer.indexOf('\n\n');
        }
      }
    } catch {
      yield { type: 'done', outcome: 'error', errorCode: 'ERR_AI_ERROR' }; // mid-stream drop → calm error, no partial-as-complete
    }
  }
}

function cryptoRandom(): string {
  const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  return c?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
