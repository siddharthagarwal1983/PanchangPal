/**
 * SCR_HOUSEHOLD_INVITE_001 — Household invite (MOD_you). Two variants, driven by a `token` param:
 *  - Link (inviter, no token): mints a shareable invite for the caller's household and offers the
 *    OS share sheet (CMP_INVITE_LINK_CARD + CMP_SHARE_BUTTON).
 *  - Accept (invitee, token present): previews household + inviter and offers Join
 *    (CMP_INVITE_ACCEPT_CARD). Joining is cross-device, so anonymous users get a calm deferred-auth
 *    prompt (UX-2). Expired/invalid tokens render a non-alarming expired state (ERR_INVITE_EXPIRED).
 * Reachable in-app from Household and, in M7, via the `panchangpal://invite/{token}` deep link.
 * No business logic here — the screen composes approved CMP_* with tokens-only styling + i18n.
 */
import { useEffect } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Screen,
  AppHeader,
  Text,
  Card,
  PrimaryButton,
  InviteLinkCard,
  InviteAcceptCard,
  Spinner,
  useTheme,
} from '@panchangpal/ui';
import { useHousehold } from '../../../src/data/hooks/useHousehold';
import { useCreateInvite, useInvitePreview, useAcceptInvite } from '../../../src/data/hooks/useInvite';
import { useOnline } from '../../../src/data/useOnline';
import { useSessionStore } from '../../../src/store/session';
import { t } from '../../../src/i18n';

/** Inviter variant: mint a link for the caller's household and share it. */
function InviteLink() {
  const { theme } = useTheme();
  const { data: household } = useHousehold();
  const create = useCreateInvite();
  const householdId = household?.id ?? null;

  // Auto-mint a link once the household id is known (idempotent for the screen's lifetime).
  useEffect(() => {
    if (householdId && !create.data && !create.isPending && !create.isError) create.mutate(householdId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [householdId]);

  if (create.isPending || (!create.data && !create.isError)) {
    return (
      <View style={{ paddingTop: theme.spacing.xl, alignItems: 'center', gap: theme.spacing.sm }}>
        <Spinner />
        <Text variant="bodyMedium" color="secondary">
          {t('invite.creating')}
        </Text>
      </View>
    );
  }

  if (create.isError || !create.data) {
    return (
      <View style={{ paddingTop: theme.spacing.md }}>
        <Card testID="invite-error">
          <View style={{ gap: theme.spacing.sm }}>
            <Text variant="bodyMedium" color="danger">
              {t('invite.createError')}
            </Text>
            <PrimaryButton label={t('actions.retry')} onPress={() => householdId && create.mutate(householdId)} testID="invite-retry" />
          </View>
        </Card>
      </View>
    );
  }

  return (
    <View style={{ paddingTop: theme.spacing.md }}>
      <InviteLinkCard
        title={t('invite.linkTitle')}
        body={t('invite.linkBody')}
        url={create.data.url}
        expiresLabel={t('invite.expiresIn')}
        shareMessage={t('invite.shareMessage', { url: create.data.url })}
        shareLabel={t('invite.share')}
        testID="invite-link-card"
      />
    </View>
  );
}

/** Invitee variant: preview the household and offer Join (behind deferred auth). */
function InviteAccept({ token }: { token: string }) {
  const { theme } = useTheme();
  const status = useSessionStore((s) => s.status);
  const isAuthenticated = status === 'authenticated';
  const { data: preview, isLoading, isError, error } = useInvitePreview(token);
  const accept = useAcceptInvite();

  const expired = isError && String((error as Error)?.message ?? '').toLowerCase().includes('expire');

  if (isLoading) {
    return (
      <View style={{ paddingTop: theme.spacing.xl, alignItems: 'center' }}>
        <Spinner />
      </View>
    );
  }

  // Deferred-auth prompt: joining needs an account (sync across devices).
  if (!isAuthenticated) {
    return (
      <View style={{ paddingTop: theme.spacing.md }}>
        <Card testID="invite-signin-prompt">
          <View style={{ gap: theme.spacing.sm }}>
            <Text variant="titleSmall">{t('invite.signInToJoin')}</Text>
            <Text variant="bodyMedium" color="secondary">
              {t('invite.signInToJoinBody')}
            </Text>
            {preview ? (
              <Text variant="bodyMedium">
                {t('invite.acceptHeadline', { household: preview.householdName })}
              </Text>
            ) : null}
            <PrimaryButton
              label={t('invite.signInToJoin')}
              onPress={() => router.push('/(onboarding)/sign-in')}
              testID="invite-signin"
            />
          </View>
        </Card>
      </View>
    );
  }

  return (
    <View style={{ paddingTop: theme.spacing.md, gap: theme.spacing.md }}>
      <InviteAcceptCard
        headline={t('invite.acceptHeadline', { household: preview?.householdName ?? '' })}
        detail={t('invite.acceptDetail', { inviter: preview?.inviter ?? '' })}
        joinLabel={accept.isPending ? t('invite.joining') : t('invite.join')}
        onJoin={() => accept.mutate({ token }, { onSuccess: () => router.replace('/(tabs)/you/household') })}
        loading={accept.isPending}
        expired={expired}
        expiredLabel={t('invite.expired')}
        testID="invite-accept-card"
      />
      {accept.isError ? (
        <Text variant="bodySmall" color="danger" accessibilityLiveRegion="polite">
          {t('invite.joinError')}
        </Text>
      ) : null}
    </View>
  );
}

export default function InviteScreen() {
  const online = useOnline();
  const params = useLocalSearchParams<{ token?: string }>();
  const token = typeof params.token === 'string' && params.token.length > 0 ? params.token : null;

  return (
    <Screen offline={!online} scroll edges={['top']} testID="invite-screen">
      <AppHeader title={t('invite.title')} onBack={() => router.back()} backLabel={t('actions.back')} />
      {token ? <InviteAccept token={token} /> : <InviteLink />}
    </Screen>
  );
}
</content>
