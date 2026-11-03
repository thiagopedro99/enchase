import { useLayoutEffect, useState } from 'react'

import type { RefObject } from 'react'

export const useOverflow = (ref: RefObject<HTMLElement | null>) => {
  const [overflowing, setOverflowing] = useState(false)

  useLayoutEffect(() => {
    const element = ref.current

    if (!element) return

    const measure = () => setOverflowing(element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1)

    measure()

    if (typeof ResizeObserver === 'undefined') return

    const resizes = new ResizeObserver(measure)
    const observeAll = () => {
      resizes.observe(element)
      for (const child of element.children) resizes.observe(child)
    }

    observeAll()

    const changes =
      typeof MutationObserver === 'undefined'
        ? undefined
        : new MutationObserver(() => {
            observeAll()
            measure()
          })

    changes?.observe(element, { childList: true, subtree: true, characterData: true })

    return () => {
      resizes.disconnect()
      changes?.disconnect()
    }
  }, [ref])

  return overflowing
}
