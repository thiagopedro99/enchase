import { mergeProps, slot } from '@utils/mergeProps.ts'
import styles from './styles.module.css'

import type { SortIndicatorProps } from './types.ts'

export const SortIndicator = ({ direction, ...props }: SortIndicatorProps) => {
  const own = { ...slot('table', 'sort-icon'), className: styles.icon, viewBox: '0 0 16 16', 'aria-hidden': 'true' as const, focusable: 'false' as const, 'data-direction': direction ?? 'none' }

  return (
    <svg {...mergeProps(own, props)}>
      <path className={styles.up} d="M8 2.5 11.5 7h-7z" />
      <path className={styles.down} d="M8 13.5 4.5 9h7z" />
    </svg>
  )
}

export default SortIndicator
