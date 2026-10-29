import { describe, expect, it } from 'vitest'

import { createDateFormat } from '@utils/dateFormat.ts'

import type { CalendarDate } from '@utils/calendarDate.ts'

const date = (year: number, month: number, day: number): CalendarDate => ({ year, month, day })

const locales = ['en', 'en-GB', 'pt-BR', 'pt-PT', 'es', 'fr', 'de', 'it', 'nl', 'sv', 'pl', 'ru', 'tr', 'ja', 'ko', 'zh-CN', 'zh-TW', 'hi', 'th', 'id', 'he', 'ar', 'ar-EG', 'fa', 'hu', 'cs', 'fi', 'da', 'nb', 'uk']

describe('createDateFormat', () => {
  it('reuses the formatter of a language it has already built', () => {
    expect(createDateFormat('pt-BR')).toBe(createDateFormat('pt-BR'))
    expect(createDateFormat('pt-BR')).not.toBe(createDateFormat('en'))
  })

  it('writes the date of the field in the order and with the separators of the language', () => {
    expect(createDateFormat('pt-BR').format(date(2026, 10, 28))).toBe('28/10/2026')
    expect(createDateFormat('en').format(date(2026, 10, 28))).toBe('10/28/2026')
    expect(createDateFormat('en-GB').format(date(2026, 10, 8))).toBe('08/10/2026')
    expect(createDateFormat('de').format(date(2026, 10, 8))).toBe('08.10.2026')
    expect(createDateFormat('ja').format(date(2026, 10, 8))).toBe('2026/10/08')
  })

  it('knows the order of the day, the month and the year', () => {
    expect(createDateFormat('pt-BR').order).toEqual(['day', 'month', 'year'])
    expect(createDateFormat('en').order).toEqual(['month', 'day', 'year'])
    expect(createDateFormat('ja').order).toEqual(['year', 'month', 'day'])
  })

  it('names the month, the weekdays, the day and the whole date in the language', () => {
    const portuguese = createDateFormat('pt-BR')
    const english = createDateFormat('en')

    expect(portuguese.monthLabel(date(2026, 10, 28))).toBe('outubro de 2026')
    expect(english.monthLabel(date(2026, 10, 28))).toBe('October 2026')
    expect(english.weekdayName(0, 'long')).toBe('Sunday')
    expect(english.weekdayName(6, 'long')).toBe('Saturday')
    expect(english.weekdayName(1, 'short')).toBe('Mon')
    expect(english.weekdayName(3, 'narrow')).toBe('W')
    expect(portuguese.weekdayName(0, 'long')).toBe('domingo')
    expect(portuguese.dayLabel(date(2026, 10, 8))).toBe('8')
    expect(english.fullDate(date(2026, 10, 28))).toBe('Wednesday, October 28, 2026')
    expect(portuguese.fullDate(date(2026, 10, 28))).toBe('quarta-feira, 28 de outubro de 2026')
  })

  it('writes the days of the Gregorian calendar even where the language uses another one by default', () => {
    expect(createDateFormat('th').format(date(2026, 10, 28))).toBe('28/10/2026')
    expect(createDateFormat('th').monthLabel(date(2026, 10, 28))).toMatch(/2026/)
    expect(createDateFormat('fa').format(date(2026, 10, 28))).toMatch(/2026|۲۰۲۶/)
    expect(createDateFormat('ar-SA').monthLabel(date(2026, 10, 28))).toMatch(/2026|٢٠٢٦/)
  })

  it('does not move the day with the zone of the machine, for the first and the last day of the year', () => {
    expect(createDateFormat('en').fullDate(date(2026, 1, 1))).toBe('Thursday, January 1, 2026')
    expect(createDateFormat('en').fullDate(date(2026, 12, 31))).toBe('Thursday, December 31, 2026')
  })

  it('writes years below 1000 with four digits in the field, so that what it writes can be read back', () => {
    expect(createDateFormat('en').format(date(99, 5, 1))).toBe('05/01/0099')
    expect(createDateFormat('pt-BR').format(date(1, 1, 1))).toBe('01/01/0001')
    expect(createDateFormat('ar-EG').format(date(99, 5, 1))).toContain('٠٠٩٩')
    expect(createDateFormat('en').monthLabel(date(99, 5, 1))).toMatch(/99/)
  })

  it('falls back to English for a language tag that does not exist', () => {
    expect(createDateFormat('not a locale').format(date(2026, 10, 28))).toBe('10/28/2026')
  })

  it('falls back to English for a language that the platform does not know, and for a tag that is not valid', () => {
    for (const tag of ['xx', 'tlh', 'zz-ZZ', 'und', 'en_US', 'a', '']) {
      const format = createDateFormat(tag)

      expect(format.format(date(2026, 10, 28)), tag).toBe('10/28/2026')
      expect(format.monthLabel(date(2026, 10, 28)), tag).toBe('October 2026')
      expect(format.parse('10/28/2026'), tag).toEqual(date(2026, 10, 28))
    }
  })

  it('keeps the language of a tag with a region that the platform does not know', () => {
    expect(createDateFormat('pt-XX').format(date(2026, 10, 28))).toBe('28/10/2026')
    expect(createDateFormat('en-XX').format(date(2026, 10, 28))).toBe('10/28/2026')
    expect(createDateFormat('de-XX').monthLabel(date(2026, 10, 28))).toBe('Oktober 2026')
  })
})

