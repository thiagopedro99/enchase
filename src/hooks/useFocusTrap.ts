import { useEffect } from 'react'

import type { RefObject } from 'react'

const focusableSelector = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export const useFocusTrap = (containerRef: RefObject<HTMLElement | null>, active: boolean) => {
  useEffect(() => {
    const container = containerRef.current
    if (!active || !container) return

    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const getFocusable = () => Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter((element) => !element.closest('[hidden], [inert]'))

    const initialTarget = container.querySelector<HTMLElement>('[data-autofocus]') ?? getFocusable()[0] ?? container
    initialTarget.focus({ preventScroll: true })

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return
      const focusable = getFocusable()
      if (focusable.length === 0) return event.preventDefault()

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const current = document.activeElement
      if (event.shiftKey && (current === first || current === container)) {
        event.preventDefault()
        last.focus()
      }
      if (!event.shiftKey && current === last) {
        event.preventDefault()
        first.focus()
      }
    }

    container.addEventListener('keydown', handleKeyDown)

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
      if (previouslyFocused && document.contains(previouslyFocused)) previouslyFocused.focus({ preventScroll: true })
    }
  }, [active, containerRef])
}
