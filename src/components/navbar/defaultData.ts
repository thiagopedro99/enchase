import type { SidebarSection } from '../common/Sidebar/types.ts'

export const defaultSections: SidebarSection[] = [{ id: 'main', items: [{ id: 'home', label: 'Home', href: '/' }] }]

export const drawerSlideDistance = 280

export const drawerOverride = { tuning: { distance: drawerSlideDistance } }

export const exitPadding = 80

export const reducedMotionQuery = '(prefers-reduced-motion: reduce)'
