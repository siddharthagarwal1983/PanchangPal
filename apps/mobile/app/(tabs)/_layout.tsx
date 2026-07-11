/**
 * 4-tab navigator (TDD Part 4 §3.1, UX-1: today | calendar | guru | you), realized
 * as CMP_BOTTOM_TAB_BAR. Per-tab stacks and back-nav rules (PDD §2.4) are refined in
 * the navigation task; tab icons/labels come from tokens + i18n. Empty shell only.
 */
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="today/index" options={{ title: 'Today' }} />
      <Tabs.Screen name="calendar/index" options={{ title: 'Calendar' }} />
      <Tabs.Screen name="guru/index" options={{ title: 'Ask Guru' }} />
      <Tabs.Screen name="you/index" options={{ title: 'You' }} />
    </Tabs>
  );
}
