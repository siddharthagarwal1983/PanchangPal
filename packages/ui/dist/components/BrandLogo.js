import { jsx as _jsx } from "react/jsx-runtime";
import { View } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
export function BrandLogo({ testID }) {
    return (_jsx(Text, { variant: "displaySmall", color: "brand", accessibilityRole: "image", accessibilityLabel: "PanchangPal", testID: testID, children: "PanchangPal" }));
}
export function SplashBackdrop({ children, testID }) {
    const { theme } = useTheme();
    return (_jsx(View, { testID: testID, style: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surface.brand, gap: theme.spacing.lg }, children: children }));
}
//# sourceMappingURL=BrandLogo.js.map