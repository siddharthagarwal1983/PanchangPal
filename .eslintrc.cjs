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
  },
};