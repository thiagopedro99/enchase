import type { HTMLAttributes } from 'react'

export interface SidebarUserProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  name: string
  collapsed: boolean
  onLogout?: (() => void) | undefined
}
