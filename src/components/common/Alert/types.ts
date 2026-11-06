import type { HTMLAttributes, ReactNode, Ref } from 'react'

export type AlertVariant = 'info' | 'success' | 'warning' | 'error'

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  variant?: AlertVariant | undefined
  title?: string | undefined
  icon?: ReactNode | undefined
  onClose?: (() => void) | undefined
  ref?: Ref<HTMLDivElement> | undefined
}
