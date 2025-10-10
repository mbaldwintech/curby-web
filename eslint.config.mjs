import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import prettierPlugin from 'eslint-plugin-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import react from 'eslint-plugin-react/configs/recommended.js';
import { dirname } from 'path';
import tseslint from 'typescript-eslint';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname
});

const eslintConfig = [
  js.configs.recommended,

  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  ...compat.extends('plugin:@typescript-eslint/recommended'),
  ...compat.extends('plugin:prettier/recommended'),

  react,

  {
    files: ['next-env.d.ts'],
    rules: {
      '@typescript-eslint/triple-slash-reference': 'off'
    }
  },

  {
    plugins: {
      'react-hooks': reactHooks,
      prettier: prettierPlugin
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          tabWidth: 2,
          trailingComma: 'none',
          endOfLine: 'auto',
          semi: true,
          printWidth: 120
        }
      ]
    },
    settings: {
      react: {
        version: 'detect'
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json'
        }
      }
    },
    ignores: ['**/node_modules/**', '**/.next/**', '**/out/**', '**/build/**', '**/next-env.d.ts', '**/.vscode/**']
  },

  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        browser: true,
        node: true
      },
      parser: tseslint.parser
    }
  }
];

export default eslintConfig;
