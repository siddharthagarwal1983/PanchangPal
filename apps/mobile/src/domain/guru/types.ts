/** Trust-safe vocabulary for the Ask Guru client. Server outcomes are never inferred on device. */
export type GuruOutcome = 'grounded' | 'declined' | 'refused' | 'error';

export interface GuruSource { id: string; title: string; }
export interface GuruAnswerState { text: string; outcome: GuruOutcome | null; sources: readonly GuruSource[]; isStreaming: boolean; }
export type GuruStreamEvent = { type: 'token'; text: string } | { type: 'sources'; sources: readonly GuruSource[] } | { type: 'done'; outcome: GuruOutcome; messageId?: string; errorCode?: string };

export function createGuruAnswerState(): GuruAnswerState {
  return { text: '', outcome: null, sources: [], isStreaming: true };
}

export function applyGuruStreamEvent(state: GuruAnswerState, event: GuruStreamEvent): GuruAnswerState {
  if (event.type === 'token') return { ...state, text: `${state.text}${event.text}` };
  if (event.type === 'sources') return { ...state, sources: event.sources };
  return { ...state, outcome: event.outcome, isStreaming: false };
}
