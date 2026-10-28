import { describe, expect, it } from 'vitest'

import { addDays, formatIsoDate } from '@utils/calendarDate.ts'
import { createDateFormat } from '@utils/dateFormat.ts'
import { firstDayByRegion, firstDayOfWeek } from '@utils/firstDayOfWeek.ts'

import type { CalendarDate } from '@utils/calendarDate.ts'

type WeekInfoLocale = Intl.Locale & { getWeekInfo?: () => { firstDay: number }; weekInfo?: { firstDay: number } }

const letters = Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index))

const regions = letters.flatMap((first) => letters.map((second) => `${first}${second}`))

const names = new Intl.DisplayNames('en', { type: 'region', fallback: 'none' })

const known = regions.filter((region) => names.of(region) !== undefined && Intl.getCanonicalLocales(`und-${region}`)[0] === `und-${region}`)

const drift = ['AE', 'IS']

const weekInfoOf = (tag: string) => {
  const locale = new Intl.Locale(tag) as WeekInfoLocale

  return locale.getWeekInfo?.() ?? locale.weekInfo
}

const date = (year: number, month: number, day: number): CalendarDate => ({ year, month, day })

const locales = ['en', 'en-GB', 'pt-BR', 'pt-PT', 'es', 'fr', 'de', 'it', 'nl', 'sv', 'pl', 'ru', 'tr', 'ja', 'ko', 'zh-CN', 'zh-TW', 'hi', 'th', 'id', 'he', 'ar', 'ar-EG', 'ar-SA', 'fa', 'hu', 'cs', 'fi', 'da', 'nb', 'uk']

describe('the dates of the platform in a real browser', () => {
  it('knows the regions the table of the first day of the week is checked against', () => {
    expect(known.length).toBeGreaterThan(200)
    expect(known).toEqual(expect.arrayContaining(['BR', 'US', 'GB', 'EG', 'MV', 'DE', 'JP']))
  })

  it('has a table of the first day of the week that agrees with the platform for every region it knows, except the two where the data of the platforms differ from one another', () => {
    const informed = known.filter((region) => weekInfoOf(`und-${region}`) !== undefined)
    const wrong = informed.filter((region) => firstDayByRegion(region) !== (weekInfoOf(`und-${region}`)?.firstDay ?? 0) % 7)

    expect(wrong.filter((region) => !drift.includes(region))).toEqual([])
    expect(informed.length).toBeGreaterThan(200)
  })

  it('reads the first day of the week of a language from the platform, or from the table when the platform cannot say', () => {
    expect(['pt-BR', 'en-US', 'en-GB', 'de', 'fr', 'ar-EG', 'ja', 'he'].map(firstDayOfWeek)).toEqual([0, 0, 1, 1, 1, 6, 0, 0])
  })

  it('reads back what it writes, in every language and for a spread of days', () => {
    const days = [date(2026, 10, 28), date(2026, 1, 1), date(2026, 12, 31), date(2024, 2, 29), date(1999, 12, 9), date(1, 1, 1), date(9999, 12, 31)]
    const wrong = locales.flatMap((locale) => {
      const formatter = createDateFormat(locale)

      return days.flatMap((day) => (JSON.stringify(formatter.parse(formatter.format(day))) === JSON.stringify(day) ? [] : [`${locale}: ${formatter.format(day)}`]))
    })

    expect(wrong).toEqual([])
  })

  it('writes the Gregorian year even for the languages whose calendar is another by default', () => {
    for (const locale of ['th', 'ar-SA', 'fa']) {
      const formatter = createDateFormat(locale)

      expect(formatter.monthLabel(date(2026, 10, 28)), locale).toMatch(/2026|٢٠٢٦|۲۰۲۶/)
      expect(formatter.parse(formatter.format(date(2026, 10, 28))), locale).toEqual(date(2026, 10, 28))
    }
  })

  it('gives each of the seven weekdays a name of its own, short and long, in every language', () => {
    for (const locale of locales) {
      const formatter = createDateFormat(locale)

      expect(new Set(Array.from({ length: 7 }, (_, weekday) => formatter.weekdayName(weekday, 'long'))).size, locale).toBe(7)
      expect(new Set(Array.from({ length: 7 }, (_, weekday) => formatter.weekdayName(weekday, 'short'))).size, locale).toBe(7)
    }
  })

  it('names the day of the week of a date the way the language does, from the first day to the last of the supported years', () => {
    const english = createDateFormat('en')

    expect(english.fullDate(date(1, 1, 1))).toMatch(/Monday/)
    expect(english.fullDate(date(9999, 12, 31))).toMatch(/Friday/)
    expect(english.fullDate(date(2026, 10, 28))).toBe('Wednesday, October 28, 2026')
  })

  it('walks a year of days without skipping or repeating one', () => {
    const formatter = createDateFormat('en')
    const days = Array.from({ length: 366 }, (_, count) => addDays(date(2024, 1, 1), count))

    expect(new Set(days.map(formatIsoDate)).size).toBe(366)
    expect(days.map((day) => formatter.parse(formatter.format(day)))).toEqual(days)
  })
})
