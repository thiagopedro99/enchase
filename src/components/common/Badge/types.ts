import type { HTMLAttributes } from 'react'

export type BadgeVariant = 'neutral' | 'primary' | 'success' | 'warning' | 'error' | 'info'

export type BadgeSize = 'sm' | 'md'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant | undefined
  size?: BadgeSize | undefined
}
