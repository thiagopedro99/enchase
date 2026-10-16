import type { CSSProperties } from 'react'
import type { SidebarSection } from '../common/Sidebar/types.ts'

export const defaultLogo = 'Logo'

export const defaultLogoHref = '/'

export const defaultSections: SidebarSection[] = [{ id: 'main', items: [{ id: 'home', label: 'Home', href: '/' }] }]

export const drawerSlideDistance = 280

export const drawerOverride = { tuning: { distance: drawerSlideDistance } }

export const staggerVariables = (motionStyle: CSSProperties): CSSProperties => ((motionStyle as Record<string, unknown>)['--enchase-navbar-duration'] === '0ms' ? ({ '--enchase-navbar-stagger': '0ms' } as CSSProperties) : {})

