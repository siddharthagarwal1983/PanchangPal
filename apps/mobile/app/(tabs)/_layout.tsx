/**
 * 4-tab navigator (TDD Part 4 §3.1, UX-1: Today / Calendar / Ask Guru / You) using the
 * CMP_BOTTOM_TAB_BAR component (@panchangpal/ui) via Expo Router's tabBar render prop.
 * Per-tab stacks + back-nav rules (PDD §2.4) are preserved by Expo Router; localized labels.
 */
import { Tabs } from 'expo-router';
import { BottomTabBar, type TabItem } from '@panchangpal/ui';
import { t } from '../../src/i18n';

const LABELS: Record<string, string> = {
  'today/index': t('tabs.today'),
  'calendar/index': t('tabs.calendar'),
  'guru/index': t('tabs.guru'),
  'you/index': t('tabs.you'),
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={({ state, navigation }) => {
        const items: TabItem[] = state.routes.map((route, index) => ({
          key: route.key,
          label: LABELS[route.name] ?? route.name,
          focused: state.index === index,
          onPress: () => navigation.navigate(route.name),
          testID: `tab-${route.name.split('/')[0]}`,
        }));
        return <BottomTabBar items={items} />;
      }}
    >
      <Tabs.Screen name="today/index" />
      <Tabs.Screen name="calendar/index" />
      <Tabs.Screen name="guru/index" />
      <Tabs.Screen name="you/index" />
    </Tabs>
  );
}
