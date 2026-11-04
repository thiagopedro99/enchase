import { shared } from '../utils/shared.ts'

const interactiveSelector = 'button, a[href], [role="button"], [role="menuitem"], summary, input, select, textarea, [tabindex]'

const freshMs = 5000

const interaction = shared('interactionTarget.v1', () => ({ last: null as { element: HTMLElement; at: number } | null, installed: false }))

const record = (event: Event) => {
  const target = event.target
  if (!(target instanceof Element)) return

  const element = target.closest<HTMLElement>(interactiveSelector)
  interaction.last = element ? { element, at: Date.now() } : null
}

export const trackInteractions = () => {
  if (interaction.installed || typeof document === 'undefined') return

  interaction.installed = true
  document.addEventListener('pointerdown', record, true)
  document.addEventListener('keydown', record, true)
}

export const lastInteractionTarget = () => {
  const { last } = interaction

  if (!last || Date.now() - last.at > freshMs || !last.element.isConnected) return null

  return last.element
}

export const resetInteractionTarget = () => {
  interaction.last = null
}

trackInteractions()
