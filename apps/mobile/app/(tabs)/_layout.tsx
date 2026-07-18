/**
 * 4-tab navigator (TDD Part 4 §3.1, UX-1: Today / Calendar / Ask Guru / You) using the
 * CMP_BOTTOM_TAB_BAR component (@panchangpal/ui) via Expo Router's tabBar render prop.
 * Per-tab stacks + back-nav rules (PDD §2.4) are preserved by Expo Router; localized labels.
 */
import { Tabs } from 'expo-router';
import { BottomTabBar, type TabItem } from '@panchangpal/ui';
import { t } from '../../src/i18n';
import { visibleTabs } from '../../src/navigation/tabs';

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
      // `state.routes` carries EVERY registered screen, including those declared
      // `href: null` and any file route Expo Router auto-registers, so it must be
      // narrowed to the four tabs (src/navigation/tabs.ts) — mapping it directly put
      // ritual, guru/chat and the whole You stack in the tab bar.
      tabBar={({ state, navigation }) => {
        const items: TabItem[] = visibleTabs(state.routes, state.index).map((tab) => ({
          key: tab.key,
          label: LABELS[tab.name] ?? tab.name,
          focused: tab.focused,
          onPress: () => navigation.navigate(tab.name),
          testID: `tab-${tab.name.split('/')[0]}`,
        }));
        return <BottomTabBar items={items} />;
      }}
    >
      <Tabs.Screen name="today/index" />
      <Tabs.Screen name="today/ritual" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="calendar/index" />
      <Tabs.Screen name="guru/index" />
      <Tabs.Screen name="guru/chat" options={{ href: null }} />
      <Tabs.Screen name="guru/history" options={{ href: null }} />
      <Tabs.Screen name="you/index" />
      <Tabs.Screen name="you/notifications" options={{ href: null }} />
      <Tabs.Screen name="you/settings" options={{ href: null }} />
      <Tabs.Screen name="you/household" options={{ href: null }} />
      <Tabs.Screen name="you/subscription" options={{ href: null }} />
      {/* Declared for parity with its siblings; it was previously auto-registered only. */}
      <Tabs.Screen name="you/delete-account" options={{ href: null }} />
    </Tabs>
  );
}
