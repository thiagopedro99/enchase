import type { LoginRequest } from '../../types.ts'

export interface LoginDialogProps {
  request: LoginRequest | null
  onClose: () => void
}
