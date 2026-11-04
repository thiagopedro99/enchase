import { defaultBoundaryCount, defaultPage, defaultSiblingCount } from './defaultData.ts'
import { useControllableState } from '@hooks/useControllableState.ts'
import { paginationItems } from '@utils/paginationItems.ts'
import { composeProps } from '@utils/composeProps.ts'

import type { UsePaginationOptions, UsePaginationReturn } from './types.ts'

const count = (value: number, fallback: number) => (Number.isFinite(value) ? Math.max(Math.floor(value), 0) : fallback)

export const usePagination = ({ pageCount, page, defaultPage: initialPage = defaultPage, onPageChange, siblingCount = defaultSiblingCount, boundaryCount = defaultBoundaryCount }: UsePaginationOptions): UsePaginationReturn => {
  const [selected, setSelected] = useControllableState<number>(page, initialPage, onPageChange)
  const total = count(pageCount, 0)
  const clamp = (value: number) => Math.min(Math.max(count(value, 1), 1), Math.max(total, 1))
  const current = clamp(selected)
  const items = paginationItems(current, total, count(siblingCount, defaultSiblingCount), count(boundaryCount, defaultBoundaryCount))
  const hasPrevious = current > 1
  const hasNext = current < total

  const getPreviousProps: UsePaginationReturn['getPreviousProps'] = (props) => {
    const own: ReturnType<UsePaginationReturn['getPreviousProps']> = { type: 'button', 'aria-disabled': hasPrevious ? undefined : true, onClick: () => hasPrevious && setSelected(current - 1) }

    return composeProps(own, props)
  }

  const getNextProps: UsePaginationReturn['getNextProps'] = (props) => {
    const own: ReturnType<UsePaginationReturn['getNextProps']> = { type: 'button', 'aria-disabled': hasNext ? undefined : true, onClick: () => hasNext && setSelected(current + 1) }

    return composeProps(own, props)
  }

  const getPageProps: UsePaginationReturn['getPageProps'] = (target, props) => {
    const own: ReturnType<UsePaginationReturn['getPageProps']> = { type: 'button', 'aria-current': target === current ? 'page' : undefined, onClick: () => setSelected(clamp(target)) }

    return composeProps(own, props)
  }

  return { page: current, pageCount: total, items, hasPrevious, hasNext, goTo: (target) => setSelected(clamp(target)), getPreviousProps, getNextProps, getPageProps }
}
