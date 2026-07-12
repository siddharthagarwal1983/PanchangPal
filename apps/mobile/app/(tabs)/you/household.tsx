/**
 * SCR_HOUSEHOLD_001 — Household (MOD_you). Shell for now: the members list, roles, invites
 * (SCR_HOUSEHOLD_INVITE_001), and realtime member/completion updates land in the next MOD_you
 * increment (HOOK_useHousehold / HOOK_useInvite, TDD Part 4 §5.2). This composes a calm,
 * honest empty state so the Profile → Household entry is never a dead end (nav rule §3.2).
 * The header (with back) stays visible; no fabricated household data is shown.
 */
import { View } from 'react-native';
import { router } from 'expo-router';
import { Screen, AppHeader, EmptyState } from '@panchangpal/ui';
import { useOnline } from '../../../src/data/useOnline';
import { t } from '../../../src/i18n';

export default function HouseholdScreen() {
  const online = useOnline();
  return (
    <Screen offline={!online} edges={['top']} testID="household-screen">
      <AppHeader title={t('you.householdEntry')} onBack={() => router.back()} backLabel={t('actions.back')} />
      <View style={{ flex: 1 }}>
        <EmptyState title={t('you.householdEntry')} body={t('you.householdEntryHint')} testID="household-empty" />
      </View>
    </Screen>
  );
}
