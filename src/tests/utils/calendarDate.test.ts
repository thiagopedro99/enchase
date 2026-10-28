import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  addDays,
  addMonths,
  addYears,
  clampDate,
  compareDates,
  dayOfWeek,
  daysInMonth,
  endOfMonth,
  endOfWeek,
  formatIsoDate,
  isLeapYear,
  isSameDate,
  isSameMonth,
  isValidDate,
  isWithin,
  monthWeeks,
  parseIsoDate,
  startOfMonth,
  startOfWeek,
  todayDate
} from '@utils/calendarDate.ts'

import type { CalendarDate } from '@utils/calendarDate.ts'

const date = (year: number, month: number, day: number): CalendarDate => ({ year, month, day })

const utc = ({ year, month, day }: CalendarDate) => {
  const instant = new Date(0)

  instant.setUTCFullYear(year, month - 1, day)

  return instant
}

const fromUtc = (instant: Date) => date(instant.getUTCFullYear(), instant.getUTCMonth() + 1, instant.getUTCDate())

describe('isLeapYear and daysInMonth', () => {
  it('follows the rule of the Gregorian calendar', () => {
    expect([1900, 2000, 2023, 2024, 2026, 2100, 2400].map(isLeapYear)).toEqual([false, true, false, true, false, false, true])
  })

  it('gives every month its number of days, and February the leap day only in leap years', () => {
    expect(Array.from({ length: 12 }, (_, index) => daysInMonth(2026, index + 1))).toEqual([31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31])
    expect(daysInMonth(2024, 2)).toBe(29)
    expect(daysInMonth(1900, 2)).toBe(28)
  })
})

describe('isValidDate', () => {
  it('accepts real days and the ends of the supported years', () => {
    expect([date(2026, 10, 28), date(2024, 2, 29), date(1, 1, 1), date(9999, 12, 31)].map(isValidDate)).toEqual([true, true, true, true])
  })

  it('refuses days that do not exist, months out of range, years out of range and numbers that are not whole', () => {
    expect([date(2026, 2, 29), date(2026, 4, 31), date(2026, 13, 1), date(2026, 0, 1), date(2026, 1, 0), date(0, 1, 1), date(10000, 1, 1), date(2026.5, 1, 1), date(Number.NaN, 1, 1)].map(isValidDate)).toEqual([
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false
    ])
  })
})

describe('parseIsoDate and formatIsoDate', () => {
  it('reads YYYY-MM-DD and writes it back, padding the year to four digits', () => {
    expect(parseIsoDate('2026-10-28')).toEqual(date(2026, 10, 28))
    expect(parseIsoDate('0099-01-02')).toEqual(date(99, 1, 2))
    expect(formatIsoDate(date(2026, 3, 4))).toBe('2026-03-04')
    expect(formatIsoDate(date(99, 1, 2))).toBe('0099-01-02')
  })

  it('refuses anything that is not exactly a real day written that way', () => {
    for (const text of ['', '2026-2-3', ' 2026-10-28', '2026-10-28 ', '2026-10-28T00:00', '2026/10/28', '28-10-2026', '2026-02-30', '2026-13-01', '0000-01-01', '+2026-10-28', '٢٠٢٦-١٠-٢٨']) expect(parseIsoDate(text), text).toBeNull()
  })

  it('round trips every day of a long stretch', () => {
    const wrong: string[] = []

    for (let count = 0; count < 800; count += 1) {
      const day = addDays(date(2025, 12, 1), count)

      if (!isSameDate(parseIsoDate(formatIsoDate(day)) as CalendarDate, day)) wrong.push(formatIsoDate(day))
    }

    expect(wrong).toEqual([])
  })
})

