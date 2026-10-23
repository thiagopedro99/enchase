import type { StructureTag } from '@utils/structureTag.ts'
import type { HTMLAttributes } from 'react'

export type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse'
export type FlexAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline'
export type FlexJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'

export interface FlexProps extends HTMLAttributes<HTMLElement> {
  as?: StructureTag
  direction?: FlexDirection
  align?: FlexAlign
  justify?: FlexJustify
  gap?: string
  wrap?: boolean
}
