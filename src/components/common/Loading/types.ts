import type { MotionOverride } from '@motion/types.ts'
import type { HTMLAttributes } from 'react'

export type LoadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface LoadingProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  size?: LoadingSize
  overlay?: boolean
  text?: string
  color?: string
  animation?: MotionOverride
}

export interface InlineLoadingProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  size?: 'xs' | 'sm' | 'md'
  color?: string
  label?: string
  animation?: MotionOverride
}

export type SpinnerProps = {
  part: string
  size: LoadingSize
  color?: string
  animation?: MotionOverride
}