describe('addDays and dayOfWeek', () => {
  it('agrees with the Date of the platform on every day from 1900 to 2100', () => {
    const start = date(1900, 1, 1)
    const wrong: string[] = []

    for (let count = 0; count <= 73413; count += 1) {
      const expected = new Date(Date.UTC(1900, 0, 1 + count))
      const actual = addDays(start, count)

      if (!isSameDate(actual, fromUtc(expected)) || dayOfWeek(actual) !== expected.getUTCDay()) wrong.push(formatIsoDate(actual))
    }

    expect(wrong).toEqual([])
  })

  it('agrees with the Date of the platform across the whole range of years, in steps', () => {
    const wrong: string[] = []

    for (let year = 1; year <= 9999; year += 37) {
      const start = date(year, 3, 1)
      const moved = addDays(start, 1000)
      const expected = utc(start)

      expected.setUTCDate(expected.getUTCDate() + 1000)

      if (!isSameDate(moved, fromUtc(expected)) || dayOfWeek(moved) !== expected.getUTCDay()) wrong.push(formatIsoDate(moved))
    }

    expect(wrong).toEqual([])
  })

  it('goes back as well as forward, across months, years and centuries', () => {
    expect(addDays(date(2026, 3, 1), -1)).toEqual(date(2026, 2, 28))
    expect(addDays(date(2024, 3, 1), -1)).toEqual(date(2024, 2, 29))
    expect(addDays(date(2026, 1, 1), -1)).toEqual(date(2025, 12, 31))
    expect(addDays(date(2026, 12, 31), 1)).toEqual(date(2027, 1, 1))
    expect(addDays(date(2026, 10, 28), 0)).toEqual(date(2026, 10, 28))
    expect(addDays(date(2000, 1, 1), -36524)).toEqual(date(1900, 1, 1))
  })

  it('stops at the first and the last supported day', () => {
    expect(addDays(date(1, 1, 3), -10)).toEqual(date(1, 1, 1))
    expect(addDays(date(9999, 12, 29), 10)).toEqual(date(9999, 12, 31))
  })

  it('knows the days of the week, counting from Sunday as 0', () => {
    expect([date(2026, 10, 25), date(2026, 10, 26), date(2026, 10, 28), date(2026, 10, 31)].map(dayOfWeek)).toEqual([0, 1, 3, 6])
    expect(dayOfWeek(date(1970, 1, 1))).toBe(4)
  })
})

describe('addMonths and addYears', () => {
  it('moves by months and keeps the day, or the last day of a shorter month', () => {
    expect(addMonths(date(2026, 10, 28), 1)).toEqual(date(2026, 11, 28))
    expect(addMonths(date(2026, 1, 31), 1)).toEqual(date(2026, 2, 28))
    expect(addMonths(date(2024, 1, 31), 1)).toEqual(date(2024, 2, 29))
    expect(addMonths(date(2026, 3, 31), -1)).toEqual(date(2026, 2, 28))
    expect(addMonths(date(2026, 5, 31), 1)).toEqual(date(2026, 6, 30))
  })

  it('crosses the years in both directions and by many months at once', () => {
    expect(addMonths(date(2026, 12, 15), 1)).toEqual(date(2027, 1, 15))
    expect(addMonths(date(2026, 1, 15), -1)).toEqual(date(2025, 12, 15))
    expect(addMonths(date(2026, 10, 15), 27)).toEqual(date(2029, 1, 15))
    expect(addMonths(date(2026, 10, 15), -130)).toEqual(date(2015, 12, 15))
    expect(addMonths(date(2026, 10, 15), 0)).toEqual(date(2026, 10, 15))
  })

  it('stops at the first and the last supported year', () => {
    expect(addMonths(date(1, 2, 3), -5)).toEqual(date(1, 1, 1))
    expect(addMonths(date(9999, 11, 3), 5)).toEqual(date(9999, 12, 31))
  })

  it('moves by years and lands the leap day on the last day of February in a year that has none', () => {
    expect(addYears(date(2024, 2, 29), 1)).toEqual(date(2025, 2, 28))
    expect(addYears(date(2024, 2, 29), 4)).toEqual(date(2028, 2, 29))
    expect(addYears(date(2026, 10, 28), -10)).toEqual(date(2016, 10, 28))
  })
})

