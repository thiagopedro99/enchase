import { isCurrentHref, isInternalHref } from '@utils/href.ts'

import type { BreadcrumbItem } from '../common/Breadcrumbs/types.ts'
import type { SidebarItem } from '../common/Sidebar/types.ts'
import type { DeriveBreadcrumbsInput } from './types.ts'

type RouteItem = SidebarItem & { href: string }

const isRoute = (item: SidebarItem): item is RouteItem => Boolean(item.href) && !item.native && isInternalHref(item.href as string)

export const deriveBreadcrumbs = ({ sections, pageSections, pathname, pageTitle, activePageSectionId }: DeriveBreadcrumbsInput): BreadcrumbItem[] => {
  const routes = sections.flatMap((section) => section.items).filter(isRoute)
  const home = routes.find((item) => item.href === '/')
  const current = routes.filter((item) => isCurrentHref(item.href, pathname)).sort((a, b) => b.href.length - a.href.length)[0]
  const section = pageSections.flatMap((group) => group.items).find((item) => item.id === activePageSectionId)
  const trail: BreadcrumbItem[] = []

  if (home && current?.id !== home.id) trail.push({ id: home.id, label: home.label, to: home.href })
  trail.push(current ? { id: current.id, label: current.label, to: current.href } : { id: 'current-page', label: pageTitle })
  if (section) trail.push({ id: section.id, label: section.label, href: section.href })

  return trail
}
