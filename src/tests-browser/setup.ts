import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
import { cdp, page } from 'vitest/browser'

afterEach(async () => {
  cleanup()
  document.documentElement.removeAttribute('dir')
  document.documentElement.removeAttribute('data-theme')
  document.body.removeAttribute('style')
  window.localStorage.clear()
  window.scrollTo(0, 0)
  await cdp().send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] })
  await page.viewport(1280, 800)
})
