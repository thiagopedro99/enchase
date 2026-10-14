import { useEffect, useState } from 'react'

import { useUIConfig } from './useUIConfig.ts'

import type { BreakpointKey, Breakpoints } from '../components/uiProvider/types.ts'

const order: BreakpointKey[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl']

const rank = (name: BreakpointKey) => order.indexOf(name)

const widest = (breakpoints: Breakpoints): BreakpointKey => {
  if (typeof window === 'undefined') return 'xs'

  return order.filter((name) => window.matchMedia(`(min-width: ${breakpoints[name]})`).matches).at(-1) ?? 'xs'
}

export const useBreakpoint = () => {
  const { breakpoints } = useUIConfig()
  const [current, setCurrent] = useState<BreakpointKey>(() => widest(breakpoints))

  useEffect(() => {
    const lists = order.map((name) => window.matchMedia(`(min-width: ${breakpoints[name]})`))
    const update = () => setCurrent(widest(breakpoints))

    update()
    lists.forEach((list) => list.addEventListener('change', update))

    return () => lists.forEach((list) => list.removeEventListener('change', update))
  }, [breakpoints])

  return {
    current,
    up: (name: BreakpointKey) => rank(current) >= rank(name),
    down: (name: BreakpointKey) => rank(current) < rank(name)
  }
}
