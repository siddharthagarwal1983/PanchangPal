/**
 * Account-deletion hooks (MOD_you; TDD Part 4 §5; openapi API_POST_ACCOUNT_DELETE / REAUTH /
 * HOUSEHOLD_TRANSFER). Thin seams over accountRepository:
 *  - useTransferOwnership: hand the household to another member (F-3 pre-step); refreshes household.
 *  - useRequestDeletion: reauth → request grace-window deletion → sign back into an ANON session so
 *    the offline daily loop keeps working during the grace window (deferred auth, UX-2). The screen
 *    surfaces the scheduled date; the server stays authoritative and re-checks the F-3 gate.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getAccountRepository } from '../accountRepository';
import { useSessionStore } from '../../store/session';
import { HOUSEHOLD_KEY } from './useHousehold';

export function useTransferOwnership() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ householdId, newOwnerId }: { householdId: string; newOwnerId: string }) =>
      getAccountRepository().transferOwnership(householdId, newOwnerId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: HOUSEHOLD_KEY });
    },
  });
}

export function useRequestDeletion() {
  const signOut = useSessionStore((s) => s.signOut);
  return useMutation({
    mutationFn: async (): Promise<{ executeAfter: string }> => {
      const repo = getAccountRepository();
      const reauthToken = await repo.requestReauth();
      const result = await repo.requestDeletion(reauthToken);
      // Grace window has begun; return to an anonymous session (never leaves the user stranded).
      await signOut();
      return result;
    },
  });
}
</content>
