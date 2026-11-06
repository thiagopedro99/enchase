import type { HTMLAttributes, Ref } from 'react'

export type BreadcrumbItem = {
  value?: string | undefined
  id?: string | undefined
  label: string
  href?: string | undefined
  native?: boolean | undefined
}

export interface BreadcrumbsProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  items: BreadcrumbItem[]
  maxItems?: number | undefined
  ariaLabel?: string | undefined
  ref?: Ref<HTMLElement> | undefined
}

export type BreadcrumbEntry = BreadcrumbItem | 'ellipsis'
