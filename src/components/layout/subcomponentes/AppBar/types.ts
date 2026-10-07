import type { BreadcrumbItem } from '@components/common/Breadcrumbs/types.ts'
import type { ReactNode } from 'react'

export type AppBarProps = {
  items: BreadcrumbItem[]
  menuLabel: string
  menuExpanded: boolean
  menuControls: string
  menuHasPopup?: boolean
  onMenuToggle: () => void
  actions?: ReactNode
}
