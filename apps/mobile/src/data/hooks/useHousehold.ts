/**
 * HOOK_useHousehold (TDD Part 4 §5.2 / §5.4). Server-authoritative household read (RLS-scoped)
 * plus a Supabase Realtime subscription that INVALIDATES the query on member joins/edits/leaves
 * for positive social proof (PDD §8.5). The subscription is torn down on unmount to save battery
 * (NFR). Member mutations (owner-only) apply OPTIMISTICALLY to the household cache and revert on
 * error. Household is cross-device, so it is gated behind auth (deferred-auth, UX-2) and is never
 * part of the daily loop (P4). Server data is never copied into Zustand.
 */
import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getHouseholdRepository } from '../householdRepository';
import { useSessionStore } from '../../store/session';
import type { Household, MemberInput, MemberPatch } from '../../domain/household';

export const HOUSEHOLD_KEY = ['household'] as const;

export function useHousehold() {
  const qc = useQueryClient();
  const status = useSessionStore((s) => s.status);
  const isAuthed = status === 'authenticated';

  const query = useQuery<Household | null>({
    queryKey: HOUSEHOLD_KEY,
    queryFn: () => getHouseholdRepository().getHousehold(),
    enabled: isAuthed,
    staleTime: 30 * 1000, // short: household membership changes are meaningful in near-real-time
  });

  const householdId = query.data?.id ?? null;

  // Realtime: refetch on any member change for this household; torn down on unmount/id change.
  useEffect(() => {
    if (!isAuthed || !householdId) return;
    const unsubscribe = getHouseholdRepository().subscribeMembers(householdId, () => {
      void qc.invalidateQueries({ queryKey: HOUSEHOLD_KEY });
    });
    return unsubscribe;
  }, [isAuthed, householdId, qc]);

  return query;
}

/** Shared optimistic-mutation wiring for the three owner-only member operations. */
function useMemberMutation<TArgs>(mutationFn: (a: TArgs) => Promise<Household>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (household) => {
      qc.setQueryData<Household | null>(HOUSEHOLD_KEY, household);
    },
    onError: () => {
      // Reconcile with the server truth; the screen surfaces a calm, retryable error.
      void qc.invalidateQueries({ queryKey: HOUSEHOLD_KEY });
    },
  });
}

export function useAddMember(householdId: string | null) {
  return useMemberMutation<MemberInput>((input) => {
    if (!householdId) throw new Error('no_household');
    return getHouseholdRepository().addMember(householdId, input);
  });
}

export function useUpdateMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, patch }: { memberId: string; patch: MemberPatch }) =>
      getHouseholdRepository().updateMember(memberId, patch),
    // Optimistic edit of role/depth/name on the cached member; revert on error.
    onMutate: async ({ memberId, patch }) => {
      await qc.cancelQueries({ queryKey: HOUSEHOLD_KEY });
      const prev = qc.getQueryData<Household | null>(HOUSEHOLD_KEY) ?? null;
      if (prev) {
        qc.setQueryData<Household | null>(
          HOUSEHOLD_KEY,
          (prev) => {
            if (!prev) return prev;

            return {
              ...prev,
              members: prev.members.map((m) =>
                m.id === memberId ? { ...m, ...patch } : m
              ),
            };
          }
        );
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev !== undefined) qc.setQueryData(HOUSEHOLD_KEY, ctx.prev);
    },
    onSuccess: (household) => qc.setQueryData<Household | null>(HOUSEHOLD_KEY, household),
  });
}

export function useRemoveMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => getHouseholdRepository().removeMember(memberId),
    onMutate: async (memberId) => {
      await qc.cancelQueries({ queryKey: HOUSEHOLD_KEY });
      const prev = qc.getQueryData<Household | null>(HOUSEHOLD_KEY) ?? null;
      if (prev) {
        qc.setQueryData<Household | null>(
          HOUSEHOLD_KEY,
          (prev) => {
            if (!prev) return prev;

            return {
              ...prev,
              members: prev.members.filter((m) => m.id !== memberId),
            };
          }
        );
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev !== undefined) qc.setQueryData(HOUSEHOLD_KEY, ctx.prev);
    },
    onSuccess: (household) => qc.setQueryData<Household | null>(HOUSEHOLD_KEY, household),
  });
}

export function useCreateHousehold() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => getHouseholdRepository().createHousehold(name),
    onSuccess: (household) => qc.setQueryData<Household | null>(HOUSEHOLD_KEY, household),
  });
}
