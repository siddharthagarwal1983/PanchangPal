/**
 * The device key-value seam. Extracted from `ritualSessionRepository` when a second caller (the
 * analytics pseudonymous id) needed exactly the same thing: durable local storage that degrades to
 * memory rather than crashing when the native module is absent.
 *
 * Nothing outside this file touches the MMKV API. Callers get `KeyValueStore`.
 */
import { createMMKV } from 'react-native-mmkv';

export interface KeyValueStore {
  getString(key: string): string | undefined;
  set(key: string, value: string): void;
  delete(key: string): void;
}

/**
 * In-memory fallback. Loses data when the process restarts, which costs a user the ability to
 * resume a ritual after closing the app — strictly better than the alternative, which was the
 * whole screen crashing.
 */
export function createMemoryStore(): KeyValueStore {
  const map = new Map<string, string>();
  return {
    getString: (key) => map.get(key),
    set: (key, value) => void map.set(key, value),
    delete: (key) => void map.delete(key),
  };
}

/** Which backend actually serves local storage. */
export type StorageBackend = 'mmkv' | 'memory';

let activeBackend: StorageBackend | null = null;

/**
 * The backend in use, or null before any storage has been resolved (it is lazy).
 *
 * This exists because the fallback below is SILENT, and silence made a real question
 * unanswerable: after completing a ritual, force-stopping the app and reopening it showed the
 * intro again. "The session was never persisted" and "MMKV is unavailable, so memory was used
 * and lost" produce identical behaviour, and nothing distinguished them from outside. Degrading
 * quietly is still the right call for the user — a screen crash is worse — but the degradation
 * must be observable to whoever is debugging it.
 */
export function getStorageBackend(): StorageBackend | null {
  return activeBackend;
}

/**
 * MMKV is a native module: it does not exist in Expo Go, and resolving it throws there. It can
 * also fail on a real device. Degrade to memory rather than taking the screen down — but say so.
 *
 * MMKV v4 (Nitro) creates instances through the `createMMKV()` factory rather than `new MMKV()`,
 * and this factory line is what supports the New Architecture's bridgeless runtime — v2's JSI
 * install failed under bridgeless, so every instance threw and ritual sessions silently ran on
 * memory and never survived a restart (caught by FLOW_SESSION_PERSISTENCE on a native build).
 */
export function createDeviceStore(): KeyValueStore {
  try {
    const mmkv = createMMKV();
    activeBackend = 'mmkv';
    // v4 renamed delete() → remove(); adapt to the KeyValueStore port so callers never see the
    // vendor API.
    return {
      getString: (key) => mmkv.getString(key),
      set: (key, value) => mmkv.set(key, value),
      delete: (key) => void mmkv.remove(key),
    };
  } catch (error) {
    activeBackend = 'memory';
    // Warn, not throw: the ritual still works, it just will not survive a restart. Visible in
    // Metro and in `adb logcat`, which is where this question gets asked.
    console.warn(
      '[storage] Persistent storage unavailable — falling back to memory. Ritual sessions will NOT ' +
        'survive an app restart. Expected in Expo Go (no native modules); investigate on a native build.',
      error,
    );
    return createMemoryStore();
  }
}

/** Test seam: forget the resolved backend so a fresh resolution can be observed. */
export function resetStorageBackendForTests(): void {
  activeBackend = null;
}
