import { jsx as _jsx } from "react/jsx-runtime";
import { Pressable } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
export function SourceChip({ title, onPress }) { const { theme } = useTheme(); return _jsx(Pressable, { accessibilityRole: "button", accessibilityLabel: `Source: ${title}`, onPress: onPress, style: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start', paddingHorizontal: theme.spacing.md, borderRadius: theme.radius.pill, backgroundColor: theme.colors.surface.chip }, children: _jsx(Text, { variant: "labelSmall", children: title }) }); }
//# sourceMappingURL=SourceChip.js.map