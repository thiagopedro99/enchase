import type { LookStyle } from '../../types.ts'

export interface StylePickerProps {
  name: string
  value: LookStyle
  onChange: (style: LookStyle) => void
  labelled?: boolean
  size?: 'sm' | 'md'
}
