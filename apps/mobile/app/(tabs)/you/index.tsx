/**
 * SCR_PROFILE_001 — You (MOD_you). The hub for account, household, and settings. Anonymous
 * users see a calm, non-blocking sign-in prompt (deferred auth, UX-2 / ADR-009) — the app
 * stays fully usable without an account. Settings is a real destination (SCR_SETTINGS_001);
 * Household lands in the next MOD_you increment. No business logic here — composes CMP_*
 * with tokens-only styling and localized strings.
 */
import { View } from 'react-native';
import { router } from 'expo-router';
import { Screen, AppHeader, Card, Text, PrimaryButton, SettingsRow, useTheme } from '@panchangpal/ui';
import { useOnline } from '../../../src/data/useOnline';
import { useSessionStore } from '../../../src/store/session';
import { useEntitlement } from '../../../src/data/hooks/useEntitlement';
import { isEntitled } from '../../../src/domain/subscription';
import { t } from '../../../src/i18n';

export default function YouScreen() {
  const online = useOnline();
  const { theme } = useTheme();
  const status = useSessionStore((s) => s.status);
  const isAnonymous = status !== 'authenticated';
  const premium = isEntitled(useEntitlement().data);

  return (
    <Screen offline={!online} scroll edges={['top']} testID="you-screen">
      <AppHeader title={t('you.title')} />
      <View style={{ gap: theme.spacing.xl, paddingTop: theme.spacing.md }}>
        <View style={{ gap: theme.spacing.sm }}>
          <Text variant="labelMedium" color="secondary" accessibilityRole="header">
            {t('you.accountSectionTitle')}
          </Text>
          {isAnonymous ? (
            <Card testID="you-signin-prompt">
              <View style={{ gap: theme.spacing.sm }}>
                <Text variant="titleSmall">{t('you.anonTitle')}</Text>
                <Text variant="bodyMedium" color="secondary">
                  {t('you.anonBody')}
                </Text>
                <PrimaryButton
                  label={t('you.signIn')}
                  onPress={() => router.push('/(onboarding)/sign-in')}
                  testID="you-signin"
                />
              </View>
            </Card>
          ) : (
            <SettingsRow title={t('you.signedInAs')} testID="you-account" />
          )}
        </View>

        <View style={{ gap: theme.spacing.sm }}>
          <SettingsRow
            title={t('you.householdEntry')}
            description={t('you.householdEntryHint')}
            value="→"
            onPress={() => router.push('/(tabs)/you/household')}
            testID="you-household-entry"
          />
          <SettingsRow
            title={t('you.notificationsEntry')}
            description={t('you.notificationsEntryHint')}
            value="→"
            onPress={() => router.push('/(tabs)/you/notifications')}
            testID="you-notifications-entry"
          />
          <SettingsRow
            title={t('you.subscriptionEntry')}
            description={premium ? t('you.subscriptionEntryActive') : t('you.subscriptionEntryHint')}
            value="→"
            onPress={() => router.push('/(tabs)/you/subscription')}
            testID="you-subscription-entry"
          />
          <SettingsRow
            title={t('you.settingsEntry')}
            description={t('you.settingsEntryHint')}
            value="→"
            onPress={() => router.push('/(tabs)/you/settings')}
            testID="you-settings-entry"
          />
        </View>
      </View>
    </Screen>
  );
}
