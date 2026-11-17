import type { ReactNode } from 'react'

export interface CellProps {
  title: string
  text: string
  span?: 'third' | 'half' | 'wide'
  children: ReactNode
}
