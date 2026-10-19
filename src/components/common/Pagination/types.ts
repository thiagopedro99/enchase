import type { MotionOverride } from '@motion/types.ts'
import type { HTMLAttributes } from 'react'

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange' | 'children'> {
  pageCount: number
  page?: number
  defaultPage?: number
  onPageChange?: (page: number) => void
  siblingCount?: number
  boundaryCount?: number
  size?: 'sm' | 'md'
  ariaLabel?: string
  animation?: MotionOverride
}
