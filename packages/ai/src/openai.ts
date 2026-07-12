/**
 * Concrete OpenAI implementations of the provider adapters (ADR-011; TDD Part 3 §2A).
 * SERVER-ONLY — constructed with OPENAI_API_KEY inside Edge Functions; never bundled into
 * the app. Uses fetch (available in Deno + Node 20), so no vendor SDK dependency.
 *
 * MODEL_GEN_PRIMARY = gpt-5-mini · MODEL_EMBED_PRIMARY = text-embedding-3-small (1536).
 */
import type { EmbeddingProvider, GenerateOptions, LLMProvider } from './providers.js';

const OPENAI_BASE = 'https://api.openai.com/v1';

interface OpenAiOptions {
  apiKey: string;
  generationModel?: string;
  embeddingModel?: string;
  fetchImpl?: typeof fetch;
}

export class OpenAiLLMProvider implements LLMProvider {
  readonly modelId: string;
  #apiKey: string;
  #fetch: typeof fetch;

  constructor(opts: OpenAiOptions) {
    this.#apiKey = opts.apiKey;
    this.modelId = opts.generationModel ?? 'gpt-5-mini';
    this.#fetch = opts.fetchImpl ?? fetch;
  }

  async *stream(opts: GenerateOptions): AsyncIterable<string> {
    const res = await this.#fetch(`${OPENAI_BASE}/chat/completions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${this.#apiKey}` },
      body: JSON.stringify({
        model: this.modelId,
        temperature: opts.temperature ?? 0.25,
        max_tokens: opts.maxOutputTokens ?? 600,
        stream: true,
        messages: [
          { role: 'system', content: opts.system },
          { role: 'user', content: opts.prompt },
        ],
      }),
    });
    if (!res.ok || !res.body) throw new Error(`openai_stream_${res.status}`);
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    for (; ;) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        const s = line.trim();
        if (!s.startsWith('data:')) continue;
        const payload = s.slice(5).trim();
        if (payload === '[DONE]') return;
        try {
          const delta = JSON.parse(payload).choices?.[0]?.delta?.content;
          if (delta) yield delta as string;
        } catch {
          // ignore keep-alive / partial frames
        }
      }
    }
  }

  async complete(opts: GenerateOptions): Promise<string> {
    const res = await this.#fetch(`${OPENAI_BASE}/chat/completions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${this.#apiKey}` },
      body: JSON.stringify({
        model: this.modelId,
        temperature: opts.temperature ?? 0,
        max_tokens: opts.maxOutputTokens ?? 256,
        messages: [
          { role: 'system', content: opts.system },
          { role: 'user', content: opts.prompt },
        ],
      }),
    });
    if (!res.ok) throw new Error(`openai_complete_${res.status}`);
    const data = (await res.json()) as {
      choices?: {
        message?: {
          content?: string;
        };
      }[];
    };

    return data.choices?.[0]?.message?.content ?? '';
  }
}

export class OpenAiEmbeddingProvider implements EmbeddingProvider {
  readonly modelId: string;
  readonly dimensions = 1536 as const;
  #apiKey: string;
  #fetch: typeof fetch;

  constructor(opts: OpenAiOptions) {
    this.#apiKey = opts.apiKey;
    this.modelId = opts.embeddingModel ?? 'text-embedding-3-small';
    this.#fetch = opts.fetchImpl ?? fetch;
  }

  async embed(texts: string[]): Promise<number[][]> {
    const res = await this.#fetch(`${OPENAI_BASE}/embeddings`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${this.#apiKey}` },
      body: JSON.stringify({ model: this.modelId, input: texts }),
    });
    if (!res.ok) throw new Error(`openai_embed_${res.status}`);
    const data = (await res.json()) as {
      data: {
        embedding: number[];
      }[];
    };

    return data.data.map((d) => d.embedding);
  }
}

/** Factory used by SVC_ask_guru / SVC_content_ingest with the server-side key. */
export function createOpenAiProviders(apiKey: string, fetchImpl?: typeof fetch) {
  return {
    llm: new OpenAiLLMProvider({ apiKey, fetchImpl }),
    embeddings: new OpenAiEmbeddingProvider({ apiKey, fetchImpl }),
  };
}
