import type { Column } from '../../types.ts'
import type { ReactNode } from 'react'

export interface BoardProps {
  columns: Column[]
  invite?: ReactNode
}
