import { useLayoutEffect, useRef } from 'react'

import { reflowEase } from './defaultData.ts'

import type { RefObject } from 'react'

const flipAnimationId = 'enchase-flip'

const longestTransition = (element: HTMLElement) =>
  Math.max(
    0,
    ...getComputedStyle(element)
      .transitionDuration.split(',')
      .map((value) => (value.trim().endsWith('ms') ? Number.parseFloat(value) : Number.parseFloat(value) * 1000))
      .filter(Number.isFinite)
  )

const runningFlips = (element: HTMLElement) => (element.getAnimations?.() ?? []).filter((animation) => animation.id === flipAnimationId)

const flipOffset = (element: HTMLElement) => {
  if (runningFlips(element).length === 0) return 0

  return Number.parseFloat(getComputedStyle(element).translate.split(' ')[1] ?? '') || 0
}

export const useFlip = (containerRef: RefObject<HTMLElement | null>, enabled: boolean) => {
  const tops = useRef(new Map<string, number>())

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return

    const next = new Map<string, number>()
    const moved: [HTMLElement, number][] = []

    for (const child of Array.from(container.children)) {
      if (!(child instanceof HTMLElement) || !child.dataset.flipId) continue

      const offset = flipOffset(child)
      const top = child.getBoundingClientRect().top - offset
      const previous = tops.current.get(child.dataset.flipId)

      next.set(child.dataset.flipId, top)
      if (previous === undefined || Math.abs(previous - top) < 1) continue

      runningFlips(child).forEach((animation) => animation.cancel())
      moved.push([child, previous - top + offset])
    }

    tops.current = next
    if (!enabled) return

    const spring = getComputedStyle(container).getPropertyValue('--enchase-motion-spring-snappy').trim()

    for (const [element, delta] of moved) {
      if (typeof element.animate !== 'function') continue

      const durationMs = longestTransition(element)
      if (durationMs <= 0) continue

      element.animate([{ translate: `0 ${delta}px` }, { translate: '0 0' }], { id: flipAnimationId, duration: durationMs, easing: spring || reflowEase })
    }
  })
}
