import { View } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';

export function GuruHeader({ title, trustLine }: { title: string; trustLine: string }) {
  const { theme } = useTheme();
  return <View accessibilityRole="header" style={{ gap: theme.spacing.xs }}><Text variant="titleLarge">{title}</Text><Text variant="bodyMedium" color="secondary">{trustLine}</Text></View>;
}
