/**
 * Placeholder splash/onboarding entry (SCR_SPLASH_001). The onboarding gate routes
 * onboarded users to (tabs) and unonboarded users through the onboarding flow
 * (TDD Part 4 §3.4). Implemented in the onboarding/auth task.
 */
import { View, Text } from 'react-native';

export default function OnboardingIndex() {
  return (
    <View accessibilityRole="header">
      <Text>PanchangPal</Text>
    </View>
  );
}
