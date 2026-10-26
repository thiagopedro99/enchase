import { useEffect } from 'react'

import type { RefObject } from 'react'

export const inertExemptSlot = 'toast-host'

export const inertExemptSelector = `[data-slot="${inertExemptSlot}"]`

const ancestorsOf = (element: Element) => {
  const found: Element[] = []

  for (let node = element.parentElement; node; node = node.parentElement) {
    found.push(node)
    if (node === document.body) break
  }

  return found
}

export const useInertSiblings = (rootRef: RefObject<HTMLElement | null>, active = true) => {
  useEffect(() => {
    const root = rootRef.current
    if (!active || !root) return

    const hosts = Array.from(document.querySelectorAll(inertExemptSelector)).filter((host) => !root.contains(host))
    const kept = new Set<Element>([root, ...hosts])
    const parents = new Set<Element>()

    for (const start of [root, ...hosts]) {
      for (const ancestor of ancestorsOf(start)) {
        kept.add(ancestor)
        parents.add(ancestor)
      }
    }

    const inerted: Element[] = []

    parents.forEach((parent) => {
      Array.from(parent.children)
        .filter((child) => !kept.has(child) && child.tagName !== 'SCRIPT' && !child.hasAttribute('inert'))
        .forEach((child) => {
          child.setAttribute('inert', '')
          inerted.push(child)
        })
    })

    return () => inerted.forEach((element) => element.removeAttribute('inert'))
  }, [rootRef, active])
}
