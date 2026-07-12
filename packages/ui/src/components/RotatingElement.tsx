/**
 * RotatingElement (CMP_ROTATING_ELEMENT, PDD §5.5) — the daily quote/fact/on-this-day.
 * brandSubtle surface, body.large. Labeled "Today's reflection"; motion is decorative only
 * (Reduced-Motion → none). Never intrusive.
 */
import { View } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';

export type RotatingType = 'quote' | 'fact' | 'on_this_day';

export function RotatingElement({ text, label = "Today's reflection", testID }: { text: string; label?: string; testID?: string }) {
  const { theme } = useTheme();
  return (
    <View
      accessibilityLabel={label}
      testID={testID}
      style={{ backgroundColor: theme.colors.brand.brandSubtle, borderRadius: theme.radius.md, padding: theme.spacing.md }}
    >
      <Text variant="bodyLarge" color="primary">
        {text}
      </Text>
    </View>
  );
}
