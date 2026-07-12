import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Skeleton (CMP_SKELETON) — structural loading placeholder (PDD §5.13). Skeletons over
 * spinners for structural loads. Static under Reduced Motion (no shimmer), per §6.6.
 */
import { View } from 'react-native';
import { useTheme } from '../theme';
export function Skeleton({ width = '100%', height = 16, radiusToken = 'md', testID }) {
    const { theme } = useTheme();
    const style = {
        width,
        height,
        borderRadius: theme.radius[radiusToken],
        backgroundColor: theme.colors.surface.skeleton,
    };
    // Shimmer animation (motion.skeleton) is added with Reanimated in the Design System task;
    // static is the Reduced-Motion-safe default.
    return _jsx(View, { style: style, accessibilityElementsHidden: true, importantForAccessibility: "no", testID: testID });
}
//# sourceMappingURL=Skeleton.js.map