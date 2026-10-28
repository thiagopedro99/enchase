import { formatIsoDate, isSameDate, isSameMonth } from '@utils/calendarDate.ts'
import { slot } from '@utils/mergeProps.ts'
import styles from './styles.module.css'

import type { CalendarGridProps } from './types.ts'

export const CalendarGrid = ({ weeks, weekdays, focused, today, format, labelledBy, gridRef, isSelected, isDisabled, onChoose, onKeyDown }: CalendarGridProps) => (
  <table ref={gridRef} role="grid" aria-labelledby={labelledBy} className={styles.grid} onKeyDown={onKeyDown} {...slot('date-picker', 'calendar-grid')}>
    <thead>
      <tr>
        {weekdays.map((weekday) => (
          <th key={weekday} scope="col" abbr={format.weekdayName(weekday, 'long')} className={styles.weekday} {...slot('date-picker', 'calendar-weekday')}>
            {format.weekdayName(weekday, 'narrow')}
          </th>
        ))}
      </tr>
    </thead>

    <tbody>
      {weeks.map((week) => (
        <tr key={formatIsoDate(week[0])} {...slot('date-picker', 'calendar-week')}>
          {week.map((day) => (
            <td
              key={formatIsoDate(day)}
              role="gridcell"
              tabIndex={isSameDate(day, focused) ? 0 : -1}
              className={styles.day}
              aria-label={format.fullDate(day)}
              aria-selected={isSelected(day)}
              aria-current={isSameDate(day, today) ? 'date' : undefined}
              aria-disabled={isDisabled(day) || undefined}
              data-date={formatIsoDate(day)}
              data-outside={isSameMonth(day, focused) ? undefined : ''}
              onClick={() => onChoose(day)}
              {...slot('date-picker', 'calendar-day')}
            >
              <span className={styles.number} {...slot('date-picker', 'calendar-day-number')}>
                {format.dayLabel(day)}
              </span>
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
)

export default CalendarGrid
