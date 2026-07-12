/**
 * useOnline — connectivity hook for the offline banner (TDD Part 4 §6.4). Uses
 * @react-native-community/netinfo when available; defaults to online. Kept in the data
 * layer so features/UI consume a simple boolean, not the platform API.
 */
import { useEffect, useState } from 'react';

type NetInfoModule = {
  addEventListener: (cb: (s: { isConnected: boolean | null }) => void) => () => void;
};

export function useOnline(): boolean {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    let unsub: (() => void) | undefined;
    try {
      // Lazy require so the shell builds even before the dependency is installed.
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const NetInfo: NetInfoModule = require('@react-native-community/netinfo');
      unsub = NetInfo.addEventListener((s) => setOnline(s.isConnected !== false));
    } catch {
      setOnline(true);
    }
    return () => unsub?.();
  }, []);
  return online;
}
