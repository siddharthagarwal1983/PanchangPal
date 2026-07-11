// PanchangPal — root ESLint config (TDD Part 1 §5 engineering standards).
// Enforces strict TypeScript, import hygiene, and the dependency-direction rule
// features → domain → data → packages (UI never imports data; domain never imports UI;
// the app never imports the OpenAI SDK or service-role key). Rule packages are added
// with the toolchain install; this config declares the intent and boundaries.
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  rules: {
    // Strict typing (TDD §5): no `any`, prefer `unknown` + narrowing.
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    'import/no-cycle': 'error',
    // Dependency-direction & secret-safety boundaries (enforced via import/no-restricted-paths
    // once packages are installed; documented here as the standard).
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'openai',
            message:
              'The mobile app must never import the OpenAI SDK. LLM access is server-side only (ADR-006/011).',
          },
        ],
      },
    ],
  },
  ignorePatterns: ['dist/', 'node_modules/', '*.config.js', '*.config.ts'],
};
