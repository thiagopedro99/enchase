import type { Filters } from '../../types.ts'

export interface ToolbarProps {
  filters: Filters
  total: number
  onFiltersChange: (filters: Filters) => void
  onSuggest?: (() => void) | undefined
}
