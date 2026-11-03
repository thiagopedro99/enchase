import type { MotionOverride } from '@motion/types.ts'
import type { StructureTag } from '@utils/structureTag.ts'
import type { HTMLAttributes, ReactNode } from 'react'

export type CardVariant = 'default' | 'elevated' | 'outlined'

export interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: StructureTag | undefined
  variant?: CardVariant | undefined
  padding?: string | undefined
  header?: ReactNode | undefined
  headerExtra?: ReactNode | undefined
  animation?: MotionOverride | undefined
}
