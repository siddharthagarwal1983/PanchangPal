// jest-expo config for the UI component library (PDD §5.13A.6 required coverage).
module.exports = {
  preset: 'jest-expo',
  // @testing-library/react-native v13 removed the separate `extend-expect` entry point;
  // its jest matchers are now registered automatically by the main import.
  moduleNameMapper: {
    '^@panchangpal/(.*)$': '<rootDir>/../$1/src/index.ts',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  // pnpm nests deps under node_modules/.pnpm/<name>@<ver>/node_modules/<name>, so the flat
  // jest-expo pattern never transforms RN/Expo packages (Flow syntax then fails to parse). Match
  // the .pnpm dir names (scope separator is '+') and transform the RN/Expo/workspace packages.
  transformIgnorePatterns: [
    'node_modules/.pnpm/(?!(jest-)?(react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@panchangpal)[@+-])',
  ],
};
