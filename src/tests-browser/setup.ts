import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
import { page } from 'vitest/browser'

afterEach(async () => {
  cleanup()
  document.documentElement.removeAttribute('dir')
  document.body.removeAttribute('style')
  await page.viewport(1280, 800)
})
