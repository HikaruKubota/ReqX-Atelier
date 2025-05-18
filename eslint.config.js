import { FlatCompat } from '@eslint/eslintrc';

import path from 'path';
import eslint from '@eslint/js';
const { configs: eslintConfigs } = eslint;
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const compat = new FlatCompat({
  baseDirectory: path.resolve(__dirname),
  recommendedConfig: eslintConfigs.recommended,
});

export default [
  ...compat.config({
    env: { browser: true, node: true, es2021: true },
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:react/recommended',
      'plugin:storybook/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaFeatures: { jsx: true },
      ecmaVersion: 12,
      sourceType: 'module',
    },
    plugins: ['@typescript-eslint', 'react'],
    settings: { react: { version: 'detect' } },
    rules: {},
  }),
];
