import { defineConfig, mergeConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'
import { fileURLToPath } from 'node:url'
import viteConfig from './vite.config.ts'
import type { BrowserCommand } from 'vitest/node'

const wheelAt: BrowserCommand<[number, number, number]> = async (ctx, x, y, dy) => {
  const frame = await ctx.frame()
  const box = await (await frame.frameElement()).boundingBox()
  await ctx.page.mouse.move((box?.x ?? 0) + x, (box?.y ?? 0) + y)
  await ctx.page.mouse.wheel(0, dy)
}

const glide: BrowserCommand<[number, number, number, number, number, number]> = async (ctx, x1, y1, x2, y2, steps, pause) => {
  const box = await (await (await ctx.frame()).frameElement()).boundingBox()
  const ox = box?.x ?? 0
  const oy = box?.y ?? 0
  await ctx.page.mouse.move(ox + x1, oy + y1)
  for (let i = 1; i <= steps; i += 1) {
    await ctx.page.mouse.move(ox + x1 + ((x2 - x1) * i) / steps, oy + y1 + ((y2 - y1) * i) / steps)
    await new Promise((r) => setTimeout(r, pause))
  }
}

const base = typeof viteConfig === 'function' ? viteConfig({ command: 'serve', mode: 'test' }) : viteConfig
const realEvents = process.env.REAL_EVENTS === '1'

export default mergeConfig(
  base,
  defineConfig({
    resolve: realEvents ? { alias: [{ find: /^@testing-library\/user-event$/, replacement: fileURLToPath(new URL('./research/browser-mode/user-event.shim.ts', import.meta.url)) }] } : {},
    optimizeDeps: { include: ['react-dom/client', 'react/jsx-dev-runtime', 'motion/react', '@testing-library/react', '@testing-library/user-event', '@testing-library/jest-dom/vitest', 'axe-core', 'vitest-axe/matchers'] },
    test: {
      environment: undefined,
      css: process.env.BROWSER_CSS === '1',
      setupFiles: [process.env.BROWSER_SETUP ?? './src/tests/setup.ts'],
      browser: {
        enabled: true,
        headless: true,
        provider: playwright({
          launchOptions: process.env.PW_EXECUTABLE ? { executablePath: process.env.PW_EXECUTABLE } : {},
          contextOptions: process.env.REDUCE === '1' ? { reducedMotion: 'reduce' } : {}
        }),
        instances: process.env.INSTANCES === '3' ? [{ browser: 'chromium', name: 'c1' }, { browser: 'chromium', name: 'c2' }, { browser: 'chromium', name: 'c3' }] : [{ browser: 'chromium' }],
        viewport: { width: 1280, height: 800 },
        commands: { wheelAt, glide }
      }
    }
  })
)
