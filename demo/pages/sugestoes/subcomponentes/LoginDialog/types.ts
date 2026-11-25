import type { Suggestion } from '../../types.ts'

export interface LoginDialogProps {
  suggestion: Suggestion | null
  onClose: () => void
}
