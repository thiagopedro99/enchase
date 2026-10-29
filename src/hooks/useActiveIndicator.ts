import { useLayoutEffect, useRef, useState } from 'react'

import type { RefObject } from 'react'

export type IndicatorBox = {
  top: number
  height: number
  visible: boolean
  animate: boolean
}

const hidden: IndicatorBox = { top: 0, height: 0, visible: false, animate: false }

const offsetWithin = (element: HTMLElement, container: HTMLElement) => {
  let top = 0
  let node: HTMLElement | null = element

  while (node && node !== container) {
    top += node.offsetTop
    node = node.offsetParent instanceof HTMLElement ? node.offsetParent : null
  }

  return node === container ? top : element.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop
}

export const useActiveIndicator = (containerRef: RefObject<HTMLElement | null>, activeKey: string | undefined, compact: boolean, items: unknown) => {
  const [box, setBox] = useState<IndicatorBox>(hidden)
  const previous = useRef<string | undefined>(undefined)

  useLayoutEffect(() => {
    const container = containerRef.current
    const current = activeKey === undefined ? null : container?.querySelector<HTMLElement>('[aria-current]')

    if (!container || !current) {
      previous.current = undefined
      setBox((value) => (value.visible ? hidden : value))

      return
    }

    const place = (changed: boolean) => {
      const top = offsetWithin(current, container)
      const height = current.offsetHeight

      setBox((value) => {
        const moved = !value.visible || value.top !== top || value.height !== height
        const animate = changed ? true : moved ? false : value.animate

        return !moved && animate === value.animate ? value : { top, height, visible: true, animate }
      })
    }

    place(previous.current !== undefined && previous.current !== activeKey)
    previous.current = activeKey

    if (typeof ResizeObserver === 'undefined') return

    const observer = new ResizeObserver(() => place(false))

    observer.observe(container)
    observer.observe(current)

    return () => observer.disconnect()
  }, [containerRef, activeKey, compact, items])

  return box
}
