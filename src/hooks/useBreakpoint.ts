import { useCallback, useSyncExternalStore } from 'react'

import { useUIConfig } from './useUIConfig.ts'

import type { BreakpointKey, Breakpoints } from '../components/uiProvider/types.ts'

const order: BreakpointKey[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl']

const rank = (name: BreakpointKey) => order.indexOf(name)

const widest = (breakpoints: Breakpoints): BreakpointKey => order.filter((name) => window.matchMedia(`(min-width: ${breakpoints[name]})`).matches).at(-1) ?? 'xs'

export const useBreakpoint = (server: BreakpointKey = 'xs') => {
  const { breakpoints } = useUIConfig()

  const subscribe = useCallback(
    (notify: () => void) => {
      const lists = order.map((name) => window.matchMedia(`(min-width: ${breakpoints[name]})`))

      lists.forEach((list) => list.addEventListener('change', notify))

      return () => lists.forEach((list) => list.removeEventListener('change', notify))
    },
    [breakpoints]
  )

  const current = useSyncExternalStore(
    subscribe,
    () => widest(breakpoints),
    () => server
  )

  return {
    current,
    up: (name: BreakpointKey) => rank(current) >= rank(name),
    down: (name: BreakpointKey) => rank(current) < rank(name)
  }
}
