import { afterEach, describe, expect, it, vi } from 'vitest'

import { firstDayByRegion, firstDayOfWeek } from '@utils/firstDayOfWeek.ts'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('firstDayByRegion', () => {
  it('starts the week on Sunday where the calendar of the region does', () => {
    expect(['US', 'CA', 'BR', 'PT', 'JP', 'MX', 'IN', 'ZA'].map(firstDayByRegion)).toEqual([0, 0, 0, 0, 0, 0, 0, 0])
  })

  it('starts the week on Saturday in the regions that do, and on Friday in the Maldives', () => {
    expect(['EG', 'IR', 'AF', 'SA'].map(firstDayByRegion)).toEqual([6, 6, 6, 0])
    expect(firstDayByRegion('MV')).toBe(5)
  })

  it('starts the week on Monday everywhere else, and when there is no region', () => {
    expect(['GB', 'DE', 'FR', 'AU', 'AE', 'RU', 'CN'].map(firstDayByRegion)).toEqual([1, 1, 1, 1, 1, 1, 1])
    expect(firstDayByRegion(undefined)).toBe(1)
  })
})

describe('firstDayOfWeek', () => {
  it.each([
    ['en', 0],
    ['en-US', 0],
    ['en-GB', 1],
    ['pt-BR', 0],
    ['pt', 0],
    ['pt-PT', 0],
    ['de', 1],
    ['fr-FR', 1],
    ['es-ES', 1],
    ['ja', 0],
    ['ar-EG', 6],
    ['fa-IR', 6],
    ['he', 0],
    ['ru', 1]
  ])('starts the week of %s on day %i', (locale, expected) => {
    expect(firstDayOfWeek(locale)).toBe(expected)
  })

  it('falls back to English for a language tag that does not exist', () => {
    expect(firstDayOfWeek('not a locale')).toBe(0)
    expect(firstDayOfWeek('')).toBe(0)
  })

  it('starts the week as English does for a language that the platform does not know, and for a tag that is not valid', () => {
    expect(['xx', 'tlh', 'zz-ZZ', 'und', 'en_US', 'a', 'not a locale', ''].map(firstDayOfWeek)).toEqual([0, 0, 0, 0, 0, 0, 0, 0])
  })

  it('keeps the week that the platform gives to a known language with a region that it does not know', () => {
    expect(['en-XX', 'pt-XX', 'es-XX'].map(firstDayOfWeek)).toEqual([1, 1, 1])
  })

  it('reads the table of regions when the platform has no week information', () => {
    const original = Object.getOwnPropertyDescriptor(Intl.Locale.prototype, 'weekInfo')

    Object.defineProperty(Intl.Locale.prototype, 'weekInfo', { configurable: true, get: () => undefined })
    Object.defineProperty(Intl.Locale.prototype, 'getWeekInfo', { configurable: true, value: undefined })

    try {
      expect(['pt-BR', 'en-GB', 'ar-EG', 'de', 'en', 'en-MV'].map(firstDayOfWeek)).toEqual([0, 1, 6, 1, 0, 5])
    } finally {
      if (original) Object.defineProperty(Intl.Locale.prototype, 'weekInfo', original)
      else Reflect.deleteProperty(Intl.Locale.prototype, 'weekInfo')

      Reflect.deleteProperty(Intl.Locale.prototype, 'getWeekInfo')
    }
  })

  it('prefers getWeekInfo when the platform has it, and counts Sunday as 7 the way Intl does', () => {
    Object.defineProperty(Intl.Locale.prototype, 'getWeekInfo', { configurable: true, value: () => ({ firstDay: 7 }) })

    try {
      expect(firstDayOfWeek('de')).toBe(0)
    } finally {
      Reflect.deleteProperty(Intl.Locale.prototype, 'getWeekInfo')
    }
  })
})
