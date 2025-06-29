import js from '@eslint/js';
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
]);
