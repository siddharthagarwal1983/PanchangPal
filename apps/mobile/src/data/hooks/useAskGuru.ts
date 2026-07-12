import { useCallback, useState } from 'react';
import { randomUUID } from 'expo-crypto';
import {
  applyGuruStreamEvent,
  createGuruAnswerState,
  getGuruTransport,
  guruHistoryRepository,
  type GuruAnswerState,
} from '../../domain/guru';

/**
 * Client orchestration only (TDD Part 4 §7.1). Streams from the readiness-gated transport
 * (getGuruTransport → UnavailableGuruTransport until §10B). The SERVER decides the outcome
 * (grounded/declined/refused/error); the client never fabricates an answer or calls an LLM.
 * On completion the question + outcome are recorded to local history (SCR_GURU_HISTORY_001).
 */
export function useAskGuru() {
  const [answer, setAnswer] = useState<GuruAnswerState | null>(null);
  const [question, setQuestion] = useState<string | null>(null);
  const [lastAsked, setLastAsked] = useState<string | null>(null);

  const ask = useCallback(async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setQuestion(trimmed);
    setLastAsked(trimmed);
    let next = createGuruAnswerState();
    setAnswer(next);
    for await (const event of getGuruTransport().stream(trimmed)) {
      next = applyGuruStreamEvent(next, event);
      setAnswer(next);
    }
    guruHistoryRepository.record({
      id: randomUUID(),
      question: trimmed,
      outcome: next.outcome ?? 'error',
      createdAt: new Date().toISOString(),
    });
  }, []);

  const retry = useCallback(() => {
    if (lastAsked) void ask(lastAsked);
  }, [ask, lastAsked]);

  return { answer, question, ask, retry };
}
