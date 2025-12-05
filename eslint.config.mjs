import jest from 'eslint-plugin-jest'
import globals from 'globals'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

export default [
  ...compat.extends('eslint:recommended', 'plugin:eslint-comments/recommended', 'plugin:prettier/recommended'),
  {
    plugins: {
      jest,
    },

    languageOptions: {
      globals: {
        ...globals.commonjs,
        ...globals.node,
      },

      ecmaVersion: 12,
      sourceType: 'module',
    },

    rules: {
      'require-await': 'error',
      'no-console': 'warn',
      'no-warning-comments': 'warn',
      'no-nested-ternary': 'error',
      'jest/no-focused-tests': 'error',
      'jest/no-disabled-tests': 'error',
      'standard/no-callback-literal': 'off',
      'default-param-last': 'off',
      camelcase: 'off',
      'space-before-function-paren': 0,
      'no-unused-vars': [
        2,
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      'jest/expect-expect': [
        'error',
        {
          assertFunctionNames: ['expect', 'request.*.expect', 'request.**.expect'],
        },
      ],
    },
  },
  ...compat.extends('plugin:jest-dom/recommended', 'plugin:jest/recommended').map((config) => ({
    ...config,

    files: ['src/app/**/*.spec.js', 'src/config/**/*.spec.js', 'src/setup/**/*.spec.js'],
  })),
  {
    files: ['src/app/**/*.spec.js', 'src/config/**/*.spec.js', 'src/setup/**/*.spec.js'],

    rules: {
      'jest/no-standalone-expect': 'off',
      'no-unused-vars': 'off',
    },
  },
]
