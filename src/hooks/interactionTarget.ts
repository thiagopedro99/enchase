const interactiveSelector = 'button, a[href], [role="button"], [role="menuitem"], summary, input, select, textarea, [tabindex]'

const freshMs = 5000

let last: { element: HTMLElement; at: number } | null = null
let installed = false

const record = (event: Event) => {
  const target = event.target
  if (!(target instanceof Element)) return

  const element = target.closest<HTMLElement>(interactiveSelector)
  last = element ? { element, at: Date.now() } : null
}

export const trackInteractions = () => {
  if (installed || typeof document === 'undefined') return

  installed = true
  document.addEventListener('pointerdown', record, true)
  document.addEventListener('keydown', record, true)
}

export const lastInteractionTarget = () => {
  if (!last || Date.now() - last.at > freshMs || !last.element.isConnected) return null

  return last.element
}

export const resetInteractionTarget = () => {
  last = null
}

trackInteractions()
