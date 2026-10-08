import { useInertSiblings } from './useInertSiblings.ts'
import { useScrollLock } from './useScrollLock.ts'
import { useFocusTrap } from './useFocusTrap.ts'
import { useOverlayLayer } from './overlayStack.ts'

import type { RefObject } from 'react'

type ModalBehaviorOptions = {
  rootRef: RefObject<HTMLElement | null>
  dialogRef: RefObject<HTMLElement | null>
  onEscape?: () => void
}

export const useModalBehavior = ({ rootRef, dialogRef, onEscape }: ModalBehaviorOptions) => {
  useInertSiblings(rootRef)
  useFocusTrap(dialogRef, true)
  useScrollLock()

  return useOverlayLayer(true, { modal: true, contains: (node) => Boolean(dialogRef.current?.contains(node)), onEscape })
}
