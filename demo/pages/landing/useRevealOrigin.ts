import { useRef } from 'react'

import type { RevealOrigin } from './reveal.ts'
import type { PointerEvent } from 'react'

export const useRevealOrigin = () => {
  const pointer = useRef<RevealOrigin | undefined>(undefined)

  const handlers = {
    onPointerDown: ({ clientX, clientY }: PointerEvent<HTMLElement>) => {
      pointer.current = { x: clientX, y: clientY }
    },
    onKeyDown: () => {
      pointer.current = undefined
    }
  }

  const origin = (): RevealOrigin | undefined => {
    if (pointer.current) return pointer.current
    if (!(document.activeElement instanceof HTMLElement)) return undefined

    const { left, top, width, height } = document.activeElement.getBoundingClientRect()

    return { x: left + width / 2, y: top + height / 2 }
  }

  return { handlers, origin }
}
