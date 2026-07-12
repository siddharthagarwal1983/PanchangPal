import { View } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
import { PrimaryButton } from './PrimaryButton';

export interface RitualIntroProps { title: string; body?: string; beginLabel: string; onBegin: () => void; testID?: string; }

export function RitualIntro({ title, body, beginLabel, onBegin, testID }: RitualIntroProps) {
  const { theme } = useTheme();
  return <View testID={testID} style={{ gap: theme.spacing.lg }} accessibilityRole="summary">
    <View style={{ gap: theme.spacing.sm }}>
      <Text variant="titleLarge" color="onInverse">{title}</Text>
      {body ? <Text variant="bodyLarge" color="onInverse">{body}</Text> : null}
    </View>
    <PrimaryButton label={beginLabel} onPress={onBegin} testID="ritual-begin" />
  </View>;
}
