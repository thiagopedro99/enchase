import { useLayoutEffect, useRef, useState } from 'react'

import type { RefObject } from 'react'

export type TabIndicatorBox = {
  x: number
  width: number
  visible: boolean
  animate: boolean
}

const hidden: TabIndicatorBox = { x: 0, width: 0, visible: false, animate: false }

export const placeIndicator = (indicatorStart: number, indicatorWidth: number, tabStart: number, tabWidth: number) => ({
  x: tabStart - indicatorStart,
  width: tabWidth / (indicatorWidth || 1)
})

export const useTabIndicator = (listRef: RefObject<HTMLElement | null>, indicatorRef: RefObject<HTMLElement | null>, activeKey: string | undefined, layoutKey: string) => {
  const [box, setBox] = useState<TabIndicatorBox>(hidden)
  const previous = useRef<string | undefined>(undefined)

  useLayoutEffect(() => {
    const list = listRef.current
    const indicator = indicatorRef.current
    const tab = activeKey === undefined ? null : list?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')

    if (!list || !indicator || !tab) {
      previous.current = undefined
      setBox((value) => (value.visible ? hidden : value))

      return
    }

    const place = (changed: boolean) => {
      const next = placeIndicator(indicator.offsetLeft, indicator.offsetWidth, tab.offsetLeft, tab.offsetWidth)

      setBox((value) => {
        const moved = !value.visible || value.x !== next.x || value.width !== next.width
        const animate = changed ? true : moved ? false : value.animate

        return !moved && animate === value.animate ? value : { ...next, visible: true, animate }
      })
    }

    place(previous.current !== undefined && previous.current !== activeKey)
    previous.current = activeKey

    if (typeof ResizeObserver === 'undefined') return

    const observer = new ResizeObserver(() => place(false))

    observer.observe(list)
    for (const element of list.querySelectorAll('[role="tab"]')) observer.observe(element)

    return () => observer.disconnect()
  }, [listRef, indicatorRef, activeKey, layoutKey])

  return box
}
