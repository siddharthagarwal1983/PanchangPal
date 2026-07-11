/**
 * SCR_HOME_001 — Today (MOD_today). Empty shell; the daily loop (panchang, ritual,
 * streak, checklist) is built in the Today feature task. Cached-first render < 500ms
 * (NFR-02) is a requirement of that task, not this scaffold.
 */
import { View, Text } from 'react-native';

export default function TodayScreen() {
  return (
    <View>
      <Text accessibilityRole="header">Today</Text>
    </View>
  );
}
