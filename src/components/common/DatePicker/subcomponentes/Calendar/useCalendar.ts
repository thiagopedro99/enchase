import { useLayoutEffect, useMemo, useRef, useState } from 'react'

import { addDays, addMonths, addYears, clampDate, compareDates, endOfMonth, endOfWeek, formatIsoDate, isSameDate, isWithin, monthWeeks, parseIsoDate, startOfMonth, startOfWeek } from '@utils/calendarDate.ts'

import type { KeyboardEvent } from 'react'
import type { CalendarDate } from '@utils/calendarDate.ts'

type CalendarState = {
  today: string
  value: string | null | undefined
  min: string | undefined
  max: string | undefined
  isDateDisabled: ((date: string) => boolean) | undefined
  firstDay: number
  autoFocus: boolean
  onSelect: (date: string) => void
}

const fallbackDate: CalendarDate = { year: 2000, month: 1, day: 1 }

const read = (text: string | null | undefined) => (text ? parseIsoDate(text) : null)

export const useCalendar = ({ today, value, min, max, isDateDisabled, firstDay, autoFocus, onSelect }: CalendarState) => {
  const gridRef = useRef<HTMLTableElement>(null)
  const moveFocus = useRef(autoFocus)
  const selected = read(value)
  const earliest = read(min)
  const latest = read(max)
  const todayDate = read(today) ?? fallbackDate
  const [focused, setFocused] = useState(() => clampDate(selected ?? todayDate, earliest, latest))
  const [synced, setSynced] = useState(value)

  if (value !== synced) {
    setSynced(value)

    if (selected) setFocused(clampDate(selected, earliest, latest))
  }

  const { year, month } = focused
  const weeks = useMemo(() => monthWeeks({ year, month, day: 1 }, firstDay), [year, month, firstDay])

  const isDisabled = (date: CalendarDate) => !isWithin(date, earliest, latest) || isDateDisabled?.(formatIsoDate(date)) === true

  useLayoutEffect(() => {
    if (!moveFocus.current) return

    moveFocus.current = false
    gridRef.current?.querySelector<HTMLElement>(`[data-date="${formatIsoDate(focused)}"]`)?.focus({ preventScroll: true })
  }, [focused])

  const choose = (date: CalendarDate) => {
    if (isDisabled(date)) return

    setFocused(date)
    onSelect(formatIsoDate(date))
  }

  const move = (date: CalendarDate) => {
    moveFocus.current = true
    setFocused(clampDate(date, earliest, latest))
  }

  const step = (months: number) => setFocused(clampDate(addMonths(focused, months), earliest, latest))

  const handleKeyDown = (event: KeyboardEvent<HTMLTableElement>) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return

    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl'

    const targets: Record<string, () => CalendarDate> = {
      ArrowLeft: () => addDays(focused, rtl ? 1 : -1),
      ArrowRight: () => addDays(focused, rtl ? -1 : 1),
      ArrowUp: () => addDays(focused, -7),
      ArrowDown: () => addDays(focused, 7),
      Home: () => startOfWeek(focused, firstDay),
      End: () => endOfWeek(focused, firstDay),
      PageUp: () => (event.shiftKey ? addYears(focused, -1) : addMonths(focused, -1)),
      PageDown: () => (event.shiftKey ? addYears(focused, 1) : addMonths(focused, 1))
    }
    const target = event.shiftKey && !event.key.startsWith('Page') ? undefined : targets[event.key]

    if (target) {
      event.preventDefault()
      move(target())

      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      choose(focused)
    }
  }

  return {
    gridRef,
    focused,
    weeks,
    weekdays: Array.from({ length: 7 }, (_, index) => (firstDay + index) % 7),
    todayDate,
    isSelected: (date: CalendarDate) => selected !== null && isSameDate(date, selected),
    isDisabled,
    canGoPrevious: earliest === null || compareDates(endOfMonth(addMonths(focused, -1)), earliest) >= 0,
    canGoNext: latest === null || compareDates(startOfMonth(addMonths(focused, 1)), latest) <= 0,
    goPrevious: () => step(-1),
    goNext: () => step(1),
    choose,
    handleKeyDown
  }
}
