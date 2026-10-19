import { useLayoutEffect, useState } from 'react'

import type { RefObject } from 'react'

export const useOverflow = (ref: RefObject<HTMLElement | null>) => {
  const [overflowing, setOverflowing] = useState(false)

  useLayoutEffect(() => {
    const element = ref.current

    if (!element) return

    const measure = () => setOverflowing(element.scrollWidth > element.clientWidth + 1)

    measure()

    if (typeof ResizeObserver === 'undefined') return

    const observer = new ResizeObserver(measure)

    observer.observe(element)
    for (const child of element.children) observer.observe(child)

    return () => observer.disconnect()
  }, [ref])

  return overflowing
}
