// Automatic manual mock (adjacent to node_modules, so jest applies it to every suite without a
// jest.mock() call). The real @sentry/react-native entry point reaches for the native RNSentry
// module at import time; in the node/jest env there is no native runtime, and the SDK is not in
// jest.config.js's transformIgnorePatterns allowlist either — so importing it for real would break
// suites before any assertion runs. The same reason react-native-mmkv is mocked here.
//
// WHAT THIS DOES AND DOES NOT PROVE. The mock records calls, so the tests can assert what the
// adapter ASKS the SDK to do — which options it initialises with, that it scrubs before sending,
// that it never passes a raw message, that it swallows failures. It cannot prove an event reaches
// Sentry; nothing off-device can. That requires a provisioned DSN and is stated as unverified
// rather than implied (TDD Part 5 §7.2).
const calls = {
  init: [],
  captureException: [],
  addBreadcrumb: [],
  setUser: [],
};

module.exports = {
  __calls: calls,
  __reset() {
    calls.init.length = 0;
    calls.captureException.length = 0;
    calls.addBreadcrumb.length = 0;
    calls.setUser.length = 0;
  },
  init(options) {
    calls.init.push(options);
  },
  captureException(error) {
    calls.captureException.push(error);
  },
  addBreadcrumb(crumb) {
    calls.addBreadcrumb.push(crumb);
  },
  setUser(user) {
    calls.setUser.push(user);
  },
  // withScope runs its callback synchronously against a scope that records tags, mirroring the
  // real API closely enough that `captureError` exercises its actual tagging path.
  withScope(cb) {
    const tags = {};
    cb({
      setTag(key, value) {
        tags[key] = value;
      },
    });
    calls.captureException.tags = tags;
  },
};
