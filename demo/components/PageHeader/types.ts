import type { ReactNode } from 'react'

export interface PageHeaderProps {
  id: string
  eyebrow: string
  title: string
  lead: string
  children?: ReactNode
  aside?: ReactNode
}