describe('comparing and bounding dates', () => {
  it('orders dates by year, then month, then day', () => {
    expect(Math.sign(compareDates(date(2026, 10, 28), date(2026, 10, 29)))).toBe(-1)
    expect(Math.sign(compareDates(date(2026, 11, 1), date(2026, 10, 31)))).toBe(1)
    expect(Math.sign(compareDates(date(2027, 1, 1), date(2026, 12, 31)))).toBe(1)
    expect(compareDates(date(2026, 10, 28), date(2026, 10, 28))).toBe(0)
  })

  it('tells the same day and the same month apart from near misses', () => {
    expect(isSameDate(date(2026, 10, 28), date(2026, 10, 28))).toBe(true)
    expect(isSameDate(date(2026, 10, 28), date(2026, 11, 28))).toBe(false)
    expect(isSameMonth(date(2026, 10, 1), date(2026, 10, 31))).toBe(true)
    expect(isSameMonth(date(2026, 10, 1), date(2025, 10, 1))).toBe(false)
  })

  it('finds the edges of a month', () => {
    expect(startOfMonth(date(2026, 10, 28))).toEqual(date(2026, 10, 1))
    expect(endOfMonth(date(2026, 10, 28))).toEqual(date(2026, 10, 31))
    expect(endOfMonth(date(2024, 2, 3))).toEqual(date(2024, 2, 29))
  })

  it('moves a date into the limits that exist, and leaves it alone otherwise', () => {
    const min = date(2026, 10, 10)
    const max = date(2026, 10, 20)

    expect(clampDate(date(2026, 10, 5), min, max)).toBe(min)
    expect(clampDate(date(2026, 10, 25), min, max)).toBe(max)
    expect(clampDate(date(2026, 10, 15), min, max)).toEqual(date(2026, 10, 15))
    expect(clampDate(date(2026, 10, 5), null, max)).toEqual(date(2026, 10, 5))
    expect(clampDate(date(2026, 10, 25), min, null)).toEqual(date(2026, 10, 25))
    expect(clampDate(date(2026, 10, 25))).toEqual(date(2026, 10, 25))
  })

  it('tells whether a date is inside the limits that exist, the limits included', () => {
    const min = date(2026, 10, 10)
    const max = date(2026, 10, 20)

    expect(isWithin(date(2026, 10, 15), min, max)).toBe(true)
    expect(isWithin(date(2026, 10, 10), min, max)).toBe(true)
    expect(isWithin(date(2026, 10, 20), min, max)).toBe(true)
    expect(isWithin(date(2026, 10, 9), min, max)).toBe(false)
    expect(isWithin(date(2026, 10, 21), min, max)).toBe(false)
    expect(isWithin(date(2025, 12, 31), min, null)).toBe(false)
    expect(isWithin(date(2030, 1, 1), min, null)).toBe(true)
    expect(isWithin(date(2030, 1, 1), null, max)).toBe(false)
    expect(isWithin(date(2025, 12, 31), undefined, max)).toBe(true)
    expect(isWithin(date(2030, 1, 1))).toBe(true)
  })
})

