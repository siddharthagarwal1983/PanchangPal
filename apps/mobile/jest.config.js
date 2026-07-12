// jest-expo config for the mobile app (TDD Part 4 §10.3). Resolves workspace packages to
// source and strips ESM `.js` extension imports so TS sources load under babel-jest.
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['@testing-library/react-native/extend-expect'],
  moduleNameMapper: {
    '^@panchangpal/(.*)$': '<rootDir>/../../packages/$1/src/index.ts',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|expo-router|expo-modules-core|@panchangpal/.*)/)',
  ],
};
