import { jsx as _jsx } from "react/jsx-runtime";
import { View } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
export function AIChatBubble({ author, text, state = 'complete' }) {
    const { theme } = useTheme();
    const user = author === 'user';
    return _jsx(View, { accessibilityLiveRegion: state === 'streaming' ? 'polite' : 'none', accessibilityLabel: `${author === 'user' ? 'You' : 'Guru'}: ${text}`, style: { alignSelf: user ? 'flex-end' : 'flex-start', maxWidth: '85%', backgroundColor: user ? theme.colors.brand.primary : theme.colors.surface.muted, borderRadius: theme.radius.lg, padding: theme.spacing.md }, children: _jsx(Text, { variant: "bodyLarge", color: user ? 'onBrand' : 'primary', children: text }) });
}
//# sourceMappingURL=AIChatBubble.js.map