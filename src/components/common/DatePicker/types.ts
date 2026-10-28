import type { LabelPlacement } from '@styles/tokens/types.ts'
import type { CSSProperties, InputHTMLAttributes } from 'react'
import type { PortalContainer } from '@utils/portalContainer.ts'
import type { MotionOverride } from '@motion/types.ts'

export interface DatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'role' | 'value' | 'defaultValue' | 'onChange' | 'min' | 'max' | 'step' | 'list' | 'multiple' | 'checked' | 'defaultChecked'> {
  value?: string | null | undefined
  defaultValue?: string | null | undefined
  onValueChange?: ((value: string | null) => void) | undefined
  min?: string | undefined
  max?: string | undefined
  isDateDisabled?: ((date: string) => boolean) | undefined
  firstDayOfWeek?: number | undefined
  label?: string | undefined
  labelPlacement?: LabelPlacement | undefined
  error?: string | undefined
  helperText?: string | undefined
  fullWidth?: boolean | undefined
  open?: boolean | undefined
  defaultOpen?: boolean | undefined
  onOpenChange?: ((open: boolean) => void) | undefined
  container?: PortalContainer | undefined
  animation?: MotionOverride | undefined
  wrapperClassName?: string | undefined
  wrapperStyle?: CSSProperties | undefined
  popupClassName?: string | undefined
  popupStyle?: CSSProperties | undefined
}
