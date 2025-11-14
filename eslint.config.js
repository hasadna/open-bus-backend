import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import { defineConfig } from 'eslint/config';
import globals from 'globals';

export default defineConfig([
  // Plugin integration
  js.configs.all,
  eslintPluginPrettierRecommended,

  // Main JS rules
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.node,
      sourceType: 'module',
    },
    rules: {
      // ESLint
      camelcase: 'off',
      'capitalized-comments': 'off',
      complexity: 'off',
      'func-style': 'off',
      'id-length': 'off',
      'init-declarations': 'off',
      'max-lines': 'off',
      'max-lines-per-function': 'off',
      'max-params': 'off',
      'max-statements': 'off',
      'no-console': 'off',
      'no-empty-function': 'off',
      'no-magic-numbers': 'off',
      'no-ternary': 'off',
      'no-undefined': 'off',
      'one-var': ['error', 'never'],
      'sort-imports': 'off',
      'sort-keys': 'off',

      // Prettier
      'prettier/prettier': 'error',
    },
  },

  // Test files override
  {
    files: ['tests/**/*.test.{js,mjs,cjs}', 'tests/**/*.spec.{js,mjs,cjs}'],
    languageOptions: {
      globals: { ...globals.node, ...globals.mocha },
    },
    rules: {
      'no-unused-expressions': 'off',
    },
  },

  // Config files override
  {
    files: ['**/*.config.{js,mjs,cjs}'],
    rules: {
      'import/no-extraneous-dependencies': 'off',
    },
  },

  // TypeScript files
  {
    files: ['**/*.{ts,mts,cts}'],
    languageOptions: {
      parser: tsparser,
      ecmaVersion: 'latest',
      globals: globals.node,
      sourceType: 'module',
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      // Disable base ESLint rules that are covered by TypeScript
      'no-array-constructor': 'off',
      'no-empty-function': 'off',
      'no-extra-semi': 'off',
      'no-loss-of-precision': 'off',
      'no-unused-vars': 'off',
      'no-useless-constructor': 'off',

      // TypeScript specific rules
      '@typescript-eslint/no-array-constructor': 'error',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-extra-semi': 'error',
      '@typescript-eslint/no-loss-of-precision': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-useless-constructor': 'error',

      // Other rules from original config
      camelcase: 'off',
      'capitalized-comments': 'off',
      complexity: 'off',
      'func-style': 'off',
      'id-length': 'off',
      'init-declarations': 'off',
      'max-lines': 'off',
      'max-lines-per-function': 'off',
      'max-params': 'off',
      'max-statements': 'off',
      'no-console': 'off',
      'no-magic-numbers': 'off',
      'no-ternary': 'off',
      'no-undefined': 'off',
      'one-var': ['error', 'never'],
      'sort-imports': 'off',
      'sort-keys': 'off',

      // Prettier
      'prettier/prettier': 'error',
    },
  },

  // TypeScript test files
  {
    files: ['tests/**/*.test.{ts,mts,cts}', 'tests/**/*.spec.{ts,mts,cts}'],
    languageOptions: {
      parser: tsparser,
      globals: { ...globals.node, ...globals.mocha },
      sourceType: 'module',
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      'no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
    },
  },
]);
