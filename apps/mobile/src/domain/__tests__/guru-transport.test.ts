import { ProductionGuruTransport } from '../guru/ProductionGuruTransport';
import { getGuruTransport, GURU_LIVE } from '../guru/transportFactory';
import { UnavailableGuruTransport } from '../guru';
import { parseGuruSseFrame } from '../guru/sseParser';

function streamResponse(body: string): typeof fetch {
  return (async () =>
    new Response(new ReadableStream({ start(c) { c.enqueue(new TextEncoder().encode(body)); c.close(); } }), {
      status: 200,
      headers: { 'content-type': 'text/event-stream' },
    })) as unknown as typeof fetch;
}

describe('parseGuruSseFrame accepts the server data-only frame form', () => {
  it('reads the type from the JSON when there is no event line', () => {
    expect(parseGuruSseFrame('data: {"type":"token","text":"Om"}')).toEqual({ type: 'token', text: 'Om' });
    expect(parseGuruSseFrame('data: {"type":"done","outcome":"grounded"}')).toMatchObject({ type: 'done', outcome: 'grounded' });
  });
});

describe('ProductionGuruTransport (SSE-only; never fabricates)', () => {
  const endpoint = { url: 'https://x/ask-guru', anonKey: 'anon', getJwt: async () => 'jwt' };

  it('yields parsed token, sources, and done events from the stream', async () => {
    const body =
      'data: {"type":"token","text":"A "}\n\n' +
      'data: {"type":"token","text":"grounded answer"}\n\n' +
      'data: {"type":"sources","sources":[{"id":"1","title":"Reviewed source"}]}\n\n' +
      'data: {"type":"done","outcome":"grounded"}\n\n';
    const t = new ProductionGuruTransport({ ...endpoint, fetchImpl: streamResponse(body) });
    const events = [];
    for await (const e of t.stream('question')) events.push(e);
    expect(events.map((e) => e.type)).toEqual(['token', 'token', 'sources', 'done']);
  });

  it('yields a calm error event on network failure (no partial-as-complete)', async () => {
    const failing = (async () => { throw new Error('offline'); }) as unknown as typeof fetch;
    const t = new ProductionGuruTransport({ ...endpoint, fetchImpl: failing });
    const events = [];
    for await (const e of t.stream('q')) events.push(e);
    expect(events).toEqual([{ type: 'done', outcome: 'error', errorCode: 'ERR_AI_ERROR' }]);
  });

  it('maps a 504 to a timeout error', async () => {
    const timeout = (async () => new Response('', { status: 504 })) as unknown as typeof fetch;
    const t = new ProductionGuruTransport({ ...endpoint, fetchImpl: timeout });
    const events = [];
    for await (const e of t.stream('q')) events.push(e);
    expect(events).toEqual([{ type: 'done', outcome: 'error', errorCode: 'ERR_AI_TIMEOUT' }]);
  });
});

describe('Readiness gate', () => {
  it('is OFF until reviewed corpus + eval readiness (§10B)', () => {
    expect(GURU_LIVE).toBe(false);
  });
  it('returns the honest-decline transport while gated', () => {
    expect(getGuruTransport()).toBeInstanceOf(UnavailableGuruTransport);
  });
});
