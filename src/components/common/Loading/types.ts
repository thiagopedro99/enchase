import type { MotionOverride } from '@motion/types.ts'

export type LoadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface LoadingProps {
  size?: LoadingSize
  overlay?: boolean
  text?: string
  color?: string
  animation?: MotionOverride
}

export interface InlineLoadingProps {
  size?: 'xs' | 'sm' | 'md'
  color?: string
  label?: string
  animation?: MotionOverride
}
