import { create } from 'zustand'

import type { DataState } from './types.ts'

export const useDataStore = create<DataState>((set) => ({
  items: [],
  loading: false,
  error: null,
  setItems: (items) => set({ items }),
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  updateItem: (id, data) => set((state) => ({ items: state.items.map((item) => (item.id === id ? { ...item, ...data } : item)) })),
  removeItem: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
  toggleItem: (id) => set((state) => ({ items: state.items.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)) })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearItems: () => set({ items: [] })
}))
