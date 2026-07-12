import type { GuruOutcome, GuruSource, GuruStreamEvent } from './types';

/** Parses one complete SSE frame. Unknown/malformed data is discarded instead of guessed. */
export function parseGuruSseFrame(frame: string): GuruStreamEvent | null {
  const event = frame.match(/^event:\s*(\w+)$/m)?.[1];
  const data = frame.match(/^data:\s*(.+)$/m)?.[1];
  if (!event || !data) return null;
  try {
    const value = JSON.parse(data) as unknown;
    if (event === 'token' && isObject(value) && typeof value.text === 'string') return { type: 'token', text: value.text };
    if (event === 'sources' && isObject(value) && Array.isArray(value.sources)) return { type: 'sources', sources: value.sources.flatMap(toSource) };
    if (event === 'done' && isObject(value) && isOutcome(value.outcome)) return { type: 'done', outcome: value.outcome, messageId: typeof value.message_id === 'string' ? value.message_id : undefined, errorCode: typeof value.error_code === 'string' ? value.error_code : undefined };
  } catch { return null; }
  return null;
}

function isObject(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === 'object'; }
function isOutcome(value: unknown): value is GuruOutcome { return value === 'grounded' || value === 'declined' || value === 'refused' || value === 'error'; }
function toSource(value: unknown): GuruSource[] { return isObject(value) && typeof value.id === 'string' && typeof value.title === 'string' ? [{ id: value.id, title: value.title }] : []; }
