/**
 * PanchangCard (CMP_PANCHANG_CARD, PDD §5.4) — today's panchang summary. States:
 * default / loading (skeleton) / offline (cached + chip) / error (card-isolated micro-error
 * + retry) / unavailable (engine blocked, ADR-033 — a calm "temporarily unavailable", NEVER
 * fabricated values). The card-level error/unavailable is isolated so the rest of Home stays
 * usable (AC-HOME-04). SR reads date → location → tithi → nakshatra → festival.
 */
import { View } from 'react-native';
import { useTheme } from '../theme';
import { Card } from './Card';
import { Text } from './Text';
import { Skeleton } from './Skeleton';
import { LocationChip } from './LocationChip';

export interface PanchangSummary {
  dateLabel: string;
  city: string;
  tithi: string;
  nakshatra: string;
  festivalHint?: string;
}

export interface PanchangCardProps {
  data?: PanchangSummary | null;
  loading?: boolean;
  offline?: boolean;
  /** Engine blocked (ADR-033) or fetch failed → show the calm unavailable state, not data. */
  unavailable?: { message: string; onRetry?: () => void } | null;
  onPress?: () => void;
  openLabel?: string;
  retryLabel?: string;
  testID?: string;
}

export function PanchangCard({
  data,
  loading = false,
  offline = false,
  unavailable = null,
  onPress,
  openLabel = "Today's panchang, open details",
  retryLabel = 'Try again',
  testID,
}: PanchangCardProps) {
  const { theme } = useTheme();

  if (loading) {
    return (
      <Card testID={testID}>
        <View style={{ gap: theme.spacing.sm }}>
          <Skeleton width="40%" height={14} />
          <Skeleton width="70%" height={26} />
          <Skeleton width="55%" height={14} />
        </View>
      </Card>
    );
  }

  if (unavailable || !data) {
    return (
      <Card testID={testID}>
        <View style={{ gap: theme.spacing.sm }} accessibilityRole="summary">
          <Text variant="labelMedium" color="secondary">
            Today's panchang
          </Text>
          <Text variant="titleMedium" color="primary">
            {unavailable?.message ?? 'Temporarily unavailable'}
          </Text>
          {unavailable?.onRetry ? (
            <Text variant="labelLarge" color="brand" onPress={unavailable.onRetry} accessibilityRole="button" testID="panchang-retry">
              {retryLabel}
            </Text>
          ) : null}
        </View>
      </Card>
    );
  }

  return (
    <Card onPress={onPress} accessibilityLabel={openLabel} testID={testID}>
      <View style={{ gap: theme.spacing.sm }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant="labelMedium" color="secondary">
            {data.dateLabel}
          </Text>
          <LocationChip city={data.city} />
        </View>
        <Text variant="displaySmall" color="primary">
          {data.tithi}
        </Text>
        <Text variant="titleSmall" color="secondary">
          {data.nakshatra}
        </Text>
        {data.festivalHint ? (
          <Text variant="bodyMedium" color="brand">
            {data.festivalHint}
          </Text>
        ) : null}
        {offline ? (
          <Text variant="labelSmall" color="tertiary">
            Saved from your last connection
          </Text>
        ) : null}
      </View>
    </Card>
  );
}
