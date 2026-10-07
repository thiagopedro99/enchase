import { api } from '../api.ts'

import type { CreateUserInput, UpdateUserInput, User } from './types.ts'
import type { PaginatedResponse } from '../../types/pagination.ts'

export const listUsers = async (page = 1, perPage = 10): Promise<PaginatedResponse<User>> => {
  const { data } = await api.get<PaginatedResponse<User>>('/users', { params: { page, per_page: perPage } })

  return data
}

export const getUserById = async (id: string): Promise<User> => {
  const { data } = await api.get<User>(`/users/${id}`)

  return data
}

export const createUser = async (payload: CreateUserInput): Promise<User> => {
  const { data } = await api.post<User>('/users', payload)

  return data
}

export const updateUser = async (id: string, payload: UpdateUserInput): Promise<User> => {
  const { data } = await api.put<User>(`/users/${id}`, payload)

  return data
}

export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`/users/${id}`)
}
