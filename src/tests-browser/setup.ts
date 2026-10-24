import { setReducedMotion } from './media.ts'
import { cleanup } from '@testing-library/react'
import { parkMouse } from './pointer.ts'
import { afterEach } from 'vitest'
import { page } from 'vitest/browser'

afterEach(async () => {
  cleanup()
  document.documentElement.removeAttribute('dir')
  document.documentElement.removeAttribute('data-theme')
  document.body.removeAttribute('style')
  window.localStorage.clear()
  window.scrollTo(0, 0)
  await setReducedMotion('no-preference')
  await parkMouse()
  await page.viewport(1280, 800)
})
