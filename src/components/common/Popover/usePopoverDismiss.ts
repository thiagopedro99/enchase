import { useEffect, useRef } from 'react'

import { focusNextAfter, focusTrigger } from './focus.ts'
import { tabbablesIn } from '@utils/tabbable.ts'

import type { PopoverTreeNode } from './types.ts'
import type { RefObject } from 'react'

type PopoverDismissOptions = {
  open: boolean
  triggerRef: RefObject<HTMLElement | null>
  contentRef: RefObject<HTMLElement | null>
  bodyRef: RefObject<HTMLElement | null>
  isTop: () => boolean
  wasTopAtPointerDown: () => boolean
  contains: PopoverTreeNode
  closeOnEsc: boolean
  closeOnOutsideClick: boolean
  menu: boolean
  onClose: () => void
}

export const usePopoverDismiss = ({ open, triggerRef, contentRef, bodyRef, isTop, wasTopAtPointerDown, contains, closeOnEsc, closeOnOutsideClick, menu, onClose }: PopoverDismissOptions) => {
  const latest = useRef({ isTop, wasTopAtPointerDown, contains, onClose })
  latest.current = { isTop, wasTopAtPointerDown, contains, onClose }

  useEffect(() => {
    if (!open) return undefined

    const handleKeyDown = (event: KeyboardEvent) => {
      const trigger = triggerRef.current
      if (event.key !== 'Escape' || !closeOnEsc || event.defaultPrevented || event.isComposing || !latest.current.isTop()) return

      latest.current.onClose()
      if (trigger) focusTrigger(trigger)
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target
      const trigger = triggerRef.current
      if (!closeOnOutsideClick || !(target instanceof Node) || !latest.current.wasTopAtPointerDown()) return
      if (latest.current.contains(target) || trigger?.contains(target)) return

      latest.current.onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('pointerdown', handlePointerDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [open, closeOnEsc, closeOnOutsideClick, triggerRef])

  useEffect(() => {
    const content = contentRef.current
    const trigger = triggerRef.current
    if (!open || !content || !trigger) return undefined

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return

      const items = tabbablesIn(content)
      const edge = event.shiftKey ? items[0] ?? content : items[items.length - 1] ?? content
      if (!menu && document.activeElement !== edge && document.activeElement !== content && document.activeElement !== bodyRef.current) return

      event.preventDefault()
      focusTrigger(trigger)
      if (event.shiftKey && !menu) return

      latest.current.onClose()
      if (!event.shiftKey) focusNextAfter(trigger, content)
    }

    content.addEventListener('keydown', handleKeyDown)

    return () => content.removeEventListener('keydown', handleKeyDown)
  }, [open, menu, contentRef, bodyRef, triggerRef])
}
