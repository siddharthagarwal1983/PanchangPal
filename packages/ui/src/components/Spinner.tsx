/**
 * Spinner — loading indicator (PDD §5 loading state). Centered, brand-tinted, announced to
 * screen readers as busy. Reduced Motion is respected by the platform ActivityIndicator.
 */
import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '../theme';

export function Spinner({ label = 'Loading', testID }: { label?: string; testID?: string }) {
  const { theme } = useTheme();
  return (
    <View
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityState={{ busy: true }}
      testID={testID}
    >
      <ActivityIndicator color={theme.colors.brand.primary} size="large" />
    </View>
  );
}
