import type { Column, Status, Suggestion } from '../../types.ts'

export interface BoardProps {
  columns: Column[]
  canMove: boolean
  onMove: (suggestion: Suggestion, status: Status) => void
}

export interface BoardCard {
  id: string
  columnId: string
  suggestion: Suggestion
}
