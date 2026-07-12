/**
 * SCR_PROFILE_001 — You (MOD_you). Shell only; profile/household/subscription/settings are
 * built in the You feature task. Includes the Logout action here (Settings lives under You,
 * frozen IA UX-1). Logout returns to an anonymous session so the offline loop keeps working.
 */
import { View } from 'react-native';
import { Screen, AppHeader, Text, useTheme } from '@panchangpal/ui';
import { useOnline } from '../../../src/data/useOnline';
import { useSessionStore } from '../../../src/store/session';
import { t } from '../../../src/i18n';

export default function YouScreen() {
  const online = useOnline();
  const { theme } = useTheme();
  const status = useSessionStore((s) => s.status);
  const signOut = useSessionStore((s) => s.signOut);

  return (
    <Screen offline={!online} edges={['top']} testID="you-screen">
      <AppHeader title={t('tabs.you')} />
      <View style={{ paddingTop: theme.spacing.lg, gap: theme.spacing.md }}>
        {status === 'authenticated' ? (
          <Text
            variant="labelLarge"
            color="danger"
            onPress={() => void signOut()}
            accessibilityRole="button"
            testID="you-signout"
          >
            {t('actions.signOut')}
          </Text>
        ) : null}
      </View>
    </Screen>
  );
}
