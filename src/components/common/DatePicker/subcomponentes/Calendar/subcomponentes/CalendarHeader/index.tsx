import { ChevronRightIcon } from '@components/common/Icon/icons/ChevronRightIcon.tsx'
import { ChevronLeftIcon } from '@components/common/Icon/icons/ChevronLeftIcon.tsx'
import { slot } from '@utils/mergeProps.ts'
import styles from './styles.module.css'

import type { CalendarHeaderProps } from './types.ts'

export const CalendarHeader = ({ title, titleId, previousLabel, nextLabel, canGoPrevious, canGoNext, onPrevious, onNext }: CalendarHeaderProps) => (
  <div className={styles.header} {...slot('date-picker', 'calendar-header')}>
    <button type="button" className={styles.nav} aria-label={previousLabel} disabled={!canGoPrevious} onClick={onPrevious} {...slot('date-picker', 'calendar-nav')}>
      <ChevronLeftIcon size={20} />
    </button>

    <div id={titleId} className={styles.title} aria-live="polite" aria-atomic="true" {...slot('date-picker', 'calendar-title')}>
      {title}
    </div>

    <button type="button" className={styles.nav} aria-label={nextLabel} disabled={!canGoNext} onClick={onNext} {...slot('date-picker', 'calendar-nav')}>
      <ChevronRightIcon size={20} />
    </button>
  </div>
)

export default CalendarHeader
