export interface ComboboxTagsProps {
  values: string[]
  labelOf: (value: string) => string | undefined
  onRemove?: ((value: string) => void) | undefined
}
