import type { HTMLAttributes } from 'react'

export type BreadcrumbItem = {
  id: string
  label: string
  href?: string | undefined
  native?: boolean | undefined
}

export interface BreadcrumbsProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  items: BreadcrumbItem[]
  maxItems?: number | undefined
  ariaLabel?: string | undefined
}

export type BreadcrumbEntry = BreadcrumbItem | 'ellipsis'
