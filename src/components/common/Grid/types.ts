import type { BreakpointKey } from '../../uiProvider/types.ts'
import type { StructureTag } from '@utils/structureTag.ts'
import type { HTMLAttributes } from 'react'

export interface GridProps extends HTMLAttributes<HTMLElement> {
  as?: StructureTag
  columns?: number | Partial<Record<BreakpointKey, number>>
  gap?: string
  minColumnWidth?: string
  centerLastRow?: boolean
}
