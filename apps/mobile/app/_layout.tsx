/**
 * Root Expo Router layout (TDD Part 1 §2.3). The 4-tab IA (UX-1) and per-tab stacks
 * are implemented in the navigation task; this placeholder establishes the router
 * entry so the app skeleton type-checks. Routes under app/ map to SCR_* surfaces.
 */
import { Slot } from 'expo-router';

export default function RootLayout() {
  return <Slot />;
}
