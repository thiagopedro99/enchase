import type { MotionOverride } from '@motion/types.ts'
import type { HTMLAttributes } from 'react'

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange' | 'children'> {
  pageCount: number
  page?: number | undefined
  defaultPage?: number | undefined
  onPageChange?: ((page: number) => void) | undefined
  siblingCount?: number | undefined
  boundaryCount?: number | undefined
  size?: 'sm' | 'md' | undefined
  ariaLabel?: string | undefined
  animation?: MotionOverride | undefined
}
