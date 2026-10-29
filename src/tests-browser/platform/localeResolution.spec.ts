import { describe, expect, it } from 'vitest'

import { createNumberFormat } from '@utils/numberFormat.ts'
import { createDateFormat } from '@utils/dateFormat.ts'
import { firstDayOfWeek } from '@utils/firstDayOfWeek.ts'
import { resolveLocale } from '@utils/resolveLocale.ts'

const day = { year: 2026, month: 10, day: 28 }

const english = ['10/28/2026', 0, '1,234.5'] as const

const tags: [string, string, readonly [string, number, string]][] = [
  ['xx', 'en', english],
  ['tlh', 'en', english],
  ['zz-ZZ', 'en', english],
  ['und', 'en', english],
  ['en_US', 'en', english],
  ['not a locale', 'en', english],
  ['', 'en', english],
  ['en-XX', 'en-XX', ['10/28/2026', 1, '1,234.5']],
  ['pt-XX', 'pt-XX', ['28/10/2026', 1, '1.234,5']],
  ['en', 'en', english],
  ['en-GB', 'en-GB', ['28/10/2026', 1, '1,234.5']],
  ['EN-gb', 'en-GB', ['28/10/2026', 1, '1,234.5']],
  ['en-CA', 'en-CA', ['2026-10-28', 0, '1,234.5']],
  ['pt-BR', 'pt-BR', ['28/10/2026', 0, '1.234,5']],
  ['de', 'de', ['28.10.2026', 1, '1.234,5']],
  ['ja', 'ja', ['2026/10/28', 0, '1,234.5']]
]

describe('the resolution of a language tag in a real browser', () => {
  it.each(tags)('resolves %j to %j in the engine, the same answer as in Node', (tag, resolved) => {
    expect(resolveLocale(tag, Intl.DateTimeFormat)).toBe(resolved)
    expect(resolveLocale(tag, Intl.NumberFormat)).toBe(resolved)
  })

  it.each(tags)('writes a date, starts the week and writes a number for %j as the table says', (tag, _resolved, [text, week, number]) => {
    expect(createDateFormat(tag).format(day)).toBe(text)
    expect(firstDayOfWeek(tag)).toBe(week)
    expect(createNumberFormat(tag).format(1234.5)).toBe(number)
  })

  it('reads back in the engine what it wrote for a language it does not know', () => {
    expect(createDateFormat('xx').parse(createDateFormat('xx').format(day))).toEqual(day)
    expect(createNumberFormat('xx').parse(createNumberFormat('xx').format(1234.5))).toBe(1234.5)
  })

  it('names the month in the language of the tag when the region is unknown, and in English when the language is', () => {
    expect(createDateFormat('de-XX').monthLabel(day)).toBe('Oktober 2026')
    expect(createDateFormat('xx').monthLabel(day)).toBe('October 2026')
  })
})
