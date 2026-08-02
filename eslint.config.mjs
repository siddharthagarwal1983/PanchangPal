/**
 * ESLint flat config (ESLint 9). Ported from `.eslintrc.cjs` — same rules, same guard, same
 * exemption. Flat config is mandatory in ESLint 9; `.eslintrc.*` is no longer read.
 *
 * ONE CONFIG, SEVEN PACKAGES. Each package's `lint` script runs `eslint src` (or `eslint app src`)
 * from its own directory, and ESLint 9 searches upward from the working directory for
 * `eslint.config.*`, so they all resolve this file. That is the property to re-check if a package
 * ever lints with zero rules applied — silently linting nothing looks exactly like passing.
 *
 * ---
 *
 * ADR-026 enforcement (issue #30). `new Date().toISOString().slice(0, 10)` is UTC by definition,
 * and it was used as the user's LOCAL date on two screens — so in New Zealand and Australia the
 * morning ritual was recorded against yesterday for the whole local morning.
 *
 * It survived review and type-checking because it produces a perfectly valid date string; only the
 * value is wrong. Nothing in lint, tsc, the unit suite, or a UTC CI runner could see it. ADR-026
 * already mandated "a single tz-aware utility — no ad-hoc Date arithmetic anywhere"; this is that
 * mandate made mechanical, because a convention enforced only by review is the one that let this
 * through.
 *
 * Scope is deliberately narrow: date-KEY derivation, not display formatting. Rendering a
 * human-readable label in the ambient locale (Intl.DateTimeFormat for a month heading) is
 * legitimate and untouched. What is banned is turning an instant into a YYYY-MM-DD that gets
 * stored, queried, or used as a storage key.
 */
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createRequire } from 'node:module';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

/**
 * `import/parsers` is keyed by a module NAME that eslint-plugin-import `require()`s from its own
 * location. Under pnpm's nested store that lookup fails, and the plugin then calls `parser.parse`
 * on a string — surfacing as "parser.parse is not a function" on every `react-native` import,
 * reported against `import/namespace`. Resolving to an ABSOLUTE PATH here sidesteps the lookup.
 * This is the fourth time pnpm's layout has broken a flat-`node_modules` assumption in this repo,
 * after `@babel/runtime`, `babel-preset-expo`, and `@sentry/cli`.
 */
const TS_PARSER_PATH = require.resolve('@typescript-eslint/parser');

const noUtcDateKey = [
  {
    selector:
      "CallExpression[callee.property.name=/^(slice|substring|substr)$/][callee.object.callee.property.name='toISOString']",
    message:
      "Slicing toISOString() yields the UTC date, not the user's (ADR-026, issue #30). Use localDateIn(instant, timeZone) from @panchangpal/shared, with the zone from useLocalDate / resolveTimeZone.",
  },
  {
    selector:
      "CallExpression[callee.property.name='split'][callee.object.callee.property.name='toISOString']",
    message:
      "Splitting toISOString() on 'T' yields the UTC date, not the user's (ADR-026, issue #30). Use localDateIn(instant, timeZone) from @panchangpal/shared.",
  },
];

export default tseslint.config(
  // `ignorePatterns` has no flat-config equivalent; a top-level `ignores` block replaces it.
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.turbo/**',
      '**/coverage/**',
      '**/*.config.js',
      '**/*.config.mjs',
      '**/*.config.ts',
      '**/android/**',
      '**/ios/**',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  // `configs.flat.recommended`, NOT `configs['recommended-latest']`. The plugin exposes both an
  // eslintrc-shaped `recommended` (a `plugins: ['react-hooks']` array, which flat config rejects)
  // and a nested `configs.flat.*` with a proper plugins object. `flat.recommended` carries the same
  // 16 rules the old `.eslintrc.cjs` got from `plugin:react-hooks/recommended`; `recommended-latest`
  // adds a 17th (`void-use-memo`). Matching rule-for-rule keeps this a MIGRATION rather than a
  // migration plus a silent rule change.
  reactHooks.configs.flat.recommended,
  prettier,

  {
    files: ['**/*.{ts,tsx}'],

    languageOptions: {
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        // Flat config resolves `project` relative to the config file, not the cwd — which is what
        // lets one root config serve seven packages each invoking eslint from its own directory.
        tsconfigRootDir: ROOT,
        project: ['./tsconfig.base.json'],
      },
    },

    settings: {
      'import/parsers': {
        // Absolute path, not the bare name — see TS_PARSER_PATH above for why.
        [TS_PARSER_PATH]: ['.ts', '.tsx', '.d.ts'],
      },

      /**
       * `react-native`'s main entry is `index.js`, and it is **Flow** (`@flow strict-local`) — no
       * TypeScript or JavaScript parser can read it. `import/namespace` parses every imported
       * module to enumerate its exports, so it chokes there and reports 51 errors across
       * `packages/ui`.
       *
       * Under eslintrc this never surfaced, because the TS resolver reached `react-native/types`
       * (`.d.ts`) first. Flat config resolves the same package to `index.js` from `packages/ui`,
       * where `react-native` is a `*` peer rather than a pinned dependency.
       *
       * `import/ignore` is the setting for exactly this: a module whose SOURCE cannot be parsed.
       * Scoped to `react-native` alone, so `import/namespace` stays live for everything else —
       * turning the rule off wholesale would have been the easy fix and a silent loss of coverage.
       */
      'import/ignore': ['react-native'],
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: [path.join(ROOT, 'tsconfig.base.json')],
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },

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
  },

  {
    /**
     * The ADR-026 test suite must SHOW the banned pattern to be worth anything: it asserts, at a
     * fixed instant, that the UTC slice and the tz-aware derivation disagree. Exempting this one
     * file by name rather than all tests keeps the guard live everywhere else — a test can encode a
     * wrong-date expectation just as easily as production code can.
     *
     * The path is matched loosely because ESLint resolves `files` against the working directory,
     * which differs per package.
     */
    files: ['**/packages/shared/src/time.test.ts', '**/src/time.test.ts'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
);
