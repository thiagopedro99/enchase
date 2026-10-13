export type BreadcrumbItem = {
  id: string
  label: string
  href?: string
  native?: boolean
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  maxItems?: number
  ariaLabel?: string
}

export type BreadcrumbEntry = BreadcrumbItem | 'ellipsis'
