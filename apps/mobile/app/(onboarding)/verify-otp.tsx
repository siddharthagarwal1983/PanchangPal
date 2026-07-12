/**
 * SCR_AUTH_EMAIL_001 — Verify email OTP (TDD Part 4 §3.1; FLOW E1). Verifies the code via
 * AuthRepository (API_POST_AUTH_EMAIL_VERIFY), then upgrades + merges the anon session
 * (F-1) and routes to tabs. No business logic in the view.
 */
import { useState } from 'react';
import { View, TextInput } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen, AppHeader, AuthButton, Text, useTheme } from '@panchangpal/ui';
import { authRepository } from '../../src/data/authRepository';
import { useSessionStore } from '../../src/store/session';
import { t } from '../../src/i18n';

export default function VerifyOtp() {
  const { theme } = useTheme();
  const { email } = useLocalSearchParams<{ email: string }>();
  const previousAnonUid = useSessionStore((s) => (s.isAnonymous ? s.userId : null));
  const upgradeAndMerge = useSessionStore((s) => s.upgradeAndMerge);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verify = async () => {
    setBusy(true);
    setError(null);
    try {
      const session = await authRepository.verifyEmailOtp(String(email), code);
      await upgradeAndMerge(session, previousAnonUid);
      router.replace('/(tabs)/today');
    } catch {
      setError(t('auth.otpError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen testID="verify-otp">
      <AppHeader title={t('auth.otpTitle')} onBack={() => router.back()} />
      <View style={{ gap: theme.spacing.md, paddingTop: theme.spacing.lg }}>
        <Text variant="bodyMedium" color="secondary">
          {t('auth.otpSubtitle', { email: String(email) })}
        </Text>
        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder="••••••"
          placeholderTextColor={theme.colors.text.placeholder}
          keyboardType="number-pad"
          maxLength={6}
          accessibilityLabel={t('auth.otpLabel')}
          testID="otp-input"
          style={{
            minHeight: 48,
            borderWidth: 1,
            borderColor: theme.colors.border.default,
            borderRadius: theme.radius.md,
            paddingHorizontal: theme.spacing.md,
            color: theme.colors.text.primary,
            backgroundColor: theme.colors.surface.input,
            letterSpacing: 8,
            textAlign: 'center',
          }}
        />
        {error ? (
          <Text variant="bodyMedium" color="danger" accessibilityRole="alert">
            {error}
          </Text>
        ) : null}
        <AuthButton provider="email" label={t('actions.verify')} onPress={verify} loading={busy} disabled={code.length < 6} testID="otp-verify" />
      </View>
    </Screen>
  );
}
