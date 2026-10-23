import type { MotionOverride } from '@motion/types.ts'
import type { StructureTag } from '@utils/structureTag.ts'
import type { HTMLAttributes } from 'react'

export type CardVariant = 'default' | 'elevated' | 'outlined'

export interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: StructureTag
  variant?: CardVariant
  padding?: string
  animation?: MotionOverride
}
