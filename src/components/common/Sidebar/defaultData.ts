import { isCurrentHref, isSectionHref } from '@utils/href.ts'

import type { SidebarItem } from './types.ts'

export const drawerWidth = 300

export const drawerOverride = { tuning: { distance: drawerWidth } }

export const currentOf = (item: SidebarItem, activeSectionId: string | undefined, currentHref: string | undefined): 'page' | 'location' | undefined => {
  if (!item.href || item.native) return undefined
  if (isSectionHref(item.href)) return item.id === activeSectionId ? 'location' : undefined

  return isCurrentHref(item.href, currentHref) ? 'page' : undefined
}
