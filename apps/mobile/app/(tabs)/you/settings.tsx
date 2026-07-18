/**
 * SCR_SETTINGS_001 — Settings (MOD_you). Server-authoritative preferences edited through
 * HOOK_usePreferences/useUpdatePreferences (optimistic, offline-safe). Appearance drives the
 * theme; tradition/depth shape content. No business logic lives here — the screen composes
 * approved CMP_* (SegmentedControl / SettingsRow) with tokens-only styling and localized
 * strings. Sign out returns to an anonymous session so the offline loop keeps working.
 */
import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import {
  Screen,
  AppHeader,
  Card,
  Text,
  PrimaryButton,
  SegmentedControl,
  SettingsRow,
  useTheme,
  type SegmentedOption,
} from '@panchangpal/ui';
import type { AppearanceMode, ContentDepth, TraditionCode } from '@panchangpal/shared';
import { usePreferences, useUpdatePreferences } from '../../../src/data/hooks/usePreferences';
import { usePremiumGate } from '../../../src/data/hooks/useEntitlement';
import { DEFAULT_PREFERENCES } from '../../../src/domain/profile';
import { useOnline } from '../../../src/data/useOnline';
import { useSessionStore } from '../../../src/store/session';
import { t } from '../../../src/i18n';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <View style={{ gap: theme.spacing.sm }}>
      <Text variant="labelMedium" color="secondary" accessibilityRole="header">
        {title}
      </Text>
      {children}
    </View>
  );
}

export default function SettingsScreen() {
  const online = useOnline();
  const { theme } = useTheme();
  const status = useSessionStore((s) => s.status);
  const signOut = useSessionStore((s) => s.signOut);
  const { data, isLoading, isError, refetch } = usePreferences();
  const update = useUpdatePreferences();

  // Deep-dive content is a Premium capability (deep_dive_content). Selecting "Deep" without an
  // active entitlement surfaces a contextual, dismissible upgrade instead of saving — never a hard
  // block (fails open while the gate is loading, so cached prefs never flash a paywall).
  const deepGate = usePremiumGate('deep_dive_content');
  const [showDeepUpsell, setShowDeepUpsell] = useState(false);

  const prefs = data ?? DEFAULT_PREFERENCES;

  const onDepthChange = (depth: ContentDepth) => {
    if (depth === 'deep' && !deepGate.entitled && !deepGate.isLoading) {
      setShowDeepUpsell(true);
      return;
    }
    setShowDeepUpsell(false);
    update.mutate({ depth });
  };

  const appearanceOptions: SegmentedOption<AppearanceMode>[] = [
    { value: 'system', label: t('settings.appearanceSystem') },
    { value: 'light', label: t('settings.appearanceLight') },
    { value: 'dark', label: t('settings.appearanceDark') },
  ];
  const traditionOptions: SegmentedOption<TraditionCode>[] = [
    { value: 'generic', label: t('settings.traditionGeneric') },
    { value: 'north_indian', label: t('settings.traditionNorth') },
    { value: 'south_indian_tamil', label: t('settings.traditionSouth') },
    { value: 'bengali', label: t('settings.traditionBengali') },
  ];
  const depthOptions: SegmentedOption<ContentDepth>[] = [
    { value: 'quick', label: t('settings.depthQuick') },
    { value: 'deep', label: t('settings.depthDeep') },
  ];

  return (
    <Screen
      scroll
      edges={['top']}
      offline={!online}
      loading={isLoading}
      error={isError ? { message: t('errors.unknown'), onRetry: () => void refetch() } : null}
      testID="settings-screen"
    >
      <AppHeader title={t('settings.title')} onBack={() => router.back()} backLabel={t('actions.back')} />
      <View style={{ gap: theme.spacing.xl, paddingTop: theme.spacing.md }}>
        {update.isError ? (
          <Text variant="bodySmall" color="danger" accessibilityLiveRegion="polite">
            {t('settings.saveError')}
          </Text>
        ) : null}

        <Section title={t('settings.appearanceSection')}>
          <Text variant="bodyMedium" color="secondary">
            {t('settings.appearanceLabel')}
          </Text>
          <SegmentedControl<AppearanceMode>
            options={appearanceOptions}
            value={prefs.appearance}
            onChange={(appearance) => update.mutate({ appearance })}
            accessibilityLabel={t('settings.appearanceLabel')}
            testID="settings-appearance"
          />
        </Section>

        <Section title={t('settings.practiceSection')}>
          <SettingsRow title={t('settings.traditionLabel')} description={t('settings.traditionHint')} />
          <SegmentedControl<TraditionCode>
            options={traditionOptions}
            value={prefs.tradition}
            onChange={(tradition) => update.mutate({ tradition })}
            accessibilityLabel={t('settings.traditionLabel')}
            testID="settings-tradition"
          />
          <SettingsRow title={t('settings.depthLabel')} description={t('settings.depthHint')} />
          <SegmentedControl<ContentDepth>
            options={depthOptions}
            value={prefs.depth}
            onChange={onDepthChange}
            accessibilityLabel={t('settings.depthLabel')}
            testID="settings-depth"
          />
          {showDeepUpsell ? (
            <Card testID="settings-deep-upsell">
              <View accessibilityRole="alert" style={{ gap: theme.spacing.sm }}>
                <Text variant="titleSmall" color="primary">
                  {t('settings.deepLockedTitle')}
                </Text>
                <Text variant="bodyMedium" color="secondary">
                  {t('settings.deepLockedBody')}
                </Text>
                <View style={{ gap: theme.spacing.sm }}>
                  <PrimaryButton
                    label={t('settings.deepLockedCta')}
                    onPress={() => {
                      setShowDeepUpsell(false);
                      router.push('/(tabs)/you/subscription');
                    }}
                    testID="settings-deep-upsell-cta"
                  />
                  <SettingsRow
                    title={t('settings.deepLockedDismiss')}
                    onPress={() => setShowDeepUpsell(false)}
                    testID="settings-deep-upsell-dismiss"
                  />
                </View>
              </View>
            </Card>
          ) : null}
        </Section>

        {status === 'authenticated' ? (
          <Section title={t('settings.accountSection')}>
            <SettingsRow
              title={t('settings.signOut')}
              description={t('settings.signOutHint')}
              danger
              onPress={() => void signOut()}
              testID="settings-signout"
            />
            <SettingsRow
              title={t('settings.deleteAccount')}
              description={t('settings.deleteAccountHint')}
              danger
              value="→"
              onPress={() => router.push('/(tabs)/you/delete-account')}
              testID="settings-delete-account"
            />
          </Section>
        ) : null}
      </View>
    </Screen>
  );
}
