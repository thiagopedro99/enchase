import { persist } from 'zustand/middleware'
import { create } from 'zustand'

import { getProfile, login as loginRequest } from '../../actions/auth/index.ts'

import type { AuthState } from './types.ts'

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: async (credentials) => {
        const { token, user } = await loginRequest(credentials)
        set({ token, user })
      },
      fetchProfile: async () => {
        const user = await getProfile()
        set({ user })
      },
      logout: () => set({ token: null, user: null })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token })
    }
  )
)
