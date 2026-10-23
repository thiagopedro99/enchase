import type { StructureTag } from '@utils/structureTag.ts'
import type { HTMLAttributes } from 'react'

export type ContainerMaxWidth = 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | '2xl' | 'full'

export interface ContainerProps extends HTMLAttributes<HTMLElement> {
  as?: StructureTag
  maxWidth?: ContainerMaxWidth
  padding?: boolean | string
  center?: boolean
}
