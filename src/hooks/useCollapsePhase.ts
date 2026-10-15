import { useEffect, useRef, useState } from 'react'

import { measureExitMs } from './usePresence.ts'

export type CollapsePhase = 'expanded' | 'collapsing' | 'collapsed' | 'expanding'

const marginMs = 50

export const useCollapsePhase = <Element extends HTMLElement = HTMLElement>(collapsed: boolean) => {
  const [phase, setPhase] = useState<CollapsePhase>(collapsed ? 'collapsed' : 'expanded')
  const ref = useRef<Element>(null)
  const settled: CollapsePhase = collapsed ? 'collapsed' : 'expanded'
  const moving: CollapsePhase = collapsed ? 'collapsing' : 'expanding'

  if (phase !== settled && phase !== moving) setPhase(moving)

  useEffect(() => {
    if (phase !== moving) return undefined

    const element = ref.current
    const measured = element ? measureExitMs(element) : undefined
    if (!element || !measured) {
      setPhase(settled)

      return undefined
    }

    const finish = () => setPhase(settled)
    const handleEnd = (event: TransitionEvent) => {
      if (event.target === element && (event.propertyName === 'inline-size' || event.propertyName === 'width')) finish()
    }
    const timer = setTimeout(finish, measured + marginMs)

    element.addEventListener('transitionend', handleEnd)

    return () => {
      clearTimeout(timer)
      element.removeEventListener('transitionend', handleEnd)
    }
  }, [phase, moving, settled])

  return { phase, ref, compact: phase === 'collapsed' }
}
