import { CalendarIcon } from '../../../Icon/icons/CalendarIcon.tsx'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import { slot } from '@utils/mergeProps.ts'
import styles from './styles.module.css'

import type { DatePickerToggleProps } from './types.ts'

export const DatePickerToggle = ({ disabled, ...props }: DatePickerToggleProps) => {
  const { labels } = useUIConfig()

  return (
    <button type="button" className={styles.toggle} aria-label={labels.openCalendar} disabled={disabled} {...props} {...slot('date-picker', 'toggle')}>
      <CalendarIcon size={20} />
    </button>
  )
}

export default DatePickerToggle
