import { useEffect } from 'react'

import type { RefObject } from 'react'

export const useInertSiblings = (rootRef: RefObject<HTMLElement | null>, active = true) => {
  useEffect(() => {
    const root = rootRef.current
    if (!active || !root) return

    const inerted: Element[] = []
    let node: Element = root

    while (node.parentElement && node !== document.body) {
      const current = node
      Array.from(node.parentElement.children)
        .filter((sibling) => sibling !== current && sibling.tagName !== 'SCRIPT' && !sibling.hasAttribute('inert'))
        .forEach((sibling) => {
          sibling.setAttribute('inert', '')
          inerted.push(sibling)
        })
      node = node.parentElement
    }

    return () => inerted.forEach((element) => element.removeAttribute('inert'))
  }, [rootRef, active])
}
