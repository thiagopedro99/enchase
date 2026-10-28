import type { ComboboxFilter, ComboboxOption } from './types.ts'

const plain = (text: string) => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()

export const defaultFilter: ComboboxFilter = (option, query) => plain(option.label).includes(plain(query))

export const visibleOptions = (options: ComboboxOption[], query: string, filter: ComboboxFilter | false | undefined) => {
  const text = query.trim()

  if (filter === false || text === '') return options

  return options.filter((option) => (filter ?? defaultFilter)(option, text))
}
