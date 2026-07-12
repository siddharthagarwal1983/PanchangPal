import { Pressable, View } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';

export interface TraditionOption { value: string; label: string; }
export interface TraditionSwitcherProps { selected: string; options: readonly TraditionOption[]; label: string; onSelect: (value: string) => void; testID?: string; }

export function TraditionSwitcher({ selected, options, label, onSelect, testID }: TraditionSwitcherProps) {
  const { theme } = useTheme();
  return <View testID={testID} accessibilityLabel={label} style={{ gap: theme.spacing.sm }}>
    <Text variant="labelMedium">{label}</Text>
    <View accessibilityRole="menu" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
      {options.map((option) => <Pressable key={option.value} accessibilityRole="menuitem" accessibilityLabel={option.label} accessibilityState={{ selected: option.value === selected }} onPress={() => onSelect(option.value)} style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: theme.spacing.md, borderRadius: theme.radius.md, backgroundColor: option.value === selected ? theme.colors.brand.tonalBg : theme.colors.surface.raised }}><Text variant="labelMedium">{option.label}</Text></Pressable>)}
    </View>
  </View>;
}
