import type { ComboboxOption } from 'enchase'

export const frameworks: ComboboxOption[] = [
  { value: 'next', label: 'Next.js' },
  { value: 'vite', label: 'Vite' },
  { value: 'remix', label: 'Remix' },
  { value: 'astro', label: 'Astro' },
  { value: 'tanstack', label: 'TanStack Start' }
]

export const defaultFramework = 'next'

export const defaultDate = '2026-12-01'

export const actions = [
  { id: 'duplicate', label: 'Duplicar' },
  { id: 'share', label: 'Compartilhar' },
  { id: 'archive', label: 'Arquivar' }
]

export const keys = ['Tab', '↑ ↓', 'Home', 'End', 'Enter', 'Esc']
