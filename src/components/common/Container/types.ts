import type { StructureTag } from '@utils/structureTag.ts'
import type { HTMLAttributes, Ref } from 'react'

export type ContainerMaxWidth = 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | '2xl' | 'full'

export interface ContainerProps extends HTMLAttributes<HTMLElement> {
  as?: StructureTag | undefined
  maxWidth?: ContainerMaxWidth | undefined
  padding?: boolean | string | undefined
  center?: boolean | undefined
  ref?: Ref<HTMLElement> | undefined
}
