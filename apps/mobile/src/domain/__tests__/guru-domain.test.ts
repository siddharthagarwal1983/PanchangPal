import { applyGuruStreamEvent, createGuruAnswerState, parseGuruSseFrame, UnavailableGuruTransport } from '../guru';

describe('Ask Guru stream domain', () => {
  it('parses and applies only valid server events', () => {
    const token = parseGuruSseFrame('event: token\ndata: {"text":"Namaste"}');
    expect(token).toEqual({ type: 'token', text: 'Namaste' });
    expect(applyGuruStreamEvent(createGuruAnswerState(), token!)).toMatchObject({ text: 'Namaste', isStreaming: true });
    expect(parseGuruSseFrame('event: token\ndata: not-json')).toBeNull();
  });

  it('uses a safe honest-decline transport until the server readiness gate permits streaming', async () => {
    const events = [] as unknown[];
    for await (const event of new UnavailableGuruTransport().stream('Question')) events.push(event);
    expect(events).toEqual([{ type: 'done', outcome: 'declined', errorCode: 'ERR_RAG_EMPTY' }]);
  });
});
