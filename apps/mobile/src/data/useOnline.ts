/**
 * useOnline — connectivity hook for the offline banner (TDD Part 4 §6.4).
 * Uses @react-native-community/netinfo and exposes a simple boolean so the
 * UI never depends directly on the platform API.
 */
import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

export function useOnline(): boolean {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setOnline(state.isConnected !== false);
    });

    return unsubscribe;
  }, []);

  return online;
}