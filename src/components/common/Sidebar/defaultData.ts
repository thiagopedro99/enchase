import { isCurrentHref, isSamePageHash, isSectionHref } from '@utils/href.ts'

import type { CSSProperties } from 'react'
import type { SidebarItem } from './types.ts'

export const drawerWidth = 300

export const itemMotionVariables = (motionStyle: CSSProperties): CSSProperties =>
  (motionStyle as Record<string, unknown>)['--enchase-sidebar-duration'] === '0ms' ? ({ '--enchase-sidebar-item-duration': '0ms', '--enchase-sidebar-item-scale': '1', '--enchase-sidebar-indicator-duration': '0ms', '--enchase-sidebar-stagger': '0ms' } as CSSProperties) : {}

export const drawerOverride = { tuning: { distance: drawerWidth } }

export const currentOf = (item: SidebarItem, activeSectionId: string | undefined, currentHref: string | undefined): 'page' | 'location' | undefined => {
  if (!item.href || item.native) return undefined
  if (isSectionHref(item.href) || isSamePageHash(item.href, currentHref)) return item.id === activeSectionId ? 'location' : undefined

  return isCurrentHref(item.href, currentHref) ? 'page' : undefined
}
