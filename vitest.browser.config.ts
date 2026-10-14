import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'

import base from './vite.config.ts'

export default defineConfig({
  plugins: base.plugins,
  resolve: base.resolve,
  test: {
    include: ['src/tests-browser/**/*.spec.{ts,tsx}'],
    setupFiles: ['./src/tests-browser/setup.ts'],
    css: true,
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
      viewport: { width: 1280, height: 800 }
    }
  }
})
