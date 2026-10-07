import { api } from '../api.ts'

import type { LoginRequest, LoginResponse } from './types.ts'
import type { User } from '../users/types.ts'

export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const { data } = await api.post<LoginResponse>('/auth/login', credentials)

  return data
}

export const getProfile = async (): Promise<User> => {
  const { data } = await api.get<User>('/auth/profile')

  return data
}
