import type { LabelPlacement } from '@styles/tokens/types.ts'
import type { CSSProperties, InputHTMLAttributes } from 'react'
import type { PortalContainer } from '@utils/portalContainer.ts'
import type { MotionOverride } from '@motion/types.ts'

export interface ComboboxOption {
  value: string
  label: string
  disabled?: boolean | undefined
}

export type ComboboxFilter = (option: ComboboxOption, query: string) => boolean

export interface ComboboxBaseProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange' | 'type' | 'role' | 'list' | 'multiple' | 'checked' | 'defaultChecked'> {
  options: ComboboxOption[]
  label?: string | undefined
  labelPlacement?: LabelPlacement | undefined
  error?: string | undefined
  helperText?: string | undefined
  fullWidth?: boolean | undefined
  filter?: ComboboxFilter | false | undefined
  onInputChange?: ((text: string) => void) | undefined
  loading?: boolean | undefined
  open?: boolean | undefined
  defaultOpen?: boolean | undefined
  onOpenChange?: ((open: boolean) => void) | undefined
  container?: PortalContainer | undefined
  animation?: MotionOverride | undefined
  wrapperClassName?: string | undefined
  wrapperStyle?: CSSProperties | undefined
  listboxClassName?: string | undefined
  listboxStyle?: CSSProperties | undefined
}

export interface ComboboxSingleProps extends ComboboxBaseProps {
  multiple?: false | undefined
  value?: string | null | undefined
  defaultValue?: string | null | undefined
  onValueChange?: ((value: string | null) => void) | undefined
}

export interface ComboboxMultipleProps extends ComboboxBaseProps {
  multiple: true
  value?: string[] | undefined
  defaultValue?: string[] | undefined
  onValueChange?: ((value: string[]) => void) | undefined
}

export type ComboboxProps = ComboboxSingleProps | ComboboxMultipleProps
