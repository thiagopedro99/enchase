import type { MoveRequest } from '../../types.ts'
import type { Move } from '../../move.ts'

export interface MoveDialogProps {
  request: MoveRequest | null
  onConfirm: (details: Partial<Move>) => void
  onClose: () => void
}
