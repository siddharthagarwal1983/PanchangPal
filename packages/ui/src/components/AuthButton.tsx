/**
 * AuthButton (CMP_AUTH_BUTTON) — provider sign-in button (PDD §5.2). "Continue with
 * {Provider}" for Apple / Google / Email (OTP). 48pt height, radius.md, ≥44/48 target,
 * loading + disabled states. Provider brand styling follows Apple/Google guidelines
 * (color.provider.*); Email uses the tonal brand style.
 */
import { Pressable, ActivityIndicator, View } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';

export type AuthProvider = 'apple' | 'google' | 'email';

export interface AuthButtonProps {
  provider: AuthProvider;
  label: string; // localized "Continue with Apple" etc.
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  testID?: string;
}

export function AuthButton({ provider, label, onPress, loading = false, disabled = false, testID }: AuthButtonProps) {
  const { theme } = useTheme();
  const isDisabled = disabled || loading;
  const bg =
    provider === 'apple'
      ? theme.colors.text.primary
      : provider === 'google'
        ? theme.colors.surface.raised
        : theme.colors.brand.tonalBg;
  const fg = provider === 'apple' ? theme.colors.surface.raised : provider === 'google' ? theme.colors.text.primary : theme.colors.text.brand;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      hitSlop={8}
      testID={testID}
      style={{
        minHeight: 48,
        borderRadius: theme.radius.md,
        backgroundColor: isDisabled ? theme.colors.state.disabledBg : bg,
        borderWidth: provider === 'google' ? 1.5 : 0,
        borderColor: theme.colors.border.default,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isDisabled && !loading ? 0.6 : 1,
      }}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
          <Text variant="labelLarge" style={{ color: isDisabled ? theme.colors.state.disabledText : fg }}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