describe('parse', () => {
  it('reads what format writes, for every language and a spread of days', () => {
    const days = [date(2026, 10, 28), date(2026, 1, 1), date(2026, 12, 31), date(2024, 2, 29), date(2000, 2, 29), date(1999, 12, 9), date(2026, 3, 4), date(1, 1, 1), date(9999, 12, 31)]
    const wrong: string[] = []

    for (const locale of locales) {
      const formatter = createDateFormat(locale)

      for (const day of days) {
        const written = formatter.format(day)

        if (JSON.stringify(formatter.parse(written)) !== JSON.stringify(day)) wrong.push(`${locale}: ${written}`)
      }
    }

    expect(wrong).toEqual([])
  })

  it('follows the order of the language and takes the separators it is given', () => {
    const portuguese = createDateFormat('pt-BR')

    expect(portuguese.parse('28/10/2026')).toEqual(date(2026, 10, 28))
    expect(portuguese.parse('28.10.2026')).toEqual(date(2026, 10, 28))
    expect(portuguese.parse('28-10-2026')).toEqual(date(2026, 10, 28))
    expect(portuguese.parse('28 10 2026')).toEqual(date(2026, 10, 28))
    expect(portuguese.parse('1/2/2026')).toEqual(date(2026, 2, 1))
    expect(createDateFormat('en').parse('10/28/2026')).toEqual(date(2026, 10, 28))
    expect(createDateFormat('en').parse('2/1/2026')).toEqual(date(2026, 2, 1))
    expect(createDateFormat('ja').parse('2026/10/28')).toEqual(date(2026, 10, 28))
  })

  it('reads a date that starts with a four-digit year the way ISO writes it, whatever the language', () => {
    expect(createDateFormat('pt-BR').parse('2026-10-28')).toEqual(date(2026, 10, 28))
    expect(createDateFormat('en').parse('2026-1-2')).toEqual(date(2026, 1, 2))
    expect(createDateFormat('de').parse('2026/10/28')).toEqual(date(2026, 10, 28))
  })

  it('reads eight digits without separators in the order of the language', () => {
    expect(createDateFormat('pt-BR').parse('28102026')).toEqual(date(2026, 10, 28))
    expect(createDateFormat('en').parse('10282026')).toEqual(date(2026, 10, 28))
    expect(createDateFormat('ja').parse('20261028')).toEqual(date(2026, 10, 28))
  })

  it('ignores the spaces around it and the direction marks that some languages put in', () => {
    expect(createDateFormat('pt-BR').parse('  28/10/2026  ')).toEqual(date(2026, 10, 28))
    expect(createDateFormat('he').parse('‏28.10.2026')).toEqual(date(2026, 10, 28))
  })

  it('reads the digits of other writing systems', () => {
    expect(createDateFormat('ar-EG').parse('٢٨/١٠/٢٠٢٦')).toEqual(date(2026, 10, 28))
    expect(createDateFormat('fa').parse('۲۰۲۶/۱۰/۲۸')).toEqual(date(2026, 10, 28))
    expect(createDateFormat('hi').parse('२८/१०/२०२६')).toEqual(date(2026, 10, 28))
    expect(createDateFormat('pt-BR').parse('２８/１０/２０２６')).toEqual(date(2026, 10, 28))
  })

  it('refuses what is not a day: wrong order, days that do not exist, short years, missing parts and words', () => {
    const portuguese = createDateFormat('pt-BR')

    for (const text of ['', '28/10', '28/10/26', '10/28/2026', '31/04/2026', '29/02/2026', '00/10/2026', '28/00/2026', '28/13/2026', '28/10/20260', '28/10/2026/1', 'abc', '28 de outubro de 2026', '2810202', '281020261', '2026-13-01', '0000-01-01']) expect(portuguese.parse(text), text).toBeNull()
  })

  it('keeps the leap day only in leap years', () => {
    expect(createDateFormat('pt-BR').parse('29/02/2024')).toEqual(date(2024, 2, 29))
    expect(createDateFormat('pt-BR').parse('29/02/2023')).toBeNull()
    expect(createDateFormat('pt-BR').parse('29/02/1900')).toBeNull()
    expect(createDateFormat('pt-BR').parse('29/02/2000')).toEqual(date(2000, 2, 29))
  })
})
