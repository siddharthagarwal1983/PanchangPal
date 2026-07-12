/**
 * BottomTabBar (CMP_BOTTOM_TAB_BAR) — the 4-tab primary navigation (UX-1: Today / Calendar
 * / Ask Guru / You). Presentational + accessible; wired to Expo Router's Tabs via the
 * `tabBar` render prop. Labels always visible (not icon-only, PDD §5.7 a11y); active =
 * brand color + filled state, inactive = muted; not color-only (filled vs outline marker);
 * ≥48 targets; role=tablist with per-tab selected state.
 */
import { View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { Text } from './Text';

export interface TabItem {
  key: string;
  label: string;
  focused: boolean;
  onPress: () => void;
  testID?: string;
}

export function BottomTabBar({ items }: { items: TabItem[] }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      accessibilityRole="tablist"
      style={{
        flexDirection: 'row',
        backgroundColor: theme.colors.surface.elevated,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border.subtle,
        paddingBottom: insets.bottom,
        minHeight: 56 + insets.bottom,
      }}
    >
      {items.map((item) => (
        <Pressable
          key={item.key}
          onPress={item.onPress}
          accessibilityRole="tab"
          accessibilityState={{ selected: item.focused }}
          accessibilityLabel={`${item.label}, tab`}
          testID={item.testID}
          style={{ flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', paddingVertical: theme.spacing.sm }}
        >
          {/* Filled (active) vs outline (inactive) dot keeps state non-color-only. */}
          <Text variant="labelSmall" style={{ color: item.focused ? theme.colors.brand.primary : theme.colors.icon.muted }}>
            {item.focused ? '●' : '○'}
          </Text>
          <Text variant="labelSmall" style={{ color: item.focused ? theme.colors.brand.primary : theme.colors.icon.muted }}>
            {item.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
