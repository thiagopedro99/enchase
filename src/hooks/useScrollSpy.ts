import { useEffect, useState } from 'react'

export const useScrollSpy = (ids: string[], topOffset = 96) => {
  const [activeId, setActiveId] = useState<string>()
  const key = JSON.stringify(ids)

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return

    const wanted = JSON.parse(key) as string[]
    const visible = new Set<string>()
    const watched = new Map<string, Element>()

    const update = () => {
      const current = wanted.find((id) => visible.has(id))
      const first = wanted.map((id) => watched.get(id)).find((element) => element !== undefined)
      const aboveFirst = !current && first !== undefined && first.getBoundingClientRect().top > topOffset

      if (current || aboveFirst) setActiveId(current)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (watched.get(entry.target.id) !== entry.target) return

          if (entry.isIntersecting) visible.add(entry.target.id)
          else visible.delete(entry.target.id)
        })
        update()
      },
      { rootMargin: `-${topOffset}px 0px -55% 0px`, threshold: 0 }
    )

    const sync = () =>
      wanted.reduce((changed, id) => {
        const element = document.getElementById(id)
        const previous = watched.get(id)

        if (element === previous) return changed

        if (previous) {
          observer.unobserve(previous)
          visible.delete(id)
          watched.delete(id)
        }

        if (element) {
          observer.observe(element)
          watched.set(id, element)
        }

        return true
      }, false)

    const follow = () => {
      if (!sync()) return

      setActiveId((previous) => (previous !== undefined && !watched.has(previous) ? undefined : previous))
      update()
    }

    const mutations = typeof MutationObserver === 'undefined' ? undefined : new MutationObserver(follow)

    sync()
    mutations?.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['id'] })

    return () => {
      mutations?.disconnect()
      observer.disconnect()
    }
  }, [key, topOffset])

  return activeId
}
