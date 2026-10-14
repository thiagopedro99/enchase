import type { HTMLAttributes } from 'react'

export type BreadcrumbItem = {
  id: string
  label: string
  href?: string
  native?: boolean
}

export interface BreadcrumbsProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  items: BreadcrumbItem[]
  maxItems?: number
  ariaLabel?: string
}

export type BreadcrumbEntry = BreadcrumbItem | 'ellipsis'
