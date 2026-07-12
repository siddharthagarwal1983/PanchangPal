/**
 * Skeleton (CMP_SKELETON) — structural loading placeholder (PDD §5.13). Skeletons over
 * spinners for structural loads. Static under Reduced Motion (no shimmer), per §6.6.
 */
import { View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';

export interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  radiusToken?: 'sm' | 'md' | 'lg';
  testID?: string;
}

export function Skeleton({ width = '100%', height = 16, radiusToken = 'md', testID }: SkeletonProps) {
  const { theme } = useTheme();
  const style: ViewStyle = {
    width,
    height,
    borderRadius: theme.radius[radiusToken],
    backgroundColor: theme.colors.surface.skeleton,
  };
  // Shimmer animation (motion.skeleton) is added with Reanimated in the Design System task;
  // static is the Reduced-Motion-safe default.
  return <View style={style} accessibilityElementsHidden importantForAccessibility="no" testID={testID} />;
}
