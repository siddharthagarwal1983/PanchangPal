import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * MemberRow (CMP_MEMBER_ROW, PDD §5 / §5-household) — one household member: a decorative
 * initials avatar, the member's name, and a "{role} · {depth}" subtitle. The whole row carries
 * a single merged accessibility label (avatar is decorative, name is in the label). An optional
 * remove control is a separate ≥44 destructive button, shown only to the owner. Tokens-only.
 */
import { View, Pressable } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
export function MemberRow({ initials, name, subtitle, onRemove, removeLabel, ownerBadgeLabel, testID }) {
    const { theme } = useTheme();
    const avatar = {
        width: 40,
        height: 40,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.colors.surface.chip,
        alignItems: 'center',
        justifyContent: 'center',
    };
    const label = ownerBadgeLabel ? `${name}, ${ownerBadgeLabel}. ${subtitle}` : `${name}. ${subtitle}`;
    return (_jsxs(View, { style: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, minHeight: 44, paddingVertical: theme.spacing.sm }, testID: testID, children: [_jsxs(View, { style: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, flex: 1 }, accessible: true, accessibilityLabel: label, children: [_jsx(View, { style: avatar, accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", children: _jsx(Text, { variant: "labelMedium", color: "secondary", children: initials }) }), _jsxs(View, { style: { flex: 1, gap: theme.spacing.xs }, children: [_jsxs(View, { style: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }, children: [_jsx(Text, { variant: "bodyLarge", children: name }), ownerBadgeLabel ? (_jsx(View, { style: {
                                            paddingHorizontal: theme.spacing.sm,
                                            paddingVertical: 2,
                                            borderRadius: theme.radius.pill,
                                            backgroundColor: theme.colors.brand.tonalBg,
                                        }, children: _jsx(Text, { variant: "labelSmall", color: "brand", children: ownerBadgeLabel }) })) : null] }), _jsx(Text, { variant: "bodySmall", color: "secondary", children: subtitle })] })] }), onRemove ? (_jsx(Pressable, { onPress: onRemove, accessibilityRole: "button", accessibilityLabel: removeLabel ?? 'Remove', hitSlop: 8, style: { minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: theme.spacing.sm }, children: _jsx(Text, { variant: "labelMedium", color: "danger", children: removeLabel ?? 'Remove' }) })) : null] }));
}
//# sourceMappingURL=MemberRow.js.map