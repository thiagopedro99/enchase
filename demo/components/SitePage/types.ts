import type { ReactNode } from 'react'

export interface SitePageProps {
  title: string
  actions?: ReactNode
  children: ReactNode
}
