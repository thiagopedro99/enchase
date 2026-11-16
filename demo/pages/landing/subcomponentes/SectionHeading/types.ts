import type { ReactNode } from 'react'

export interface SectionHeadingProps {
  id: string
  eyebrow: string
  title: ReactNode
  lead?: ReactNode
  align?: 'start' | 'center'
}
