import type { ButtonProps } from '../Button/types.ts'
import type { AnchorHTMLAttributes } from 'react'

type MotionConflictingHandlers = 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'

export interface ButtonLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, MotionConflictingHandlers>, Pick<ButtonProps, 'variant' | 'size' | 'fullWidth' | 'animation'> {
  href: string
}
