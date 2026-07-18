// Babel config for the UI package's jest-expo test run. babel-preset-expo strips React
// Native's Flow syntax (e.g. @react-native/js-polyfills) so the component tests can parse
// the RN runtime. .cjs because this package is ESM ("type": "module").
module.exports = { presets: ['babel-preset-expo'] };
