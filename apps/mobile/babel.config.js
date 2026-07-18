// Expo + Reanimated Babel config (TDD Part 4 §8.2 native-driver motion).
// Reanimated 4 (SDK 54) moved its Babel plugin into the react-native-worklets package;
// 'react-native-reanimated/plugin' no longer exists. The worklets plugin MUST be last.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-worklets/plugin'],
  };
};
