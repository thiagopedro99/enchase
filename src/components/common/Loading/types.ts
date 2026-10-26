import type { PortalContainer } from '@utils/portalContainer.ts'
import type { MotionOverride } from '@motion/types.ts'
import type { HTMLAttributes } from 'react'

export type LoadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface LoadingProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  size?: LoadingSize | undefined
  overlay?: boolean | undefined
  container?: PortalContainer | undefined
  text?: string | undefined
  color?: string | undefined
  animation?: MotionOverride | undefined
}

export interface InlineLoadingProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  size?: 'xs' | 'sm' | 'md' | undefined
  color?: string | undefined
  label?: string | undefined
  animation?: MotionOverride | undefined
}

export type SpinnerProps = {
  part: string
  size: LoadingSize
  color?: string | undefined
  animation?: MotionOverride | undefined
}
