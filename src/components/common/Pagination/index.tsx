import { forwardRef } from 'react'

import { defaultBoundaryCount, defaultPage, defaultSiblingCount, defaultSize } from './defaultData.ts'
import { useControllableState } from '@hooks/useControllableState.ts'
import { ChevronRightIcon } from '../Icon/icons/ChevronRightIcon.tsx'
import { ChevronLeftIcon } from '../Icon/icons/ChevronLeftIcon.tsx'
import { paginationItems } from '@utils/paginationItems.ts'
import { useMotionStyle } from '@hooks/useMotionStyle.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import styles from './styles.module.css'

import type { PaginationProps } from './types.ts'

export const Pagination = forwardRef<HTMLElement, PaginationProps>(
  ({ pageCount, page, defaultPage: initialPage = defaultPage, onPageChange, siblingCount = defaultSiblingCount, boundaryCount = defaultBoundaryCount, size = defaultSize, ariaLabel, animation, ...props }, ref) => {
    const { labels } = useUIConfig()
    const [selected, setSelected] = useControllableState<number>(page, initialPage, onPageChange)
    const motionStyle = useMotionStyle('fade', 'pagination', animation)
    const total = Math.max(Math.floor(pageCount), 0)
    const current = Math.min(Math.max(selected, 1), Math.max(total, 1))
    const items = paginationItems(current, total, Math.max(Math.floor(siblingCount), 0), Math.max(Math.floor(boundaryCount), 0))
    const root = mergeProps({ ...slot('pagination'), className: styles.pagination, style: motionStyle, 'data-size': size, 'aria-label': ariaLabel ?? labels.pagination }, props)

    if (total < 1) return null

    return (
      <nav {...root} ref={ref}>
        <ul className={styles.list} {...slot('pagination', 'list')}>
          <li className={styles.item}>
            <button type="button" className={styles.control} aria-label={labels.previousPage} aria-disabled={current <= 1 || undefined} onClick={() => current > 1 && setSelected(current - 1)} {...slot('pagination', 'previous')}>
              <ChevronLeftIcon size={20} />
            </button>
          </li>

          {items.map((item) =>
            typeof item === 'number' ? (
              <li key={item} className={styles.item}>
                <button type="button" className={styles.control} aria-current={item === current ? 'page' : undefined} onClick={() => setSelected(item)} {...slot('pagination', 'page')}>
                  {item}
                </button>
              </li>
            ) : (
              <li key={item} className={styles.item} aria-hidden="true">
                <span className={styles.ellipsis} {...slot('pagination', 'ellipsis')}>
                  …
                </span>
              </li>
            )
          )}

          <li className={styles.item}>
            <button type="button" className={styles.control} aria-label={labels.nextPage} aria-disabled={current >= total || undefined} onClick={() => current < total && setSelected(current + 1)} {...slot('pagination', 'next')}>
              <ChevronRightIcon size={20} />
            </button>
          </li>
        </ul>
      </nav>
    )
  }
)

Pagination.displayName = 'Pagination'

export default Pagination
