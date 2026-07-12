/**
 * LocationChip (CMP_LOCATION_CHIP, PDD §5.5) — location/accuracy chip on the panchang card.
 * Shows the city (trust signal) with a pin icon marker (text-labeled, not color-only).
 */
import { View } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';

export function LocationChip({ city, testID }: { city: string; testID?: string }) {
  const { theme } = useTheme();
  return (
    <View
      accessibilityLabel={`Location, ${city}`}
      testID={testID}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
        backgroundColor: theme.colors.surface.chip,
        borderRadius: theme.radius.pill,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        alignSelf: 'flex-start',
      }}
    >
      <Text variant="labelSmall" color="secondary">
        ◍ {city}
      </Text>
    </View>
  );
}
