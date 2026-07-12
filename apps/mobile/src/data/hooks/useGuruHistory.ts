/**
 * useGuruHistory — reads the local Guru conversation history (SCR_GURU_HISTORY_001). Local +
 * synchronous; refresh() re-reads after a new question is recorded. Owner-only, offline-readable.
 */
import { useCallback, useState } from 'react';
import { guruHistoryRepository, type ConversationSummary } from '../../domain/guru';

export function useGuruHistory() {
  const [items, setItems] = useState<ConversationSummary[]>(() => guruHistoryRepository.list());
  const refresh = useCallback(() => setItems(guruHistoryRepository.list()), []);
  return { items, refresh };
}
