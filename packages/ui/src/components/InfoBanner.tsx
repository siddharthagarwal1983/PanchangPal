/**
 * InfoBanner (CMP_INFO_BANNER, PDD §5.12) — a slim, calm, non-blocking inline banner for
 * info / offline / warning notices. Meaning is conveyed by a leading glyph + text, never by
 * color alone (a11y). Announced politely to screen readers. Tokens-only; no business logic.
 * (OfflineBanner is a thin specialization used by the Screen chrome; this is the general host.)
 */
import { View } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';

export type InfoBannerTone = 'info' | 'offline' | 'warning';

export interface InfoBannerProps {
  message: string;
  tone?: InfoBannerTone;
  testID?: string;
}

const GLYPH: Record<InfoBannerTone, string> = {
  info: 'ⓘ',
  offline: '⚑',
  warning: '⚠',
};

export function InfoBanner({ message, tone = 'info', testID }: InfoBannerProps) {
  const { theme } = useTheme();
  const bg =
    tone === 'warning'
      ? theme.colors.notice.danger
      : tone === 'offline'
        ? theme.colors.notice.neutral
        : theme.colors.notice.info;

  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      testID={testID}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        backgroundColor: bg,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.radius.md,
      }}
    >
      <Text variant="labelMedium" color="secondary" accessibilityElementsHidden>
        {GLYPH[tone]}
      </Text>
      <Text variant="bodySmall" color="secondary" style={{ flex: 1 }}>
        {message}
      </Text>
    </View>
  );
}
