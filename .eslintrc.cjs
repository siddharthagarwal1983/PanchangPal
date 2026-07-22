/**
 * ADR-026 enforcement (issue #30). `new Date().toISOString().slice(0, 10)` is UTC by
 * definition, and it was used as the user's LOCAL date on two screens — so in New Zealand and
 * Australia the morning ritual was recorded against yesterday for the whole local morning.
 *
 * It survived review and type-checking because it produces a perfectly valid date string; only
 * the value is wrong. Nothing in lint, tsc, the unit suite, or a UTC CI runner could see it.
 * ADR-026 already mandated "a single tz-aware utility — no ad-hoc Date arithmetic anywhere";
 * this is that mandate made mechanical, because a convention enforced only by review is the
 * one that let this through.
 *
 * Scope is deliberately narrow: date-KEY derivation, not display formatting. Rendering a
 * human-readable label in the ambient locale (Intl.DateTimeFormat for a month heading) is
 * legitimate and untouched. What is banned is turning an instant into a YYYY-MM-DD that gets
 * stored, queried, or used as a storage key.
 */
const noUtcDateKey = [
  {
    selector:
      "CallExpression[callee.property.name=/^(slice|substring|substr)$/][callee.object.callee.property.name='toISOString']",
    message:
      'Slicing toISOString() yields the UTC date, not the user\'s (ADR-026, issue #30). Use localDateIn(instant, timeZone) from @panchangpal/shared, with the zone from useLocalDate / resolveTimeZone.',
  },
  {
    selector:
      "CallExpression[callee.property.name='split'][callee.object.callee.property.name='toISOString']",
    message:
      "Splitting toISOString() on 'T' yields the UTC date, not the user's (ADR-026, issue #30). Use localDateIn(instant, timeZone) from @panchangpal/shared.",
  },
];

module.exports = {
  root: true,

  parser: '@typescript-eslint/parser',

  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.base.json'],
  },

  plugins: [
    '@typescript-eslint',
    'import',
    'react-hooks',
  ],

  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:react-hooks/recommended',
    'prettier',
  ],

  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },

    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: ['./tsconfig.base.json'],
      },

      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },

  ignorePatterns: [
    '**/node_modules/**',
    '**/dist/**',
    '**/.turbo/**',
    '**/coverage/**',
    '*.config.js',
    '*.config.ts',
  ],

  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-non-null-assertion': 'warn',

    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],

    'import/no-cycle': 'error',
    'import/export': 'off',

    // Disable noisy false positives
    'import/no-named-as-default': 'off',
    'import/no-named-as-default-member': 'off',

    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'openai',
            message:
              'The mobile app must never import the OpenAI SDK. LLM access is server-side only.',
          },
        ],
      },
    ],

    'no-restricted-syntax': ['error', ...noUtcDateKey],
  },

  overrides: [
    {
      /**
       * The ADR-026 test suite must SHOW the banned pattern to be worth anything: it asserts,
       * at a fixed instant, that the UTC slice and the tz-aware derivation disagree. Exempting
       * this one file by name rather than all tests keeps the guard live everywhere else — a
       * test can encode a wrong-date expectation just as easily as production code can.
       */
      files: ['packages/shared/src/time.test.ts'],
      rules: {
        'no-restricted-syntax': 'off',
      },
    },
  ],
};