describe('startOfWeek and endOfWeek', () => {
  it('finds the first and the last day of the week for any first day', () => {
    expect(startOfWeek(date(2026, 10, 28), 0)).toEqual(date(2026, 10, 25))
    expect(startOfWeek(date(2026, 10, 28), 1)).toEqual(date(2026, 10, 26))
    expect(startOfWeek(date(2026, 10, 28), 6)).toEqual(date(2026, 10, 24))
    expect(endOfWeek(date(2026, 10, 28), 0)).toEqual(date(2026, 10, 31))
    expect(endOfWeek(date(2026, 10, 28), 1)).toEqual(date(2026, 11, 1))
    expect(endOfWeek(date(2026, 10, 28), 6)).toEqual(date(2026, 10, 30))
  })

  it('keeps a day that already is the first or the last of its week', () => {
    expect(startOfWeek(date(2026, 10, 25), 0)).toEqual(date(2026, 10, 25))
    expect(endOfWeek(date(2026, 10, 31), 0)).toEqual(date(2026, 10, 31))
  })

  it('crosses a month and a year', () => {
    expect(startOfWeek(date(2026, 1, 1), 1)).toEqual(date(2025, 12, 29))
    expect(endOfWeek(date(2025, 12, 29), 0)).toEqual(date(2026, 1, 3))
  })
})

describe('monthWeeks', () => {
  const flat = (weeks: CalendarDate[][]) => weeks.map((week) => week.map(formatIsoDate))

  it('lays out six weeks of seven days that start on the first day of the week that holds the first of the month', () => {
    const weeks = monthWeeks(date(2026, 10, 14), 0)

    expect(weeks).toHaveLength(6)
    expect(weeks.every((week) => week.length === 7)).toBe(true)
    expect(formatIsoDate(weeks[0][0])).toBe('2026-09-27')
    expect(formatIsoDate(weeks[5][6])).toBe('2026-11-07')
    expect(flat(weeks)[0]).toEqual(['2026-09-27', '2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03'])
  })

  it('starts on the day the app chooses', () => {
    expect(formatIsoDate(monthWeeks(date(2026, 10, 14), 1)[0][0])).toBe('2026-09-28')
    expect(formatIsoDate(monthWeeks(date(2026, 10, 14), 6)[0][0])).toBe('2026-09-26')
  })

  it('holds every day of the month once and in order', () => {
    const days = monthWeeks(date(2026, 10, 14), 0).flat().filter((day) => day.month === 10)

    expect(days.map((day) => day.day)).toEqual(Array.from({ length: 31 }, (_, index) => index + 1))
  })

  it('starts a month that begins on the first day of the week in its first row', () => {
    expect(formatIsoDate(monthWeeks(date(2026, 2, 14), 0)[0][0])).toBe('2026-02-01')
    expect(formatIsoDate(monthWeeks(date(2026, 2, 14), 0)[5][6])).toBe('2026-03-14')
  })

  it('can lay out fewer weeks', () => {
    expect(monthWeeks(date(2026, 10, 14), 0, 5)).toHaveLength(5)
  })
})

describe('todayDate', () => {
  const offsets: Record<string, number> = { UTC: 0, 'America/Sao_Paulo': 180, 'Pacific/Kiritimati': -840, 'Pacific/Pago_Pago': 660 }
  const zones = Object.keys(offsets)
  const original = process.env.TZ

  afterEach(() => {
    vi.useRealTimers()

    if (original === undefined) delete process.env.TZ
    else process.env.TZ = original
  })

  it.each(zones)('is the day on the clock of the person, not the one in Greenwich, in %s', (zone) => {
    process.env.TZ = zone
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 9, 28, 23, 30))

    expect(new Date(2026, 9, 28).getTimezoneOffset()).toBe(offsets[zone])
    expect(todayDate()).toEqual(date(2026, 10, 28))

    vi.setSystemTime(new Date(2026, 9, 29, 0, 30))

    expect(todayDate()).toEqual(date(2026, 10, 29))
  })

  it('is not moved by the zone of the machine for any of the other functions', () => {
    const results = zones.map((zone) => {
      process.env.TZ = zone

      return [formatIsoDate(addDays(date(2026, 10, 28), 3)), dayOfWeek(date(2026, 10, 28)), formatIsoDate(addMonths(date(2026, 1, 31), 1))]
    })

    expect(new Set(results.map((entry) => JSON.stringify(entry))).size).toBe(1)
  })
})
