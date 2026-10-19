import type { ButtonProps } from '../Button/types.ts'
import type { AnchorHTMLAttributes } from 'react'

export interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement>, Pick<ButtonProps, 'variant' | 'size' | 'fullWidth' | 'animation'> {
  href: string
  native?: boolean
  externalIcon?: boolean
}
