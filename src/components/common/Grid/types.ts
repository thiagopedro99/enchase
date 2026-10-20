import type { BreakpointKey } from '../../uiProvider/types.ts'
import type { HTMLAttributes } from 'react'

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  columns?: number | Partial<Record<BreakpointKey, number>>
  gap?: string
  minColumnWidth?: string
  centerLastRow?: boolean
}
