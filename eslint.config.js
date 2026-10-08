import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

const reactPackages = ['react', 'react/*', 'react-dom', 'react-dom/*']

const stylesBoundary = (files, forbidden, message, { withReact = true } = {}) => ({
  files,
  rules: {
    'no-restricted-imports': ['error', { patterns: [{ group: withReact ? [...forbidden, '@*', ...reactPackages] : forbidden, message }] }]
  }
})

export default tseslint.config(
  { ignores: ['dist', 'storybook-static', 'research'] },
  {
    files: ['src/components/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: ['@docs/*'] }]
    }
  },
  stylesBoundary(['src/styles/tokens/**/*.ts'], ['../**'], 'styles/tokens must not import anything from outside tokens, nor react'),
  stylesBoundary(['src/styles/theme/**/*.ts'], ['../css/**', '../react.tsx', '../index.ts', '../../**'], 'styles/theme may only import from styles/tokens, and must not use react'),
  stylesBoundary(['src/styles/css/**/*.ts'], ['../theme/**', '../react.tsx', '../index.ts', '../../**'], 'styles/css may only import from styles/tokens, and must not use react'),
  stylesBoundary(['src/styles/react.tsx'], ['./tokens/**', './theme/**', './index.ts', '../**', '@*'], 'styles/react.tsx may only import from styles/css', { withReact: false }),
  stylesBoundary(['src/styles/index.ts'], ['./react.tsx'], 'the public styles entry must not export react components', { withReact: false }),
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-empty-object-type': ['error', { allowInterfaces: 'with-single-extends' }],
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
)
