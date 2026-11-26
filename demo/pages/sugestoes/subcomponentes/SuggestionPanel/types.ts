import type { AccountState, Suggestion } from '../../types.ts'

export interface SuggestionPanelProps {
  id: number | null
  suggestion: Suggestion | undefined
  account: AccountState
  onClose: () => void
  onCommented: (suggestion: Suggestion) => void
  onSignedOut: () => void
}
