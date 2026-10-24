import type { AnchorHTMLAttributes } from 'react'

export interface BrandProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'children'> {
  name: string
  logo?: string | undefined
  compact?: boolean | undefined
}
