import { useId, useMemo } from 'react'

import { CalendarHeader } from './subcomponentes/CalendarHeader/index.tsx'
import { CalendarGrid } from './subcomponentes/CalendarGrid/index.tsx'
import { firstDayOfWeek } from '@utils/firstDayOfWeek.ts'
import { createDateFormat } from '@utils/dateFormat.ts'
import { defaultAutoFocus } from './defaultData.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import { useCalendar } from './useCalendar.ts'
import { slot } from '@utils/mergeProps.ts'
import styles from './styles.module.css'

import type { CalendarProps } from './types.ts'

const isWeekday = (day: number | undefined): day is number => day !== undefined && Number.isInteger(day) && day >= 0 && day <= 6

export const Calendar = ({ today, value, min, max, isDateDisabled, firstDayOfWeek: firstDayOverride, autoFocus = defaultAutoFocus, onSelect }: CalendarProps) => {
  const { locale, labels } = useUIConfig()
  const titleId = useId()
  const format = useMemo(() => createDateFormat(locale), [locale])
  const firstDay = isWeekday(firstDayOverride) ? firstDayOverride : firstDayOfWeek(locale)
  const calendar = useCalendar({ today, value, min, max, isDateDisabled, firstDay, autoFocus, onSelect })

  return (
    <div className={styles.calendar} {...slot('date-picker', 'calendar')}>
      <CalendarHeader
        title={format.monthLabel(calendar.focused)}
        titleId={titleId}
        previousLabel={labels.previousMonth}
        nextLabel={labels.nextMonth}
        canGoPrevious={calendar.canGoPrevious}
        canGoNext={calendar.canGoNext}
        onPrevious={calendar.goPrevious}
        onNext={calendar.goNext}
      />

      <CalendarGrid
        weeks={calendar.weeks}
        weekdays={calendar.weekdays}
        focused={calendar.focused}
        today={calendar.todayDate}
        format={format}
        labelledBy={titleId}
        gridRef={calendar.gridRef}
        isSelected={calendar.isSelected}
        isDisabled={calendar.isDisabled}
        onChoose={calendar.choose}
        onKeyDown={calendar.handleKeyDown}
      />
    </div>
  )
}

export default Calendar
