/**
 * PermissionPriming (CMP_PERMISSION_PRIMING, PDD §5.12) — explains the value of a permission
 * BEFORE the OS dialog (UX-4). The primary CTA is the ONLY control that should trigger the OS
 * prompt; "Not now" must never trigger it (the parent wires that). Fully screen-reader readable
 * before the dialog; CTAs ≥44/48. Tokens-only; variant is presentational (notification/location).
 */
import { View, Pressable } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
import { PrimaryButton } from './PrimaryButton';

export type PermissionKind = 'notification' | 'location';

export interface PermissionPrimingProps {
  kind?: PermissionKind;
  title: string;
  body: string;
  /** Primary CTA label — pressing this is what may trigger the OS dialog. */
  allowLabel: string;
  /** Secondary CTA label — must never trigger the OS dialog. */
  notNowLabel: string;
  onAllow: () => void;
  onNotNow: () => void;
  loading?: boolean;
  testID?: string;
}

export function PermissionPriming({
  // `kind` is a presentational variant kept on the public props for callers; not read in render yet.
  title,
  body,
  allowLabel,
  notNowLabel,
  onAllow,
  onNotNow,
  loading = false,
  testID,
}: PermissionPrimingProps) {
  const { theme } = useTheme();
  return (
    <View
      accessibilityRole="summary"
      testID={testID}
      style={{
        backgroundColor: theme.colors.surface.raised,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border.subtle,
        padding: theme.spacing.lg,
        gap: theme.spacing.md,
      }}
    >
      <Text variant="titleLarge" accessibilityRole="header">
        {title}
      </Text>
      <Text variant="bodyLarge" color="secondary">
        {body}
      </Text>
      <View style={{ gap: theme.spacing.sm, paddingTop: theme.spacing.xs }}>
        <PrimaryButton
          label={allowLabel}
          onPress={onAllow}
          loading={loading}
          testID={testID ? `${testID}-allow` : undefined}
        />
        <Pressable
          onPress={onNotNow}
          accessibilityRole="button"
          accessibilityLabel={notNowLabel}
          hitSlop={8}
          style={{ minHeight: 44, alignItems: 'center', justifyContent: 'center' }}
          testID={testID ? `${testID}-not-now` : undefined}
        >
          <Text variant="labelLarge" color="brand">
            {notNowLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
