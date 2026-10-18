import { isCurrentHref, isInternalHref, isSamePageHash } from '@utils/href.ts'

import type { BreadcrumbItem } from '../common/Breadcrumbs/types.ts'
import type { SidebarItem } from '../common/Sidebar/types.ts'
import type { DeriveBreadcrumbsInput } from './types.ts'

type RouteItem = SidebarItem & { href: string }

const isRouteOf =
  (currentHref: string | undefined) =>
  (item: SidebarItem): item is RouteItem =>
    Boolean(item.href) && !item.native && isInternalHref(item.href as string) && !isSamePageHash(item.href as string, currentHref)

export const deriveBreadcrumbs = ({ sections, pageSections, currentHref, pageTitle, activePageSectionId }: DeriveBreadcrumbsInput): BreadcrumbItem[] => {
  const routes = sections.flatMap((section) => section.items).filter(isRouteOf(currentHref))
  const home = routes.find((item) => item.href === '/')
  const current = routes.filter((item) => isCurrentHref(item.href, currentHref)).sort((a, b) => b.href.length - a.href.length)[0]
  const section = pageSections.flatMap((group) => group.items).find((item) => item.id === activePageSectionId)
  const trail: BreadcrumbItem[] = []

  if (home && current?.id !== home.id) trail.push({ id: home.id, label: home.label, href: home.href })
  if (current) trail.push({ id: current.id, label: current.label, href: current.href })
  else if (pageTitle) trail.push({ id: 'current-page', label: pageTitle })
  if (section) trail.push({ id: section.id, label: section.label, href: section.href })

  return trail
}
