import * as axeMatchers from 'vitest-axe/matchers'
import { cleanup } from '@testing-library/react'
import { afterEach, expect, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'

expect.extend(axeMatchers)

afterEach(() => cleanup())

const evaluateQuery = (query: string) => {
  const width = window.innerWidth
  const min = query.match(/\(min-width:\s*(\d+)px\)/)
  const max = query.match(/\(max-width:\s*(\d+)px\)/)
  if (min && width < Number(min[1])) return false
  if (max && width > Number(max[1])) return false

  return Boolean(min || max)
}

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: evaluateQuery(query),
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn()
  })
})
