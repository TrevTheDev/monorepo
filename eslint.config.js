import globals from 'globals'
import js from '@eslint/js'
import airbnbBase from 'eslint-config-airbnb-base'
import eslintConfigPrettier from 'eslint-config-prettier'
import importPlugin from 'eslint-plugin-import'
import eslintPluginNode from 'eslint-plugin-node'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'

const { extends: airbnbRules, ...airbnbConfig } = airbnbBase

const envMapping = {
  builtin: 'builtin',
  es5: 'es5',
  es6: 'es2015',
  es2016: 'es2015',
  es2017: 'es2017',
  es2018: 'es2017',
  es2019: 'es2017',
  es2020: 'es2020',
  es2021: 'es2021',
  es2022: 'es2021',
  es2023: 'es2021',
  es2024: 'es2021',
  browser: 'browser',
  worker: 'worker',
  node: 'node',
  nodeBuiltin: 'nodeBuiltin',
  commonjs: 'commonjs',
  amd: 'amd',
  mocha: 'mocha',
  jasmine: 'jasmine',
  jest: 'jest',
  qunit: 'qunit',
  phantomjs: 'phantomjs',
  couch: 'couch',
  rhino: 'rhino',
  nashorn: 'nashorn',
  wsh: 'wsh',
  jquery: 'jquery',
  yui: 'yui',
  shelljs: 'shelljs',
  prototypejs: 'prototypejs',
  meteor: 'meteor',
  mongo: 'mongo',
  applescript: 'applescript',
  serviceworker: 'serviceworker',
  atomtest: 'atomtest',
  embertest: 'embertest',
  protractor: 'protractor',
  'shared-node-browser': 'shared-node-browser',
  webextensions: 'webextensions',
  greasemonkey: 'greasemonkey',
  devtools: 'devtools',
}
function convertIntoEslintFlatConfig(config) {
  const {
    env, // convert to explicit `globals` list
    parserOptions, // move into `languageOptions`
    plugins: _plugins, // remove the `plugins` key as it will be spread directly during export
    ...oldConfig
  } = config
  return {
    ...oldConfig,
    languageOptions: {
      ...('env' in config && {
        globals: Object.fromEntries(
          Object.keys(env)
            .filter((key) => env[key] === true && key in envMapping && envMapping[key] in globals)
            .flatMap((key) => Object.entries(globals[envMapping[key]])),
        ),
        ...('parserOptions' in config && {
          parserOptions,
        }),
      }),
    },
  }
}

async function eslintCfg() {
  const allAirbnbRules = await Promise.all(
    airbnbRules.map(async (rule) => convertIntoEslintFlatConfig((await import(rule)).default)),
  )
  return [
    {
      ignores: ['dist/**', 'node_modules/**', 'bin/**', 'build/**'],
    },
    js.configs.recommended,
    ...allAirbnbRules,
    convertIntoEslintFlatConfig(airbnbConfig),
    {
      files: ['**/*.+(ts|tsx|mts|cts|js|mjs|cjs|jsx)'],
      plugins: {
        node: eslintPluginNode,
        '@typescript-eslint': tsPlugin,
        import: importPlugin,
      },
      languageOptions: {
        ecmaVersion: 'latest',
        globals: globals.node,
        parser: tsParser,
      },
      rules: {
        ...importPlugin.configs.typescript.rules,
        ...eslintPluginNode.configs.recommended.rules,
        ...tsPlugin.configs['eslint-recommended'].rules,
        ...tsPlugin.configs.recommended.rules,
        'max-len': ['error', { code: 180 }],
        'no-console': 'off',
        'no-debugger': 'off',
        'no-param-reassign': 'off',
        'nonblock-statement-body-position': ['error', 'any'],
        curly: ['error', 'multi-or-nest'],
        'no-underscore-dangle': 'off',
        semi: [2, 'never'],
        'import/extensions': 'off',
        'node/no-missing-import': [
          'error',
          {
            tryExtensions: ['.js', '.ts'],
          },
        ],
        'func-call-spacing': 'off',
        'comma-spacing': 'off',
        'no-spaced-func': 'off',
        'implicit-arrow-linebreak': 'off',
        'no-use-before-define': 'off',
        '@typescript-eslint/comma-spacing': ['error'],
        '@typescript-eslint/func-call-spacing': ['error'],
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '_.*', varsIgnorePattern: '_.*' },
        ],
        'no-shadow': 'off',
        '@typescript-eslint/no-shadow': 'error',
        'no-restricted-syntax': ['error', 'ForInStatement', 'LabeledStatement', 'WithStatement'],
        'no-redeclare': 'off',
        '@typescript-eslint/no-redeclare': 'error',
      },
      settings: {
        ...importPlugin.configs.typescript.settings,
        'import/resolver': {
          ...importPlugin.configs.typescript.settings['import/resolver'],
          typescript: true,
        },
      },
    },
    {
      files: ['**/*.test.ts'],
      rules: {
        'import/no-extraneous-dependencies': [
          'error',
          { includeInternal: true, includeTypes: true },
        ],
      },
    },
    {
      files: ['eslint.config.js'],
      rules: {
        'node/no-unpublished-import': [
          'error',
          {
            allowModules: [
              'globals',
              'eslint-config-airbnb-base',
              'eslint-plugin-import',
              'eslint-plugin-node',
              '@typescript-eslint',
            ],
          },
        ],
        'import/no-extraneous-dependencies': [
          'error',
          { includeInternal: true, includeTypes: true },
        ],
      },
    },
    eslintConfigPrettier,
  ]
}
export default eslintCfg()
