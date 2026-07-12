/**
 * HOOK_useChecklist + useToggleChecklistItem (TDD Part 4 §5.2/§6.3) — daily checklist read +
 * OPTIMISTIC toggle. The toggle updates the Query cache immediately, enqueues the mutation in
 * STORE_offlineQueue (drained by SVC_sync), and reverts the cache on error (CMP_CHECKLIST
 * offline/error states). client_id gives idempotency.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { randomUUID } from 'expo-crypto';
import { todayRepository, type ChecklistItemDto } from '../todayRepository';
import { useOfflineQueueStore } from '../../store/offlineQueue';

export function useChecklist(localDate: string) {
  return useQuery<ChecklistItemDto[]>({
    queryKey: ['checklist', localDate],
    queryFn: () => todayRepository.getChecklist(localDate),
    staleTime: 5 * 60 * 1000,
  });
}

export function useToggleChecklistItem(localDate: string) {
  const qc = useQueryClient();
  const enqueue = useOfflineQueueStore((s) => s.enqueue);
  const key = ['checklist', localDate] as const;

  return useMutation({
    mutationFn: async (itemId: string) => {
      const client_id = randomUUID();
      enqueue({ id: client_id, kind: 'checklist', payload: { item_id: itemId, local_date: localDate }, client_id, local_ts: new Date().toISOString(), attempts: 0 });
      await todayRepository.toggleChecklist({ item_id: itemId, local_date: localDate, client_id });
    },
    onMutate: async (itemId) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<ChecklistItemDto[]>(key);
      qc.setQueryData<ChecklistItemDto[]>(key, (old) => (old ?? []).map((i) => (i.id === itemId ? { ...i, complete: !i.complete } : i)));
      return { prev };
    },
    onError: (_e, _itemId, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev); // revert (CMP_CHECKLIST error state)
    },
  });
}
