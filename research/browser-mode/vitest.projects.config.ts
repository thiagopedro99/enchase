import { defineConfig, mergeConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'
import viteConfig from './vite.config.ts'

const base = viteConfig({ command: 'serve', mode: 'test' })
delete base.test?.include

export default mergeConfig(
  base,
  defineConfig({
    optimizeDeps: {
      include: ['react-dom/client', 'react/jsx-dev-runtime', 'motion/react', '@testing-library/react', '@testing-library/user-event', '@testing-library/jest-dom/vitest', 'axe-core', 'vitest-axe/matchers']
    },
    test: {
      projects: [
        {
          extends: true,
          test: { name: 'unit', environment: 'jsdom', include: ['src/**/*.test.{ts,tsx}'], exclude: ['src/tests/probe/**'] }
        },
        {
          extends: true,
          test: {
            name: 'browser',
            include: ['src/tests/components/**/*.test.tsx'],
            exclude: ['src/tests/components/common/{Button,Checkbox,Tooltip}/**'],
            browser: {
              enabled: true,
              headless: true,
              provider: playwright({
                launchOptions: process.env.PW_EXECUTABLE ? { executablePath: process.env.PW_EXECUTABLE } : {}
              }),
              viewport: { width: 1280, height: 800 },
              instances: [{ browser: 'chromium' }, { browser: 'firefox' }, { browser: 'webkit' }]
            }
          }
        }
      ]
    }
  })
)
