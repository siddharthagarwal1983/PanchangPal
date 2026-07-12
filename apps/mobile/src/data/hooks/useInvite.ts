/**
 * HOOK_useInvite (TDD Part 4 §5.2; openapi API_*_INVITE*). Three seams for the household invite
 * flow (SCR_HOUSEHOLD_INVITE_001):
 *  - useCreateInvite: owner mints a shareable token/URL (link variant).
 *  - useInvitePreview: public look-up of household + inviter for the accept card; ERR_INVITE_EXPIRED
 *    surfaces as a calm expired state.
 *  - useAcceptInvite: authenticated join (deferred-auth gate); idempotency_key makes retries safe;
 *    on success the household query is invalidated so membership reflects immediately.
 * The client only calls the SVC_household adapter — it never fabricates household data.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { randomUUID } from 'expo-crypto';
import { getHouseholdRepository } from '../householdRepository';
import { useSessionStore } from '../../store/session';
import { HOUSEHOLD_KEY } from './useHousehold';
import type { ContentDepth, MemberRole } from '@panchangpal/shared';
import type { Invite, InvitePreview } from '../../domain/household';

export function useCreateInvite() {
  return useMutation<Invite, unknown, string>({
    mutationFn: (householdId: string) => getHouseholdRepository().createInvite(householdId),
  });
}

export function useInvitePreview(token: string | null) {
  return useQuery<InvitePreview>({
    queryKey: ['invite', token],
    queryFn: () => getHouseholdRepository().getInvitePreview(token as string),
    enabled: !!token,
    retry: false, // an expired/invalid token should surface immediately, not retry
    staleTime: 60 * 1000,
  });
}

export function useAcceptInvite() {
  const qc = useQueryClient();
  const status = useSessionStore((s) => s.status);
  return useMutation({
    mutationFn: (args: { token: string; role?: MemberRole; depth?: ContentDepth }) => {
      if (status !== 'authenticated') throw new Error('auth_required'); // deferred-auth gate (UX-2)
      return getHouseholdRepository().acceptInvite({ ...args, idempotencyKey: randomUUID() });
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: HOUSEHOLD_KEY });
    },
  });
}
