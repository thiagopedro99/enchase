import { forwardRef } from 'react'

import { ChevronRightIcon } from '../Icon/icons/ChevronRightIcon.tsx'
import { ChevronLeftIcon } from '../Icon/icons/ChevronLeftIcon.tsx'
import { useMotionStyle } from '@hooks/useMotionStyle.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import { usePagination } from './usePagination.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import { defaultSize } from './defaultData.ts'
import styles from './styles.module.css'

import type { PaginationProps } from './types.ts'

export const Pagination = forwardRef<HTMLElement, PaginationProps>(({ pageCount, page, defaultPage, onPageChange, siblingCount, boundaryCount, size = defaultSize, ariaLabel, animation, ...props }, ref) => {
  const { labels } = useUIConfig()
  const pagination = usePagination({ pageCount, page, defaultPage, onPageChange, siblingCount, boundaryCount })
  const motionStyle = useMotionStyle('fade', 'pagination', animation)
  const root = mergeProps({ ...slot('pagination'), className: styles.pagination, style: motionStyle, 'data-size': size, 'aria-label': ariaLabel ?? labels.pagination }, props)

  if (pagination.pageCount < 1) return null

  return (
    <nav {...root} ref={ref}>
      <ul className={styles.list} {...slot('pagination', 'list')}>
        <li className={styles.item}>
          <button {...pagination.getPreviousProps({ className: styles.control, 'aria-label': labels.previousPage, ...slot('pagination', 'previous') })}>
            <ChevronLeftIcon size={20} />
          </button>
        </li>

        {pagination.items.map((item) =>
          typeof item === 'number' ? (
            <li key={item} className={styles.item}>
              <button {...pagination.getPageProps(item, { className: styles.control, ...slot('pagination', 'page') })}>
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
          <button {...pagination.getNextProps({ className: styles.control, 'aria-label': labels.nextPage, ...slot('pagination', 'next') })}>
            <ChevronRightIcon size={20} />
          </button>
        </li>
      </ul>
    </nav>
  )
})

Pagination.displayName = 'Pagination'

export default Pagination
