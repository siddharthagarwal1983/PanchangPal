import { View } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';

export interface AIChatBubbleProps { author: 'user' | 'assistant'; text: string; state?: 'streaming' | 'complete' | 'declined' | 'refused' | 'error'; }

export function AIChatBubble({ author, text, state = 'complete' }: AIChatBubbleProps) {
  const { theme } = useTheme();
  const user = author === 'user';
  return <View accessibilityLiveRegion={state === 'streaming' ? 'polite' : 'none'} accessibilityLabel={`${author === 'user' ? 'You' : 'Guru'}: ${text}`} style={{ alignSelf: user ? 'flex-end' : 'flex-start', maxWidth: '85%', backgroundColor: user ? theme.colors.brand.primary : theme.colors.surface.muted, borderRadius: theme.radius.lg, padding: theme.spacing.md }}><Text variant="bodyLarge" color={user ? 'onBrand' : 'primary'}>{text}</Text></View>;
}
