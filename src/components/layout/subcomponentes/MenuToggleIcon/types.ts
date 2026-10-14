import type { HTMLAttributes } from 'react'

export interface MenuToggleIconProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  open: boolean
}
