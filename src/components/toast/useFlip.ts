import { useLayoutEffect, useRef } from 'react'

import { reflowEase } from './defaultData.ts'

import type { RefObject } from 'react'

const flipAnimationId = 'enchase-flip'

export const useFlip = (containerRef: RefObject<HTMLElement | null>, durationMs: number) => {
  const tops = useRef(new Map<string, number>())

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return

    const next = new Map<string, number>()
    const moved: [HTMLElement, number][] = []

    for (const child of Array.from(container.children)) {
      if (!(child instanceof HTMLElement) || !child.dataset.flipId) continue

      for (const animation of child.getAnimations?.() ?? []) if (animation.id === flipAnimationId) animation.cancel()

      const top = child.getBoundingClientRect().top
      const previous = tops.current.get(child.dataset.flipId)

      next.set(child.dataset.flipId, top)
      if (previous !== undefined && Math.abs(previous - top) >= 1) moved.push([child, previous - top])
    }

    tops.current = next
    if (durationMs <= 0) return

    for (const [element, delta] of moved) {
      if (typeof element.animate !== 'function') continue

      const animation = element.animate([{ translate: `0 ${delta}px` }, { translate: '0 0' }], { duration: durationMs, easing: reflowEase })
      animation.id = flipAnimationId
    }
  })
}
