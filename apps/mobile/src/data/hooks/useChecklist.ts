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
import { pendingChecklistItemIds } from '../../domain/sync';

/**
 * `localDate` is nullable because the day is not known until the user's time zone resolves
 * (ADR-026, issue #30). The query stays DISABLED until then rather than falling back to a
 * UTC date — fetching the wrong day would fill the cache with another day's checklist and
 * show it as today's.
 */
export function useChecklist(localDate: string | null) {
  return useQuery<ChecklistItemDto[]>({
    queryKey: ['checklist', localDate],
    queryFn: () => todayRepository.getChecklist(localDate as string),
    enabled: !!localDate,
    staleTime: 5 * 60 * 1000,
  });
}

export function useToggleChecklistItem(localDate: string | null) {
  const qc = useQueryClient();
  const enqueue = useOfflineQueueStore((s) => s.enqueue);
  const key = ['checklist', localDate] as const;

  return useMutation({
    mutationFn: async (itemId: string) => {
      // Unreachable in practice — the screen renders its loading state until the day is
      // known, so nothing is tappable. Explicit because writing a completion against a
      // guessed date is exactly the defect this change removes, and silence would let a
      // future caller reintroduce it.
      if (!localDate) throw new Error('Cannot record a checklist item before the local date is known');
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
    onError: (_e, itemId, ctx) => {
      // DO NOT REVERT A COMPLETION THAT IS STILL DURABLY QUEUED (§6).
      //
      // The mutation is enqueued BEFORE the direct write is attempted, so the two failures look
      // identical from here and are not: offline, the direct write always fails while the queued
      // entry is intact and will be delivered by the drain. Reverting there told the user their
      // completion was lost when it was not — the tick blinking out seconds after they tapped it,
      // with the mutation sitting safely on disk the whole time.
      //
      // Keying on the queue rather than on the error avoids string-matching a vendor's network
      // message, which changes between supabase-js releases; the queue is this app's own state and
      // is exactly the thing that decides whether the completion still has a delivery path.
      //
      // Once the drain retires the entry, SERVER TRUTH is what corrects the display —
      // `useOfflineSync`'s `onServerState` invalidates `['checklist']` and the refetch overwrites
      // whatever is shown here. So a mutation the server ultimately rejects still converges, by
      // the server-authoritative path rather than by a client-side guess.
      const stillQueued = pendingChecklistItemIds(
        useOfflineQueueStore.getState().queue,
        localDate,
      ).has(itemId);
      if (stillQueued) return;
      if (ctx?.prev) qc.setQueryData(key, ctx.prev); // revert (CMP_CHECKLIST error state)
    },
  });
}
