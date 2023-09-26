/* eslint-disable node/no-unsupported-features/es-syntax */
module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['node', '@typescript-eslint', 'import'],
  env: {
    browser: false,
    node: true,
    es2021: true,
  },
  parserOptions: {
    // Only ESLint 6.2.0 and later support ES2020.
    ecmaVersion: 2020,
  },
  extends: [
    'turbo',
    'airbnb-base',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:node/recommended',
    'prettier',
  ],
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
    'max-len': ['error', { code: 180 }],
    'no-console': 'off',
    'no-debugger': 'off',
    'no-param-reassign': 'off',
    'nonblock-statement-body-position': ['error', 'any'],
    curly: ['error', 'multi-or-nest'],
    'no-underscore-dangle': 'off',
    semi: [2, 'never'],
    'import/extensions': 'off',
    // 'node/no-unpublished-import': 'off',
    'node/no-unsupported-features/es-syntax': [
      'error',
      {
        version: '>=18.0.0',
        ignores: ['modules'],
      },
    ],
    'node/no-extraneous-import': [
      'error',
      {
        allowModules: ['vitest'],
      },
    ],
    'func-call-spacing': 'off',
    'comma-spacing': 'off',
    'no-spaced-func': 'off',
    'implicit-arrow-linebreak': 'off',
    'no-use-before-define': 'off',
    // '@typescript-eslint/no-use-before-define': ['error', { typedefs: false }],
    '@typescript-eslint/comma-spacing': ['error'],
    '@typescript-eslint/func-call-spacing': ['error'],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '_.*' }],
    // 'import/no-extraneous-dependencies': ['error', { packageDir: ['./vitest'] }],
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'error',
    'no-restricted-syntax': ['error', 'ForInStatement', 'LabeledStatement', 'WithStatement'],
  },
  settings: {
    node: {
      tryExtensions: ['.js', '.json', '.ts', '.d.ts'],
      allowModules: ['vitest', 'tsup'],
    },
    'import/resolver': {
      typescript: {},
    },
    'import/core-modules': ['vitest', 'tsup'],
  },
}
