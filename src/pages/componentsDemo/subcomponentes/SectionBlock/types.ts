import type { ReactNode } from 'react'

export type SectionBlockProps = {
  id: string
  title: string
  description?: string
  onShowCode?: () => void
  bare?: boolean
  children: ReactNode
}
