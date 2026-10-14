import { afterEach, describe, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react'

import UIProvider from '@components/uiProvider/index.tsx'
import { useBreakpoint } from '@hooks/useBreakpoint.ts'
import { setViewportWidth } from '@tests/viewport.ts'

import type { UIProviderProps } from '@components/uiProvider/types.ts'
import type { ReactNode } from 'react'

const wrapperWith =
  (props: Omit<UIProviderProps, 'children'> = {}) =>
  ({ children }: { children: ReactNode }) => <UIProvider {...props}>{children}</UIProvider>

afterEach(() => setViewportWidth(1024))

describe('useBreakpoint', () => {
  it('names the widest breakpoint that matches, with the Bootstrap defaults', () => {
    const cases: Array<[number, string]> = [
      [320, 'xs'],
      [576, 'sm'],
      [767, 'sm'],
      [768, 'md'],
      [992, 'lg'],
      [1200, 'xl'],
      [1400, 'xxl']
    ]

    for (const [width, name] of cases) {
      setViewportWidth(width)
      const { result, unmount } = renderHook(() => useBreakpoint())

      expect(result.current.current, `${width}px`).toBe(name)
      unmount()
    }
  })

  it('answers up and down against the current breakpoint', () => {
    setViewportWidth(1000)
    const { result } = renderHook(() => useBreakpoint())

    expect(result.current.current).toBe('lg')
    expect(result.current.up('md')).toBe(true)
    expect(result.current.up('lg')).toBe(true)
    expect(result.current.up('xl')).toBe(false)
    expect(result.current.down('xl')).toBe(true)
    expect(result.current.down('lg')).toBe(false)
  })

  it('reads the breakpoints configured on the provider', () => {
    setViewportWidth(900)
    const { result } = renderHook(() => useBreakpoint(), { wrapper: wrapperWith({ breakpoints: { md: '1000px', lg: '1300px' } }) })

    expect(result.current.current).toBe('sm')
    expect(result.current.up('md')).toBe(false)
  })
})
