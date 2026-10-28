export const defaultSize = 'md'

export const defaultFullWidth = false

export const sizes = ['sm', 'md', 'lg'] as const

export const views = [
  { value: 'list', label: 'List' },
  { value: 'board', label: 'Board' },
  { value: 'calendar', label: 'Calendar' }
]

export const viewsWithLockedBoard = views.map((view) => (view.value === 'board' ? { ...view, disabled: true } : view))

export const days = [
  { value: 'mon', label: 'Mon' },
  { value: 'tue', label: 'Tue' },
  { value: 'wed', label: 'Wed' },
  { value: 'thu', label: 'Thu' },
  { value: 'fri', label: 'Fri' }
]
