import { Pressable } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';

export function SourceChip({ title, onPress }: { title: string; onPress: () => void }) { const { theme } = useTheme(); return <Pressable accessibilityRole="button" accessibilityLabel={`Source: ${title}`} onPress={onPress} style={{ minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start', paddingHorizontal: theme.spacing.md, borderRadius: theme.radius.pill, backgroundColor: theme.colors.surface.chip }}><Text variant="labelSmall">{title}</Text></Pressable>; }
