/**
 * SCR_ONBOARDING_NOTIF_001 (Settings host) — Notifications (MOD_notifications). Three calm states
 * driven by OS permission (device state) + server-authoritative per-channel prefs:
 *  - undetermined → priming card (CMP_PERMISSION_PRIMING); only "Turn on" may trigger the OS dialog.
 *  - granted → per-channel toggles + quiet hours (optimistic, offline-safe via HOOK_useNotificationPrefs).
 *  - denied → a non-blocking notice + guidance to enable in system Settings (ERR_NOTIF_DENIED never blocks).
 * Sunrise/tithi-timed content stays gated by ADR-033 (a calm "unavailable" note). No business logic
 * here — the screen composes approved CMP_* with tokens-only styling and localized strings.
 */
import { View } from 'react-native';
import { router } from 'expo-router';
import {
  Screen,
  AppHeader,
  Text,
  SettingsRow,
  Toggle,
  InfoBanner,
  PermissionPriming,
  useTheme,
} from '@panchangpal/ui';
import type { NotifChannel } from '@panchangpal/shared';
import {
  NOTIF_CHANNEL_ORDER,
  DEFAULT_NOTIF_PREFS,
  type NotifChannelPrefs,
  type QuietHours,
} from '../../../src/domain/notifications';
import {
  useNotificationPermission,
  useEnableNotifications,
} from '../../../src/data/hooks/useNotificationPermission';
import {
  useNotificationPrefs,
  useUpdateNotificationPrefs,
} from '../../../src/data/hooks/useNotificationPrefs';
import { useOnline } from '../../../src/data/useOnline';
import { t } from '../../../src/i18n';

/** Default quiet window offered when the user turns quiet hours on (local wall time). */
const DEFAULT_QUIET: QuietHours = { start: '22:00', end: '07:00' };

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

export default function NotificationsScreen() {
  const online = useOnline();
  const { theme } = useTheme();

  const permission = useNotificationPermission();
  const enable = useEnableNotifications();
  const prefsQuery = useNotificationPrefs();
  const update = useUpdateNotificationPrefs();

  const prefs = prefsQuery.data ?? DEFAULT_NOTIF_PREFS;
  const status = permission.data ?? 'undetermined';

  return (
    <Screen
      scroll
      edges={['top']}
      offline={!online}
      loading={permission.isLoading}
      testID="notifications-screen"
    >
      <AppHeader title={t('notifications.title')} onBack={() => router.back()} backLabel={t('actions.back')} />
      <View style={{ gap: theme.spacing.xl, paddingTop: theme.spacing.md }}>
        {/* ADR-033: sunrise/tithi-timed reminders are not yet available. */}
        <InfoBanner message={t('notifications.panchangUnavailable')} tone="info" testID="notifications-panchang-note" />

        {status === 'undetermined' ? (
          <PermissionPriming
            kind="notification"
            title={t('notifications.primeTitle')}
            body={t('notifications.primeBody')}
            allowLabel={t('notifications.turnOn')}
            notNowLabel={t('notifications.notNow')}
            onAllow={() => enable.mutate()}
            onNotNow={() => router.back()}
            loading={enable.isPending}
            testID="notifications-priming"
          />
        ) : null}

        {status === 'denied' ? (
          <View style={{ gap: theme.spacing.sm }}>
            <InfoBanner message={t('notifications.deniedNote')} tone="warning" testID="notifications-denied" />
            <SettingsRow
              title={t('notifications.openSettings')}
              description={t('notifications.openSettingsHint')}
              value="→"
              onPress={() => enable.mutate()}
              testID="notifications-open-settings"
            />
          </View>
        ) : null}

        {status === 'granted' ? (
          <>
            {update.isError ? (
              <Text variant="bodySmall" color="danger" accessibilityLiveRegion="polite">
                {t('notifications.saveError')}
              </Text>
            ) : null}

            <Section title={t('notifications.channelsSection')}>
              {NOTIF_CHANNEL_ORDER.map((channel: NotifChannel) => (
                <SettingsRow
                  key={channel}
                  title={t(`notifications.channel.${channel}`)}
                  description={t(`notifications.channelHint.${channel}`)}
                  trailing={
                    <Toggle
                      value={prefs.channels[channel]}
                      onValueChange={(value) =>
                        update.mutate({ channels: { [channel]: value } as Partial<NotifChannelPrefs> })
                      }
                      accessibilityLabel={t(`notifications.channel.${channel}`)}
                      testID={`notifications-channel-${channel}`}
                    />
                  }
                  testID={`notifications-row-${channel}`}
                />
              ))}
            </Section>

            <Section title={t('notifications.quietSection')}>
              <SettingsRow
                title={t('notifications.quietHours')}
                description={
                  prefs.quietHours
                    ? t('notifications.quietWindow', { start: prefs.quietHours.start, end: prefs.quietHours.end })
                    : t('notifications.quietHoursHint')
                }
                trailing={
                  <Toggle
                    value={prefs.quietHours !== null}
                    onValueChange={(value) => update.mutate({ quietHours: value ? DEFAULT_QUIET : null })}
                    accessibilityLabel={t('notifications.quietHours')}
                    testID="notifications-quiet-toggle"
                  />
                }
                testID="notifications-quiet-row"
              />
            </Section>
          </>
        ) : null}
      </View>
    </Screen>
  );
}
