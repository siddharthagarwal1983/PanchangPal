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

export function useCompleteRitual(localDate: string) {
  const qc = useQueryClient();
  const enqueue = useOfflineQueueStore((s) => s.enqueue);

  return useMutation({
    mutationFn: async (ritualId: string) => {
      const client_id = randomUUID();
      enqueue({ id: client_id, kind: 'ritual_complete', payload: { ritual_id: ritualId, local_date: localDate }, client_id, local_ts: new Date().toISOString(), attempts: 0 });
      return todayRepository.completeRitual({ ritual_id: ritualId, local_date: localDate, client_id, idempotency_key: client_id });
    },
    onSuccess: (streak) => {
      qc.setQueryData(['streak', localDate], streak); // reconcile from server truth
    },
  });
}
