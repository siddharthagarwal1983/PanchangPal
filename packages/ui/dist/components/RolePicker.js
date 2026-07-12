import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * RolePicker (CMP_ROLE_PICKER, PDD §5) — single-select of a household member's role
 * {Anchor, Parent, Elder, Youth, Other}. Built on CMP_SEGMENTED so it inherits the accessible
 * radiogroup semantics (selected announced; not color-only; ≥44 targets) rather than inventing
 * a new control. The parent owns the value and supplies localized option labels; default per
 * context (self = Anchor) is decided by the caller.
 */
import { View } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
import { SegmentedControl } from './SegmentedControl';
export function RolePicker({ options, value, onChange, label, disabled, testID }) {
    const { theme } = useTheme();
    return (_jsxs(View, { style: { gap: theme.spacing.sm }, children: [_jsx(Text, { variant: "labelMedium", color: "secondary", accessibilityRole: "header", children: label }), _jsx(SegmentedControl, { options: options, value: value, onChange: onChange, accessibilityLabel: label, disabled: disabled, testID: testID })] }));
}
//# sourceMappingURL=RolePicker.js.map