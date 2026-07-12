/**
 * SCR_DELETE_ACCOUNT_001 — Delete account (MOD_you). A calm, honest, reversible-by-grace-window
 * deletion flow: enumerate the consequences (CMP_CONSEQUENCES_PANEL), enforce the F-3 gate (an
 * owner with other members must transfer ownership first), then a confirm-gated destructive CTA
 * (CMP_DESTRUCTIVE_ACTION). Deletion is a scheduled REQUEST — on success we show the grace-window
 * date and return to an anonymous session so the offline daily loop keeps working. No business
 * logic here: the screen composes approved CMP_* with tokens-only styling and localized strings;
 * the server stays authoritative and re-checks the gate.
 */
import { View } from 'react-native';
import { router } from 'expo-router';
import {
  Screen,
  AppHeader,
  Text,
  Card,
  PrimaryButton,
  ConsequencesPanel,
  DestructiveAction,
  useTheme,
} from '@panchangpal/ui';
import { useHousehold } from '../../../src/data/hooks/useHousehold';
import { useRequestDeletion } from '../../../src/data/hooks/useAccountDeletion';
import { evaluateDeletion } from '../../../src/domain/account';
import { useOnline } from '../../../src/data/useOnline';
import { useSessionStore } from '../../../src/store/session';
import { t } from '../../../src/i18n';

function formatGraceDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString();
}

export default function DeleteAccountScreen() {
  const online = useOnline();
  const { theme } = useTheme();
  const status = useSessionStore((s) => s.status);
  const userId = useSessionStore((s) => s.userId);
  const isAuthenticated = status === 'authenticated';

  const { data: household } = useHousehold();
  const del = useRequestDeletion();

  // Only authenticated users have an account to delete; anonymous users see a calm redirect prompt.
  if (!isAuthenticated) {
    return (
      <Screen offline={!online} scroll edges={['top']} testID="delete-account-screen">
        <AppHeader title={t('deleteAccount.title')} onBack={() => router.back()} backLabel={t('actions.back')} />
        <View style={{ paddingTop: theme.spacing.md }}>
          <Card testID="delete-account-anon">
            <View style={{ gap: theme.spacing.sm }}>
              <Text variant="titleSmall">{t('deleteAccount.anonTitle')}</Text>
              <Text variant="bodyMedium" color="secondary">
                {t('deleteAccount.anonBody')}
              </Text>
            </View>
          </Card>
        </View>
      </Screen>
    );
  }

  // Success: deletion scheduled for the grace-window date; session is now anonymous again.
  if (del.isSuccess) {
    return (
      <Screen offline={!online} scroll edges={['top']} testID="delete-account-screen">
        <AppHeader title={t('deleteAccount.title')} backLabel={t('actions.back')} />
        <View style={{ paddingTop: theme.spacing.md }}>
          <Card testID="delete-account-scheduled">
            <View style={{ gap: theme.spacing.sm }}>
              <Text variant="titleSmall">{t('deleteAccount.scheduledTitle')}</Text>
              <Text variant="bodyMedium" color="secondary">
                {t('deleteAccount.scheduledBody', { date: formatGraceDate(del.data.executeAfter) })}
              </Text>
              <PrimaryButton label={t('deleteAccount.done')} onPress={() => router.replace('/(tabs)/today')} testID="delete-account-done" />
            </View>
          </Card>
        </View>
      </Screen>
    );
  }

  const gate = evaluateDeletion(household, userId);
  const consequences =
    gate.variant === 'owner-with-members'
      ? [t('deleteAccount.consequenceOwner'), t('deleteAccount.consequenceData'), t('deleteAccount.consequenceGrace')]
      : [t('deleteAccount.consequenceData'), t('deleteAccount.consequenceHousehold'), t('deleteAccount.consequenceGrace')];

  return (
    <Screen offline={!online} scroll edges={['top']} testID="delete-account-screen">
      <AppHeader title={t('deleteAccount.title')} onBack={() => router.back()} backLabel={t('actions.back')} />
      <View style={{ gap: theme.spacing.xl, paddingTop: theme.spacing.md }}>
        <Text variant="bodyLarge" color="secondary">
          {t('deleteAccount.intro')}
        </Text>

        <ConsequencesPanel title={t('deleteAccount.consequencesTitle')} consequences={consequences} testID="delete-consequences" />

        {gate.needsOwnershipTransfer ? (
          <Card testID="delete-transfer-required">
            <View style={{ gap: theme.spacing.sm }}>
              <Text variant="titleSmall">{t('deleteAccount.transferTitle')}</Text>
              <Text variant="bodyMedium" color="secondary">
                {t('deleteAccount.transferBody')}
              </Text>
              <PrimaryButton
                label={t('deleteAccount.transferCta')}
                onPress={() => router.push('/(tabs)/you/household')}
                testID="delete-transfer-cta"
              />
            </View>
          </Card>
        ) : null}

        {del.isError ? (
          <Text variant="bodySmall" color="danger" accessibilityLiveRegion="polite">
            {t('deleteAccount.error')}
          </Text>
        ) : null}

        <DestructiveAction
          label={t('deleteAccount.deleteCta')}
          confirmTitle={t('deleteAccount.confirmTitle')}
          confirmBody={t('deleteAccount.confirmBody')}
          confirmLabel={t('deleteAccount.confirmDelete')}
          cancelLabel={t('deleteAccount.cancel')}
          onConfirm={() => del.mutate()}
          disabled={gate.needsOwnershipTransfer || !online}
          loading={del.isPending}
          testID="delete-account-cta"
        />
        {gate.needsOwnershipTransfer ? (
          <Text variant="bodySmall" color="secondary">
            {t('deleteAccount.blockedHint')}
          </Text>
        ) : null}
      </View>
    </Screen>
  );
}
</content>
