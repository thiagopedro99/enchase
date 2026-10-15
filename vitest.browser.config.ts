import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'

import base from './vite.config.ts'

const browsers = ['chromium', 'firefox', 'webkit'] as const
const requested = process.env.ENCHASE_BROWSER ?? 'chromium'
const browser = browsers.find((name) => name === requested)

if (!browser) throw new Error(`unknown browser: ${requested}`)

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
      commands: {
        emulateMedia: async (context: { page: { emulateMedia: (options: Record<string, string>) => Promise<void> } }, options: Record<string, string>) => {
          await context.page.emulateMedia(options)
        }
      },
      instances: [{ browser }],
      viewport: { width: 1280, height: 800 }
    }
  }
})
