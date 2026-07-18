// jest-expo config for the mobile app (TDD Part 4 §10.3). Resolves workspace packages to
// source and strips ESM `.js` extension imports so TS sources load under babel-jest.
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['@testing-library/react-native/extend-expect'],
  moduleNameMapper: {
    '^@panchangpal/(.*)$': '<rootDir>/../../packages/$1/src/index.ts',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  // pnpm nests deps under node_modules/.pnpm/<name>@<ver>/node_modules/<name>, so the flat
  // pattern never transforms RN/Expo packages (their Flow syntax then fails to parse). Match the
  // .pnpm dir names (scope separator is '+') for the RN/Expo/navigation/workspace packages.
  transformIgnorePatterns: [
    'node_modules/.pnpm/(?!(jest-)?(react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|expo-router|expo-modules-core|@panchangpal)[@+-])',
  ],
};
