import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Checklist + ChecklistItem (CMP_CHECKLIST, PDD §5.6) — 3–5 curated micro-actions with inline
 * completion. Each item role=checkbox with `checked` announced; not color-only (check icon +
 * label). Toggle is optimistic (the parent hook queues offline + reverts on error). All-done
 * is a calm acknowledgment — no confetti.
 */
import { View, Pressable } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
function ChecklistItem({ item, onToggle }) {
    const { theme } = useTheme();
    return (_jsxs(Pressable, { onPress: () => onToggle(item.id), accessibilityRole: "checkbox", accessibilityState: { checked: item.complete }, accessibilityLabel: item.label, hitSlop: 8, style: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, minHeight: 44 }, testID: `checklist-item-${item.id}`, children: [_jsx(Text, { variant: "bodyLarge", style: { color: item.complete ? theme.colors.accent.positive : theme.colors.icon.muted }, children: item.complete ? '☑' : '☐' }), _jsx(Text, { variant: "bodyLarge", color: item.complete ? 'tertiary' : 'primary', children: item.label })] }));
}
export function Checklist({ items, onToggle, allDoneLabel, testID }) {
    const { theme } = useTheme();
    const allDone = items.length > 0 && items.every((i) => i.complete);
    return (_jsxs(View, { style: { gap: theme.spacing.sm }, testID: testID, children: [items.map((item) => (_jsx(ChecklistItem, { item: item, onToggle: onToggle }, item.id))), allDone && allDoneLabel ? (_jsx(Text, { variant: "labelMedium", color: "brand", accessibilityLiveRegion: "polite", children: allDoneLabel })) : null] }));
}
//# sourceMappingURL=Checklist.js.map