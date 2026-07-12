/**
 * SCR_AUTH_001 — Sign in (TDD Part 4 §2.1/§3.1; FLOW E1). Provider sign-in (Apple / Google
 * / email-OTP) via AuthRepository (existing contracts) — NO password/registration. Deferred
 * auth: "Skip for now" continues anonymously to tabs (UX-2). View has no business logic;
 * it calls the session store / repository.
 */
import { useState } from 'react';
import { View, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Screen, AppHeader, AuthButton, Text, useTheme } from '@panchangpal/ui';
import { authRepository } from '../../src/data/authRepository';
import { useSessionStore } from '../../src/store/session';
import { t } from '../../src/i18n';

export default function SignIn() {
  const { theme } = useTheme();
  const isAnonymous = useSessionStore((s) => s.isAnonymous);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState<null | 'apple' | 'google' | 'email'>(null);
  const [error, setError] = useState<string | null>(null);

  const skip = () => router.replace('/(tabs)/today');

  const startEmail = async () => {
    if (!email.includes('@')) return;
    setBusy('email');
    setError(null);
    try {
      await authRepository.startEmailOtp(email);
      router.push({ pathname: '/(onboarding)/verify-otp', params: { email } });
    } catch {
      setError(t('auth.genericError'));
    } finally {
      setBusy(null);
    }
  };

  const providerSignIn = (_provider: 'apple' | 'google') => {
    // Native provider token acquisition (expo-apple-authentication / Google) is added with
    // the native modules; the repository call is wired. Deferred to the auth-native task.
    setError(t('auth.genericError'));
  };

  return (
    <Screen edges={['top', 'bottom']} error={null} testID="sign-in">
      <AppHeader title={t('auth.title')} onBack={isAnonymous ? undefined : () => router.back()} />
      <View style={{ gap: theme.spacing.md, paddingTop: theme.spacing.lg }}>
        <Text variant="bodyMedium" color="secondary">
          {t('auth.subtitle')}
        </Text>

        <AuthButton provider="apple" label={t('auth.continueApple')} onPress={() => providerSignIn('apple')} loading={busy === 'apple'} testID="auth-apple" />
        <AuthButton provider="google" label={t('auth.continueGoogle')} onPress={() => providerSignIn('google')} loading={busy === 'google'} testID="auth-google" />

        <Text variant="labelMedium" color="tertiary" style={{ textAlign: 'center', paddingVertical: theme.spacing.sm }}>
          {t('auth.emailLabel')}
        </Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder={t('auth.emailPlaceholder')}
          placeholderTextColor={theme.colors.text.placeholder}
          autoCapitalize="none"
          keyboardType="email-address"
          accessibilityLabel={t('auth.emailLabel')}
          testID="auth-email-input"
          style={{
            minHeight: 48,
            borderWidth: 1,
            borderColor: theme.colors.border.default,
            borderRadius: theme.radius.md,
            paddingHorizontal: theme.spacing.md,
            color: theme.colors.text.primary,
            backgroundColor: theme.colors.surface.input,
          }}
        />
        <AuthButton provider="email" label={t('auth.continueEmail')} onPress={startEmail} loading={busy === 'email'} disabled={!email.includes('@')} testID="auth-email" />

        {error ? (
          <Text variant="bodyMedium" color="danger" accessibilityRole="alert">
            {error}
          </Text>
        ) : null}

        <Text variant="labelLarge" color="brand" onPress={skip} accessibilityRole="button" style={{ textAlign: 'center', paddingVertical: theme.spacing.md }} testID="auth-skip">
          {t('actions.skip')}
        </Text>
      </View>
    </Screen>
  );
}
