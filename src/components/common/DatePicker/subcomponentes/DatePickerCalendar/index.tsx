import { useState } from 'react'

import { Calendar } from '../Calendar/index.tsx'
import { usePopoverControl } from '../../../Popover/popoverControl.ts'
import { formatIsoDate, todayDate } from '@utils/calendarDate.ts'

import type { DatePickerCalendarProps } from './types.ts'

export const DatePickerCalendar = ({ value, min, max, isDateDisabled, firstDayOfWeek, locale, autoFocus, onSelect }: DatePickerCalendarProps) => {
  const control = usePopoverControl()
  const [today] = useState(() => formatIsoDate(todayDate()))

  const select = (date: string) => {
    onSelect(date)
    control?.close()
  }

  return <Calendar today={today} value={value} min={min} max={max} isDateDisabled={isDateDisabled} firstDayOfWeek={firstDayOfWeek} locale={locale} autoFocus={autoFocus} onSelect={select} />
}

export default DatePickerCalendar
