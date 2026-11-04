import type { PaginationItem } from '@utils/paginationItems.ts'
import type { HTMLAttributes, MouseEvent } from 'react'
import type { MotionOverride } from '@motion/types.ts'

export type { PaginationItem }

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

export interface UsePaginationOptions {
  pageCount: number
  page?: number | undefined
  defaultPage?: number | undefined
  onPageChange?: ((page: number) => void) | undefined
  siblingCount?: number | undefined
  boundaryCount?: number | undefined
}

export interface UsePaginationReturn {
  page: number
  pageCount: number
  items: PaginationItem[]
  hasPrevious: boolean
  hasNext: boolean
  goTo: (page: number) => void
  getPreviousProps: <User extends object = object>(props?: User) => { type: 'button'; 'aria-disabled': true | undefined; onClick: (event: MouseEvent<HTMLButtonElement>) => void } & User
  getNextProps: <User extends object = object>(props?: User) => { type: 'button'; 'aria-disabled': true | undefined; onClick: (event: MouseEvent<HTMLButtonElement>) => void } & User
  getPageProps: <User extends object = object>(page: number, props?: User) => { type: 'button'; 'aria-current': 'page' | undefined; onClick: (event: MouseEvent<HTMLButtonElement>) => void } & User
}
