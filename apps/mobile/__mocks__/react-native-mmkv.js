// Automatic manual mock (adjacent to node_modules, so jest applies it to every suite without a
// jest.mock() call). react-native-mmkv v4's real entry point imports react-native-nitro-modules,
// which calls TurboModuleRegistry.getEnforcing at module load and throws in the node/jest env
// where no native runtime exists — crashing the whole suite before any test runs.
//
// This mock keeps importing the module side-effect-free, and makes createMMKV throw exactly as the
// native factory does when there is no on-device runtime. That drives ritualSessionRepository's
// memory-fallback path — the same behavior a device (or Expo Go) without the native module produces
// — which is precisely what the repository's degradation tests assert. The mmkv-success path is
// verified where it is real: the native FLOW_SESSION_PERSISTENCE E2E build.
module.exports = {
  createMMKV: () => {
    throw new Error('createMMKV: native runtime unavailable (jest mock).');
  },
};
