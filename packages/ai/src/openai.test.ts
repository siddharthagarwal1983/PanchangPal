import { describe, it, expect } from 'vitest';
import { OpenAiLLMProvider, OpenAiEmbeddingProvider } from './openai';
import { classifyScope, checkGroundedness } from './pipeline';

/** Build a mock fetch returning an SSE chat-completions stream. */
function mockStreamFetch(deltas: string[]): typeof fetch {
  const frames = deltas
    .map((d) => `data: ${JSON.stringify({ choices: [{ delta: { content: d } }] })}\n`)
    .join('\n') + '\ndata: [DONE]\n';
  return (async () =>
    new Response(new ReadableStream({
      start(c) { c.enqueue(new TextEncoder().encode(frames)); c.close(); },
    }), { status: 200 })) as unknown as typeof fetch;
}

function mockJsonFetch(body: unknown): typeof fetch {
  return (async () => new Response(JSON.stringify(body), { status: 200 })) as unknown as typeof fetch;
}

describe('OpenAI adapters (ADR-011)', () => {
  it('parses SSE deltas from the streaming chat API', async () => {
    const llm = new OpenAiLLMProvider({ apiKey: 'k', fetchImpl: mockStreamFetch(['Hel', 'lo', '!']) });
    const out: string[] = [];
    for await (const t of llm.stream({ system: 's', prompt: 'p' })) out.push(t);
    expect(out.join('')).toBe('Hello!');
  });

  it('returns 1536-dim embeddings', async () => {
    const emb = new OpenAiEmbeddingProvider({
      apiKey: 'k',
      fetchImpl: mockJsonFetch({ data: [{ embedding: Array(1536).fill(0.1) }] }),
    });
    expect(emb.dimensions).toBe(1536);
    const [v] = await emb.embed(['hi']);
    expect(v).toHaveLength(1536);
  });
});

describe('RAG pipeline helpers fail safe (TDD Part 3 §5/§6)', () => {
  const llmOk = new OpenAiLLMProvider({ apiKey: 'k', fetchImpl: mockJsonFetch({ choices: [{ message: { content: '{"in_scope": true, "topic": "festival"}' } }] }) });
  const llmErr = new OpenAiLLMProvider({ apiKey: 'k', fetchImpl: (async () => new Response('nope', { status: 500 })) as unknown as typeof fetch });

  it('classifyScope parses JSON and fails safe on error', async () => {
    expect((await classifyScope(llmOk, 'when is diwali')).in_scope).toBe(true);
    expect((await classifyScope(llmErr, 'x')).in_scope).toBe(false); // fail safe = out of scope
  });

  it('checkGroundedness fails safe (unsupported) on judge error for risk topics', async () => {
    expect((await checkGroundedness(llmErr, 'a', 'c', { failSafe: true })).supported).toBe(false);
  });
});
