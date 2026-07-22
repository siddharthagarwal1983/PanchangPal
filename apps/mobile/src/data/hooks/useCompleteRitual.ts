/**
 * HOOK_useCompleteRitual (TDD Part 4 §5.2/§6.3) — completes today's ritual OPTIMISTICALLY:
 * enqueues in STORE_offlineQueue (drained by SVC_sync), calls API_POST_RITUAL_COMPLETE, and
 * reconciles the streak from server truth (streak is server-derived, never client-set).
 * Idempotent via client_id (client-authoritative daily completion, PDD A4).
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { randomUUID } from 'expo-crypto';
import { todayRepository } from '../todayRepository';
import { useOfflineQueueStore } from '../../store/offlineQueue';

/**
 * `localDate` is nullable because the day is not known until the user's time zone resolves
 * (ADR-026, issue #30). A completion is the highest-stakes place to get the date wrong: it
 * carries a one-per-day uniqueness constraint and feeds the streak.
 */
export function useCompleteRitual(localDate: string | null) {
  const qc = useQueryClient();
  const enqueue = useOfflineQueueStore((s) => s.enqueue);

  return useMutation({
    mutationFn: async (ritualId: string) => {
      // Unreachable while the screen holds its loading state until the day is known. Explicit
      // rather than silent: recording a completion against a guessed day would land it on the
      // wrong date, and the unique constraint would then block the real one.
      if (!localDate) throw new Error('Cannot complete a ritual before the local date is known');
      const client_id = randomUUID();
      enqueue({ id: client_id, kind: 'ritual_complete', payload: { ritual_id: ritualId, local_date: localDate }, client_id, local_ts: new Date().toISOString(), attempts: 0 });
      return todayRepository.completeRitual({ ritual_id: ritualId, local_date: localDate, client_id, idempotency_key: client_id });
    },
    onSuccess: (streak) => {
      qc.setQueryData(['streak', localDate], streak); // reconcile from server truth
    },
  });
}
