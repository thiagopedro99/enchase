import type { BreadcrumbItem } from '../common/Breadcrumbs/types.ts'
import type { SidebarItem } from '../common/Sidebar/types.ts'
import type { DeriveBreadcrumbsInput } from './types.ts'

type RouteItem = SidebarItem & { to: string }

const matchesRoute = (to: string, pathname: string) => (to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(`${to}/`))

export const deriveBreadcrumbs = ({ sections, pageSections, pathname, pageTitle, activePageSectionId }: DeriveBreadcrumbsInput): BreadcrumbItem[] => {
  const routes = sections.flatMap((section) => section.items).filter((item): item is RouteItem => Boolean(item.to))
  const home = routes.find((item) => item.to === '/')
  const current = routes.filter((item) => matchesRoute(item.to, pathname)).sort((a, b) => b.to.length - a.to.length)[0]
  const section = pageSections.flatMap((group) => group.items).find((item) => item.id === activePageSectionId)
  const trail: BreadcrumbItem[] = []

  if (home && current?.id !== home.id) trail.push({ id: home.id, label: home.label, to: home.to })
  trail.push(current ? { id: current.id, label: current.label, to: current.to } : { id: 'current-page', label: pageTitle })
  if (section) trail.push({ id: section.id, label: section.label, href: section.href })

  return trail
}
