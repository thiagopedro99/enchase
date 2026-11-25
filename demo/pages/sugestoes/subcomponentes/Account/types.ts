import type { AccountState } from '../../types.ts'

export interface AccountProps {
  account: AccountState
  onLeave: () => void
}
