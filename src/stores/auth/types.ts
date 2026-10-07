import type { LoginRequest } from '../../actions/auth/types.ts'
import type { User } from '../../actions/users/types.ts'

export type AuthState = {
  token: string | null
  user: User | null
  login: (credentials: LoginRequest) => Promise<void>
  fetchProfile: () => Promise<void>
  logout: () => void
}
