/**
 * Card — base raised container (PDD §5.4 anatomy: surface.raised, radius.lg, elevation.card,
 * spacing.lg). Cards on Home compose this so padding/radius/border are consistent. Optional
 * `onPress` makes the whole card a labeled tap target (≥44).
 */
import type { ReactNode } from 'react';
import { View, Pressable, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';

export interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  muted?: boolean;
  testID?: string;
}

export function Card({ children, onPress, accessibilityLabel, muted = false, testID }: CardProps) {
  const { theme } = useTheme();
  const style: ViewStyle = {
    backgroundColor: muted ? theme.colors.surface.muted : theme.colors.surface.raised,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    padding: theme.spacing.lg,
  };
  if (onPress) {
    return (
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel} style={style} testID={testID}>
        {children}
      </Pressable>
    );
  }
  return (
    <View style={style} testID={testID}>
      {children}
    </View>
  );
}
