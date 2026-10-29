import { resolveLocale } from './resolveLocale.ts'
import { isValidDate } from './calendarDate.ts'

import type { CalendarDate } from './calendarDate.ts'

export type DatePart = 'day' | 'month' | 'year'

export type WeekdayWidth = 'narrow' | 'short' | 'long'

export type DateFormatter = {
  order: DatePart[]
  format: (date: CalendarDate) => string
  parse: (text: string) => CalendarDate | null
  monthLabel: (date: CalendarDate) => string
  weekdayName: (weekday: number, width: WeekdayWidth) => string
  dayLabel: (date: CalendarDate) => string
  fullDate: (date: CalendarDate) => string
}

const numberingSystems = ['arab', 'arabext', 'beng', 'deva', 'fullwide', 'gujr', 'guru', 'khmr', 'knda', 'laoo', 'latn', 'mlym', 'mong', 'mymr', 'orya', 'tamldec', 'telu', 'thai', 'tibt']

let nativeDigits: Map<string, string> | undefined

const digitsOf = () => {
  nativeDigits ??= new Map(
    numberingSystems.flatMap((numberingSystem) => {
      const digits = new Intl.NumberFormat('en', { numberingSystem, useGrouping: false })

      return Array.from({ length: 10 }, (_, digit) => [digits.format(digit), String(digit)] as const)
    })
  )

  return nativeDigits
}

const digitPattern = /\p{Nd}/gu

const sundayInstant = Date.UTC(1970, 0, 4)

const instant = ({ year, month, day }: CalendarDate) => {
  const value = new Date(0)

  value.setUTCFullYear(year, month - 1, day)

  return value
}

const construct = (locale: string, options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(new Intl.Locale(locale, { calendar: 'gregory' }).toString(), { ...options, timeZone: 'UTC' })

const toAsciiDigits = (text: string) => text.replace(digitPattern, (digit) => digitsOf().get(digit) ?? digit)

const compactWidths: Record<DatePart, number> = { day: 2, month: 2, year: 4 }

const build = (requested: string): DateFormatter => {
  const locale = resolveLocale(requested, Intl.DateTimeFormat)
  const field = construct(locale, { year: 'numeric', month: '2-digit', day: '2-digit' })
  const month = construct(locale, { month: 'long', year: 'numeric' })
  const day = construct(locale, { day: 'numeric' })
  const full = construct(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const weekdays = { narrow: construct(locale, { weekday: 'narrow' }), short: construct(locale, { weekday: 'short' }), long: construct(locale, { weekday: 'long' }) }
  const order = field
    .formatToParts(instant({ year: 2026, month: 10, day: 28 }))
    .map((part) => part.type)
    .filter((type): type is DatePart => type === 'day' || type === 'month' || type === 'year')

  const zero = new Intl.NumberFormat('en', { numberingSystem: field.resolvedOptions().numberingSystem, useGrouping: false }).format(0)

  const write = (date: CalendarDate) =>
    date.year >= 1000
      ? field.format(instant(date))
      : field
          .formatToParts(instant(date))
          .map(({ type, value }) => (type === 'year' ? value.padStart(4, zero) : value))
          .join('')

  const assemble = (groups: string[], parts: DatePart[]) => {
    const values = Object.fromEntries(parts.map((part, index) => [part, groups[index]])) as Record<DatePart, string>

    if (values.year.length !== 4 || values.month.length > 2 || values.day.length > 2) return null

    const date = { year: Number(values.year), month: Number(values.month), day: Number(values.day) }

    return isValidDate(date) ? date : null
  }

  const parse = (text: string) => {
    const digits = toAsciiDigits(text).trim()
    const groups = digits.match(/\d+/g) ?? []
    const compact = /^\d{8}$/.test(digits)
    const sizes = order.map((part) => compactWidths[part])
    const starts = sizes.map((_, index) => sizes.slice(0, index).reduce((total, size) => total + size, 0))

    if (compact) return assemble(sizes.map((size, index) => digits.slice(starts[index], starts[index] + size)), order)
    if (groups.length !== 3) return null
    if (groups[0].length === 4) return assemble(groups, ['year', 'month', 'day'])

    return assemble(groups, order)
  }

  return {
    order,
    format: write,
    parse,
    monthLabel: (date) => month.format(instant(date)),
    weekdayName: (weekday, width) => weekdays[width].format(new Date(sundayInstant + weekday * 86400000)),
    dayLabel: (date) => day.format(instant(date)),
    fullDate: (date) => full.format(instant(date))
  }
}

const formatters = new Map<string, DateFormatter>()

export const createDateFormat = (locale: string) => {
  const known = formatters.get(locale)

  if (known) return known

  const created = build(locale)

  formatters.set(locale, created)

  return created
}
