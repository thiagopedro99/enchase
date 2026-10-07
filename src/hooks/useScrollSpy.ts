import { useEffect, useState } from 'react'

export const useScrollSpy = (ids: string[], topOffset = 96) => {
  const [activeId, setActiveId] = useState(ids[0])

  useEffect(() => {
    const elements = ids.map((id) => document.getElementById(id)).filter((element): element is HTMLElement => element !== null)
    if (elements.length === 0 || typeof IntersectionObserver === 'undefined') return

    const visible = new Set<string>()
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => (entry.isIntersecting ? visible.add(entry.target.id) : visible.delete(entry.target.id)))
        const current = ids.find((id) => visible.has(id))
        if (current) setActiveId(current)
      },
      { rootMargin: `-${topOffset}px 0px -55% 0px`, threshold: 0 }
    )

    elements.forEach((element) => observer.observe(element))

    return () => observer.disconnect()
  }, [ids, topOffset])

  return activeId
}
