import type { ButtonProps } from '../Button/types.ts'
import type { AnchorHTMLAttributes, Ref } from 'react'

export interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement>, Pick<ButtonProps, 'variant' | 'size' | 'fullWidth' | 'animation'> {
  href: string
  native?: boolean | undefined
  externalIcon?: boolean | undefined
  iconOnly?: boolean | undefined
  ref?: Ref<HTMLAnchorElement> | undefined
}
