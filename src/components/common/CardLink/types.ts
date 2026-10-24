import type { CardProps } from '../Card/types.ts'
import type { AnchorHTMLAttributes } from 'react'

export interface CardLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement>, Pick<CardProps, 'variant' | 'padding' | 'animation'> {
  href: string
  native?: boolean | undefined
}
