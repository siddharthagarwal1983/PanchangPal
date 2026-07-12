/**
 * BrandLogo / SplashBackdrop (CMP_BRAND_LOGO / CMP_SPLASH_BACKDROP, PDD §5.13). Wordmark
 * placeholder for the shell (final asset is a Design System deliverable). SplashBackdrop
 * fills the screen with the warm brand backdrop (color.surface.brand) for the splash.
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';

export function BrandLogo({ testID }: { testID?: string }) {
  return (
    <Text variant="displaySmall" color="brand" accessibilityRole="image" accessibilityLabel="PanchangPal" testID={testID}>
      PanchangPal
    </Text>
  );
}

export function SplashBackdrop({ children, testID }: { children?: ReactNode; testID?: string }) {
  const { theme } = useTheme();
  return (
    <View
      testID={testID}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surface.brand, gap: theme.spacing.lg }}
    >
      {children}
    </View>
  );
}
