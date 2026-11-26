import type { Suggestion } from '../../types.ts'

export interface SuggestDialogProps {
  isOpen: boolean
  items: Suggestion[]
  onClose: () => void
  onSent: (suggestion: Suggestion, listed: boolean) => void
  onSignedOut: () => void
}
