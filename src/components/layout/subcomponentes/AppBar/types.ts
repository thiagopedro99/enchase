import type { BreadcrumbItem } from '@components/common/Breadcrumbs/types.ts'
import type { HTMLAttributes, ReactNode } from 'react'

export interface AppBarProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  items: BreadcrumbItem[]
  menuLabel: string
  menuExpanded: boolean
  menuControls: string
  menuHasPopup?: boolean | undefined
  onMenuToggle: () => void
  actions?: ReactNode | undefined
  translucent?: boolean | undefined
}
