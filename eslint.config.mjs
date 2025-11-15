import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import { defineConfig } from 'eslint/config';
import globals from 'globals';

export default defineConfig([
  // Ignores
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'eslint.config.mjs', 'jest.config.cjs', 'jest.setup.js'],
  },

  // Plugin integration
  js.configs.all,
  eslintPluginPrettierRecommended,

  // Main JS rules
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.node,
      sourceType: 'commonjs',
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

  // TypeScript rules
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.json',
      },
      globals: globals.node,
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    rules: {
      // ESLint
      'new-cap': 'off',
      'max-classes-per-file': 'off',
      'no-unused-vars': 'off',
      'consistent-return': 'off',
      'class-methods-use-this': 'off',
      'no-negated-condition': 'off',
      'require-unicode-regexp': 'off',
      'prefer-named-capture-group': 'off',
      'no-useless-escape': 'off',
      'no-inline-comments': 'off',
      'no-else-return': 'off',
      'prefer-destructuring': 'off',
      'no-eq-null': 'off',
      eqeqeq: 'off',
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

      // TypeScript specific
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',

      // Prettier
      'prettier/prettier': 'error',
    },
  },

  // Test files override
  {
    files: ['tests/**/*.spec.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.json',
      },
      globals: { ...globals.node, ...globals.jest },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    rules: {
      'no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
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
