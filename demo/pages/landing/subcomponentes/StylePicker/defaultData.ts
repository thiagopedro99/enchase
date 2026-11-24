import type { LookStyle } from '../../types.ts'

export const defaultLabelled = false

export const defaultSize = 'md'

export const styleOptions: { value: LookStyle; label: string }[] = [
  { value: 'enchase', label: 'Enchase' },
  { value: 'material3', label: 'Material 3' },
  { value: 'shadcn', label: 'shadcn' },
  { value: 'workbench', label: 'Workbench' }
]
