import type { KeyboardEvent, RefObject } from 'react'
import type { CalendarDate } from '@utils/calendarDate.ts'
import type { DateFormatter } from '@utils/dateFormat.ts'

export interface CalendarGridProps {
  weeks: CalendarDate[][]
  weekdays: number[]
  focused: CalendarDate
  today: CalendarDate
  format: DateFormatter
  labelledBy: string
  gridRef: RefObject<HTMLTableElement | null>
  isSelected: (date: CalendarDate) => boolean
  isDisabled: (date: CalendarDate) => boolean
  onChoose: (date: CalendarDate) => void
  onKeyDown: (event: KeyboardEvent<HTMLTableElement>) => void
}
