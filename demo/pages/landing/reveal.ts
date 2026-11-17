import { flushSync } from 'react-dom'

export interface RevealOrigin {
  x: number
  y: number
}

export const prefersReducedMotion = () => typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const revealFrom = (origin: RevealOrigin | undefined, update: () => void) => {
  const root = document.documentElement

  if (!origin || prefersReducedMotion() || typeof document.startViewTransition !== 'function') {
    update()

    return
  }

  root.style.setProperty('--landing-reveal-x', `${origin.x}px`)
  root.style.setProperty('--landing-reveal-y', `${origin.y}px`)
  root.dataset.landingReveal = ''

  const clear = () => {
    delete root.dataset.landingReveal
    root.style.removeProperty('--landing-reveal-x')
    root.style.removeProperty('--landing-reveal-y')
  }

  document.startViewTransition(() => flushSync(update)).finished.then(clear, clear)
}
