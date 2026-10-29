import { useEffect } from 'react'

import { focusInOrder, tabbablesIn } from '@utils/tabbable.ts'
import { lastInteractionTarget } from './interactionTarget.ts'

import type { RefObject } from 'react'

const triggerToRestore = () => {
  const active = document.activeElement

  if (active instanceof HTMLElement && active !== document.body) return active

  return lastInteractionTarget()
}

export const useFocusTrap = (containerRef: RefObject<HTMLElement | null>, active: boolean) => {
  useEffect(() => {
    const container = containerRef.current
    if (!active || !container) return

    const trigger = triggerToRestore()

    const initialTarget = container.querySelector<HTMLElement>('[data-autofocus]')

    if (initialTarget) initialTarget.focus({ preventScroll: true })
    else if (!focusInOrder(tabbablesIn(container), 0, 1)) container.focus({ preventScroll: true })

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || event.defaultPrevented) return

      const focusable = tabbablesIn(container)
      if (focusable.length === 0) return event.preventDefault()

      const current = document.activeElement
      const index = current instanceof HTMLElement ? focusable.indexOf(current) : -1
      const step = event.shiftKey ? -1 : 1
      const start = index === -1 ? (event.shiftKey ? focusable.length - 1 : 0) : (index + step + focusable.length) % focusable.length

      event.preventDefault()
      if (!focusInOrder(focusable, start, step)) return container.focus({ preventScroll: true })

      document.activeElement?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
    }

    container.addEventListener('keydown', handleKeyDown)

    return () => {
      container.removeEventListener('keydown', handleKeyDown)

      const current = document.activeElement
      const movedAway = current instanceof HTMLElement && current !== document.body && !container.contains(current)
      if (movedAway || !trigger || !trigger.isConnected) return

      trigger.focus({ preventScroll: true })
    }
  }, [active, containerRef])
}
