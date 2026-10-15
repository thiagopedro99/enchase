import { useEffect } from 'react'

import { lastInteractionTarget } from './interactionTarget.ts'

import type { RefObject } from 'react'

export const focusableSelector ='a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

const isRadio = (element: HTMLElement): element is HTMLInputElement => element instanceof HTMLInputElement && element.type === 'radio'

const tabbableIn = (container: HTMLElement) => {
  const candidates = Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter((element) => !element.closest('[hidden], [inert]'))

  return candidates.filter((element) => {
    if (!isRadio(element) || !element.name || element.checked) return true

    return !candidates.some((other) => isRadio(other) && other.name === element.name && other.checked)
  })
}

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

    const initialTarget = container.querySelector<HTMLElement>('[data-autofocus]') ?? tabbableIn(container)[0] ?? container
    initialTarget.focus({ preventScroll: true })

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || event.defaultPrevented) return

      const focusable = tabbableIn(container)
      if (focusable.length === 0) return event.preventDefault()

      const current = document.activeElement
      const index = current instanceof HTMLElement ? focusable.indexOf(current) : -1
      const step = event.shiftKey ? -1 : 1
      const next = index === -1 ? (event.shiftKey ? focusable[focusable.length - 1] : focusable[0]) : focusable[(index + step + focusable.length) % focusable.length]

      event.preventDefault()
      next.focus({ preventScroll: true })
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
