import { useCallback, useState } from 'react';
import { applyGuruStreamEvent, createGuruAnswerState, UnavailableGuruTransport, type GuruAnswerState, type GuruTransport } from '../../domain/guru';

const transport: GuruTransport = new UnavailableGuruTransport();

/** Client orchestration only. The server decides grounded/declined/refused outcomes. */
export function useAskGuru() {
  const [answer, setAnswer] = useState<GuruAnswerState | null>(null);
  const [question, setQuestion] = useState<string | null>(null);
  const ask = useCallback(async (value: string) => {
    setQuestion(value);
    let next = createGuruAnswerState();
    setAnswer(next);
    for await (const event of transport.stream(value)) { next = applyGuruStreamEvent(next, event); setAnswer(next); }
  }, []);
  return { answer, question, ask };
}
