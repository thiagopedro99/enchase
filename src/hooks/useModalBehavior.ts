import { useEffect } from 'react'

import { useInertSiblings } from './useInertSiblings.ts'
import { useScrollLock } from './useScrollLock.ts'
import { useFocusTrap } from './useFocusTrap.ts'

import type { RefObject } from 'react'

type ModalBehaviorOptions = {
  rootRef: RefObject<HTMLElement | null>
  dialogRef: RefObject<HTMLElement | null>
  onEscape?: (() => void) | undefined
  initialFocus?: RefObject<HTMLElement | null> | undefined
}

export const useModalBehavior = ({ rootRef, dialogRef, onEscape, initialFocus }: ModalBehaviorOptions) => {
  useInertSiblings(rootRef)
  useFocusTrap(dialogRef, true, initialFocus)
  useScrollLock()

  useEffect(() => {
    if (!onEscape) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onEscape()
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onEscape])
}
