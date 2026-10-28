import type { MenuEntry } from 'enchase'

export const defaultOpen = false

export const defaultPlacement = 'bottom-start'

export const defaultOffset = 4

export const placements = ['top', 'bottom', 'left', 'right', 'start', 'end', 'top-start', 'top-end', 'bottom-start', 'bottom-end', 'left-start', 'left-end', 'right-start', 'right-end'] as const

export const actions: MenuEntry[] = [
  { id: 'edit', label: 'Edit' },
  { id: 'duplicate', label: 'Duplicate' },
  { id: 'move', label: 'Move to a folder' },
  { id: 'separator', separator: true },
  { id: 'archive', label: 'Archive', disabled: true },
  { id: 'delete', label: 'Delete' }
]

export const languages = [
  'Arabic',
  'Bengali',
  'Chinese',
  'Dutch',
  'English',
  'French',
  'German',
  'Greek',
  'Hebrew',
  'Hindi',
  'Indonesian',
  'Italian',
  'Japanese',
  'Korean',
  'Persian',
  'Polish',
  'Portuguese',
  'Russian',
  'Spanish',
  'Swahili',
  'Thai',
  'Turkish',
  'Ukrainian',
  'Vietnamese'
]
