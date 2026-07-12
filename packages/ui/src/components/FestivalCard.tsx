/**
 * FestivalCard (CMP_FESTIVAL_CARD, PDD §5.4) — today's festival (conditional; hidden if none).
 * Regional name + one-line significance; taps to detail. Illustration is decorative.
 */
import { View } from 'react-native';
import { useTheme } from '../theme';
import { Card } from './Card';
import { Text } from './Text';

export interface FestivalCardProps {
  name: string;
  significance: string;
  onPress?: () => void;
  openLabel?: string;
  testID?: string;
}

export function FestivalCard({ name, significance, onPress, openLabel, testID }: FestivalCardProps) {
  const { theme } = useTheme();
  return (
    <Card onPress={onPress} accessibilityLabel={openLabel ?? `Festival today, ${name}, open details`} testID={testID}>
      <View style={{ gap: theme.spacing.xs }}>
        <Text variant="titleSmall" color="primary">
          {name}
        </Text>
        <Text variant="bodyMedium" color="secondary">
          {significance}
        </Text>
      </View>
    </Card>
  );
}
