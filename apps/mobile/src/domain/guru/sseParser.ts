import type { GuruOutcome, GuruSource, GuruStreamEvent } from './types';

/**
 * Parses one complete SSE frame from SVC_ask_guru. Accepts BOTH forms:
 *  - named-event:  `event: token\ndata: {"text":"…"}`
 *  - data-only:    `data: {"type":"token","text":"…"}`  (the form SVC_ask_guru emits, TDD Part 2 §5.4)
 * The event type is the `event:` line if present, else the JSON `type` field. Unknown/malformed
 * data is discarded (null) — never guessed; the server owns the outcome.
 */
export function parseGuruSseFrame(frame: string): GuruStreamEvent | null {
  const eventLine = frame.match(/^event:\s*(\w+)$/m)?.[1];
  const data = frame.match(/^data:\s*(.+)$/m)?.[1];
  if (!data) return null;
  try {
    const value = JSON.parse(data) as unknown;
    if (!isObject(value)) return null;
    const event = eventLine ?? (typeof value.type === 'string' ? value.type : undefined);
    if (event === 'token' && typeof value.text === 'string') return { type: 'token', text: value.text };
    if (event === 'sources' && Array.isArray(value.sources)) return { type: 'sources', sources: value.sources.flatMap(toSource) };
    if (event === 'done' && isOutcome(value.outcome)) return { type: 'done', outcome: value.outcome, messageId: typeof value.message_id === 'string' ? value.message_id : undefined, errorCode: typeof value.error_code === 'string' ? value.error_code : undefined };
  } catch { return null; }
  return null;
}

function isObject(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === 'object'; }
function isOutcome(value: unknown): value is GuruOutcome { return value === 'grounded' || value === 'declined' || value === 'refused' || value === 'error'; }
function toSource(value: unknown): GuruSource[] { return isObject(value) && typeof value.id === 'string' && typeof value.title === 'string' ? [{ id: value.id, title: value.title }] : []; }
