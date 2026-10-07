export type BreadcrumbItem = {
  id: string
  label: string
  to?: string
  href?: string
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  maxItems?: number
  ariaLabel?: string
}

export type BreadcrumbEntry = BreadcrumbItem | 'ellipsis'
