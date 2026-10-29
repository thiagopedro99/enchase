import { describe, expect, it, vi } from 'vitest'

import { resolveLocale } from '@utils/resolveLocale.ts'

describe('resolveLocale', () => {
  it.each([
    ['en', 'en'],
    ['en-GB', 'en-GB'],
    ['EN-gb', 'en-GB'],
    ['pt-BR', 'pt-BR'],
    ['zh-Hant-TW', 'zh-Hant-TW'],
    ['en-u-ca-buddhist', 'en-u-ca-buddhist']
  ])('keeps the tag %s, written the way the platform writes it', (tag, expected) => {
    expect(resolveLocale(tag, Intl.DateTimeFormat)).toBe(expected)
    expect(resolveLocale(tag, Intl.NumberFormat)).toBe(expected)
  })

  it.each(['xx', 'tlh', 'zz-ZZ', 'und'])('falls back to English for the language %s, which the platform does not know', (tag) => {
    expect(resolveLocale(tag, Intl.DateTimeFormat)).toBe('en')
    expect(resolveLocale(tag, Intl.NumberFormat)).toBe('en')
  })

  it.each(['en-XX', 'pt-XX', 'es-XX'])('keeps %s, a known language with a region that the platform does not know', (tag) => {
    expect(resolveLocale(tag, Intl.DateTimeFormat)).toBe(tag)
    expect(resolveLocale(tag, Intl.NumberFormat)).toBe(tag)
  })

  it.each(['en_US', '', 'a', 'not a locale', 'en-', '-en'])('falls back to English for the tag %j, which is not valid', (tag) => {
    expect(resolveLocale(tag, Intl.DateTimeFormat)).toBe('en')
    expect(resolveLocale(tag, Intl.NumberFormat)).toBe('en')
  })

  it('asks the constructor with the lookup matcher, which every engine answers the same way', () => {
    const supportedLocalesOf = vi.fn(() => ['en-GB'])

    expect(resolveLocale('en-gb', { supportedLocalesOf })).toBe('en-GB')
    expect(supportedLocalesOf).toHaveBeenCalledTimes(1)
    expect(supportedLocalesOf).toHaveBeenCalledWith('en-GB', { localeMatcher: 'lookup' })
  })

  it('falls back to English when the constructor supports nothing for the tag', () => {
    expect(resolveLocale('en-GB', { supportedLocalesOf: () => [] })).toBe('en')
  })

  it('asks the constructor it is given, because a platform can know a tag for dates and not for numbers', () => {
    const dates = { supportedLocalesOf: () => ['pt-BR'] }
    const numbers = { supportedLocalesOf: () => [] }

    expect(resolveLocale('pt-BR', dates)).toBe('pt-BR')
    expect(resolveLocale('pt-BR', numbers)).toBe('en')
  })

  it('does not hide an error that is not a RangeError', () => {
    const broken = {
      supportedLocalesOf: () => {
        throw new TypeError('not this one')
      }
    }

    expect(() => resolveLocale('en-GB', broken)).toThrow(TypeError)
  })
})
