import { useEffect, useRef } from 'react'

import type { PopoverTreeNode } from '../../../Popover/types.ts'
import type { useOverlayStack } from '@hooks/useOverlayStack.ts'
import type { RefObject } from 'react'

type ListboxDismissOptions = {
  open: boolean
  anchorRef: RefObject<HTMLElement | null>
  isTop: ReturnType<typeof useOverlayStack>
  contains: PopoverTreeNode
  onClose: () => void
}

export const useListboxDismiss = ({ open, anchorRef, isTop, contains, onClose }: ListboxDismissOptions) => {
  const latest = useRef({ isTop, contains, onClose })

  latest.current = { isTop, contains, onClose }

  useEffect(() => {
    if (!open) return undefined

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented || event.isComposing || !latest.current.isTop()) return

      latest.current.onClose()
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target

      if (!(target instanceof Node) || !latest.current.isTop.wasTopAtPointerDown()) return
      if (latest.current.contains(target) || anchorRef.current?.contains(target)) return

      latest.current.onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('pointerdown', handlePointerDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [open, anchorRef])
}
