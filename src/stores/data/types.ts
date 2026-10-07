export type Item = {
  id: string
  title: string
  completed: boolean
}

export type DataState = {
  items: Item[]
  loading: boolean
  error: string | null
  setItems: (items: Item[]) => void
  addItem: (item: Item) => void
  updateItem: (id: string, data: Partial<Item>) => void
  removeItem: (id: string) => void
  toggleItem: (id: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearItems: () => void
}
