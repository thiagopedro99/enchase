import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'
import { devices } from 'playwright'

import { consumerCss } from './scripts/consumerCss.mjs'
import base from './vite.config.ts'

import type { Plugin } from 'vite'
import type { CDPSession, FrameLocator, Page } from 'playwright'

const consumerStylesId = 'virtual:enchase-consumer-css'

const consumerStyles = (): Plugin => ({
  name: 'enchase-consumer-css',
  resolveId: (source) => (source === consumerStylesId ? `\0${consumerStylesId}` : undefined),
  load: async (id) => {
    if (id !== `\0${consumerStylesId}`) return undefined

    const [plain, layered] = await Promise.all([consumerCss(resolve('dist-lib/styles.css')), consumerCss(resolve('dist-lib/styles.layer.css'))])

    return `export const plain = ${JSON.stringify(plain)}\nexport const layered = ${JSON.stringify(layered)}`
  }
})

const browsers = ['chromium', 'firefox', 'webkit'] as const
const requested = process.env.ENCHASE_BROWSER ?? 'chromium'
const browser = browsers.find((name) => name === requested)

if (!browser) throw new Error(`unknown browser: ${requested}`)

const touchSpec = 'src/tests-browser/platform/touch.spec.tsx'

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
    },
    parkMouse: async (context: { page: Page }) => {
      await context.page.mouse.move(-1, -1)
    }
  },
  instances: [{ browser }],
  viewport: { width: 1280, height: 800 }
})

export default defineConfig({
  plugins: [...(base.plugins ?? []), consumerStyles()],
  resolve: base.resolve,
  optimizeDeps: { include: ['axe-core', 'react-dom/client'] },
  test: {
    setupFiles: ['./src/tests-browser/setup.ts'],
    css: true,
    projects: [
      { extends: true, test: { name: 'pointer', include: ['src/tests-browser/**/*.spec.{ts,tsx}'], exclude: [touchSpec], browser: browserOptions() } },
      { extends: true, test: { name: 'touch', include: [touchSpec], browser: browserOptions(browser === 'webkit' ? playwright({ contextOptions: devices['iPhone 15'] }) : playwright()) } }
    ]
  }
})
