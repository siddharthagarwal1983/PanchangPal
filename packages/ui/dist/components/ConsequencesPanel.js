import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * ConsequencesPanel (CMP_CONSEQUENCES_PANEL, PDD §5) — enumerates what account deletion will do,
 * before the destructive confirm (SCR_DELETE_ACCOUNT_001). Static + informational; the danger tone
 * is carried by the wording and a subtle danger surface (never color alone). Readable at max Dynamic
 * Type: each consequence is its own line item and the list is exposed to assistive tech as a group.
 * Tokens-only; the caller supplies already-localized, variant-appropriate copy.
 */
import { View } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
export function ConsequencesPanel({ title, consequences, testID }) {
    const { theme } = useTheme();
    return (_jsxs(View, { accessible: true, accessibilityLabel: `${title}. ${consequences.join('. ')}`, style: {
            backgroundColor: theme.colors.surface.dangerSubtle,
            borderRadius: theme.radius.md,
            padding: theme.spacing.lg,
            gap: theme.spacing.md,
        }, testID: testID, children: [_jsx(Text, { variant: "titleSmall", color: "danger", children: title }), _jsx(View, { style: { gap: theme.spacing.sm }, children: consequences.map((c, i) => (_jsxs(View, { style: { flexDirection: 'row', gap: theme.spacing.sm }, children: [_jsx(Text, { variant: "bodyLarge", color: "secondary", accessibilityElementsHidden: true, importantForAccessibility: "no", children: '•' }), _jsx(Text, { variant: "bodyLarge", color: "primary", style: { flex: 1 }, children: c })] }, i))) })] }));
}
//# sourceMappingURL=ConsequencesPanel.js.map