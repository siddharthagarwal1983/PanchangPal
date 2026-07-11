// Expo + Reanimated Babel config (TDD Part 4 §8.2 native-driver motion).
// The reanimated plugin MUST be last.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
