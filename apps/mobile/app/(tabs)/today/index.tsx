/**
 * SCR_HOME_001 — Today (MOD_today). Application Shell renders the standard Screen container
 * with the empty state; the daily loop (panchang/ritual/streak) is built in the Today
 * feature task (Milestone 2+). Panchang compute is blocked (ADR-033) — the Today panchang
 * view will show "temporarily unavailable" until the canonical engine lands.
 */
import { Screen, AppHeader, Text, useTheme } from '@panchangpal/ui';
import { View } from 'react-native';
import { useOnline } from '../../../src/data/useOnline';
import { t } from '../../../src/i18n';

export default function TodayScreen() {
  const online = useOnline();
  const { theme } = useTheme();
  return (
    <Screen offline={!online} edges={['top']} testID="today-screen">
      <AppHeader title={t('tabs.today')} />
      <View style={{ paddingTop: theme.spacing.lg }}>
        <Text variant="bodyMedium" color="secondary">
          {t('app.tagline')}
        </Text>
      </View>
    </Screen>
  );
}
