import type { Ref, RefCallback } from 'react'

export const mergeRefs =
  <Element>(...refs: (Ref<Element> | undefined)[]): RefCallback<Element> =>
  (node) => {
    const cleanups = refs.map((ref) => {
      if (typeof ref === 'function') return ref(node)
      if (ref) ref.current = node

      return undefined
    })

    return () => {
      refs.forEach((ref, index) => {
        const cleanup = cleanups[index]

        if (typeof cleanup === 'function') cleanup()
        else if (typeof ref === 'function') ref(null)
        else if (ref) ref.current = null
      })
    }
  }
