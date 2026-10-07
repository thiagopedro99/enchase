import type { BreadcrumbEntry, BreadcrumbItem } from './types.ts'

export const defaultMaxItems = 4

export const collapseTrail = (items: BreadcrumbItem[], maxItems: number): BreadcrumbEntry[] => {
  if (items.length <= maxItems) return items

  return [items[0], 'ellipsis', ...items.slice(items.length - (maxItems - 2))]
}
