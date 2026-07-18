import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * CMP_LEGAL_FOOTNOTE (PDD §5 — Legal Footnote). Terms / privacy / renewal disclosure shown on
 * SCR_AUTH_001 and SCR_SUBSCRIPTION_001. Links are labeled tap targets that open legal docs; the
 * disclosure text uses `text.tertiary` — the minimum token that still meets AA (never fainter).
 * Tokens-only, no business logic. The `subscription` variant carries the store renewal terms.
 */
import { View, Pressable } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
export function LegalFootnote({ text, links = [], testID }) {
    const { theme } = useTheme();
    return (_jsxs(View, { style: { gap: theme.spacing.sm }, testID: testID, children: [_jsx(Text, { variant: "bodySmall", color: "tertiary", children: text }), links.length > 0 ? (_jsx(View, { style: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }, children: links.map((link) => (_jsx(Pressable, { onPress: link.onPress, accessibilityRole: "link", accessibilityLabel: link.label, hitSlop: 8, testID: `legal-link-${link.id}`, children: _jsx(Text, { variant: "bodySmall", color: "brand", children: link.label }) }, link.id))) })) : null] }));
}
//# sourceMappingURL=LegalFootnote.js.map