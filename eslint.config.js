import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

const reactPackages = ['react', 'react/*', 'react-dom', 'react-dom/*']

const publicEntries = ['enchase', 'enchase/*', '**/lib/*']

const styleEntries = ['@styles/presets/*', '**/presets/*']

const stylesBoundary = (files, forbidden, message, { withReact = true } = {}) => ({
  files,
  rules: {
    'no-restricted-imports': ['error', { patterns: [{ group: withReact ? [...forbidden, '@*', ...reactPackages] : forbidden, message }] }]
  }
})

export default tseslint.config(
  { ignores: ['dist', 'dist-lib', 'storybook-static', '.claude'] },
  {
    files: ['src/components/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: ['@docs/*', 'react-router', 'react-router-dom', 'react-router/*', 'react-router-dom/*', ...publicEntries, ...styleEntries] }]
    }
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/docs/**', 'src/components/**', 'src/tests/**', 'src/tests-browser/**', 'src/styles/presets/**'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [...publicEntries, ...styleEntries] }]
    }
  },
  {
    files: ['src/tests/**/*.{ts,tsx}', 'src/tests-browser/**/*.{ts,tsx}'],
    ignores: ['src/tests/lib/**', 'src/tests-browser/dist.d.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: publicEntries }]
    }
  },
  {
    files: ['src/docs/**/*.{ts,tsx}', '.storybook/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: ['@components/*', '@hooks/*', '@styles/*', '@motion/*', '@utils/*', '@locales/*', '@tests/*', '**/src/*', '**/lib/*'] }]
    }
  },
  {
    files: ['demo/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: ['@components/*', '@hooks/*', '@styles/*', '@motion/*', '@utils/*', '@locales/*', '@docs/*', '@tests/*', '**/src/*', '**/lib/*'] }]
    }
  },
  stylesBoundary(['src/styles/tokens/**/*.ts'], ['../**'], 'styles/tokens must not import anything from outside tokens, nor react'),
  stylesBoundary(['src/styles/theme/**/*.ts'], ['../css/**', '../presets/**', '../react.tsx', '../index.ts', '../../**'], 'styles/theme may only import from styles/tokens, and must not use react nor the presets'),
  stylesBoundary(['src/styles/css/**/*.ts'], ['../theme/**', '../presets/**', '../react.tsx', '../index.ts', '../../**'], 'styles/css may only import from styles/tokens, and must not use react nor the presets'),
  stylesBoundary(['src/styles/presets/**/*.ts'], ['../css/**', '../react.tsx', '../index.ts', '../../**', '../theme/**', '!../theme/style.ts', './*', ...publicEntries], 'a style may only import defineStyle from styles/theme/style.ts and types from styles/tokens: it is data, and it does not know the other styles'),
  stylesBoundary(['src/styles/react.tsx'], ['./tokens/**', './theme/**', './presets/**', './index.ts', '../**', '@*'], 'styles/react.tsx may only import from styles/css', { withReact: false }),
  stylesBoundary(['src/styles/index.ts'], ['./react.tsx', './presets/**'], 'the public styles entry must not export react components nor the presets, which have their own entry', { withReact: false }),
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
      'no-console': ['error', { allow: ['warn', 'error'] }],
      '@typescript-eslint/no-empty-object-type': ['error', { allowInterfaces: 'with-single-extends' }],
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
)
