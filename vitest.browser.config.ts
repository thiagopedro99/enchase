import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'
import { devices } from 'playwright'

import base from './vite.config.ts'

import type { CDPSession, FrameLocator, Page } from 'playwright'

const browsers = ['chromium', 'firefox', 'webkit'] as const
const requested = process.env.ENCHASE_BROWSER ?? 'chromium'
const browser = browsers.find((name) => name === requested)

if (!browser) throw new Error(`unknown browser: ${requested}`)

const touchSpec = 'src/tests-browser/touch.spec.tsx'

const protocolSessions = new WeakMap<Page, Promise<CDPSession>>()

const protocolSessionOf = (page: Page) => {
  const existing = protocolSessions.get(page)

  if (existing) return existing

  const created = page.context().newCDPSession(page)

  protocolSessions.set(page, created)

  return created
}

const browserOptions = (provider = playwright()) => ({
  enabled: true,
  headless: true,
  provider,
  commands: {
    emulateMedia: async (context: { page: { emulateMedia: (options: Record<string, string>) => Promise<void> } }, options: Record<string, string>) => {
      await context.page.emulateMedia(options)
    },
    emulateReducedTransparency: async (context: { page: Page }, value: string) => {
      const session = await protocolSessionOf(context.page)

      await session.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-transparency', value }] })
    },
    pressMouse: async (context: { iframe: FrameLocator; page: Page }, selector: string) => {
      await context.iframe.locator(selector).first().hover()
      await context.page.mouse.down()
    },
    releaseMouse: async (context: { page: Page }) => {
      await context.page.mouse.move(0, 0)
      await context.page.mouse.up()
    }
  },
  instances: [{ browser }],
  viewport: { width: 1280, height: 800 }
})

export default defineConfig({
  plugins: base.plugins,
  resolve: base.resolve,
  optimizeDeps: { include: ['axe-core'] },
  test: {
    setupFiles: ['./src/tests-browser/setup.ts'],
    css: true,
    projects: [
      { extends: true, test: { name: 'pointer', include: ['src/tests-browser/**/*.spec.{ts,tsx}'], exclude: [touchSpec], browser: browserOptions() } },
      { extends: true, test: { name: 'touch', include: [touchSpec], browser: browserOptions(browser === 'webkit' ? playwright({ contextOptions: devices['iPhone 15'] }) : playwright()) } }
    ]
  }
})
