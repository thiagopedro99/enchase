import type { ComboboxOption } from '../../types.ts'

export interface ComboboxOptionsProps {
  options: ComboboxOption[]
  selected: string[]
  active: number
  idPrefix: string
  empty: boolean
  loading: boolean
  onActivate: (index: number) => void
  onChoose: (option: ComboboxOption) => void
}
