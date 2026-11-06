import type { BreakpointKey } from '../../uiProvider/types.ts'
import type { StructureTag } from '@utils/structureTag.ts'
import type { HTMLAttributes, Ref } from 'react'

export interface GridProps extends HTMLAttributes<HTMLElement> {
  as?: StructureTag | undefined
  columns?: number | Partial<Record<BreakpointKey, number>> | undefined
  gap?: string | undefined
  minColumnWidth?: string | undefined
  centerLastRow?: boolean | undefined
  ref?: Ref<HTMLElement> | undefined
}
