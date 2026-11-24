import { useLayoutEffect, useRef, useState } from 'react'

export const useWidth = <Target extends HTMLElement>() => {
  const ref = useRef<Target>(null)
  const [width, setWidth] = useState(0)

  useLayoutEffect(() => {
    const element = ref.current

    if (!element || typeof ResizeObserver === 'undefined') return

    const observer = new ResizeObserver(([entry]) => setWidth(entry?.contentRect.width ?? 0))

    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  return { ref, width }
}
