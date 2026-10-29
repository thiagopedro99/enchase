import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createNumberFormat } from '@utils/numberFormat.ts'
import { createDateFormat } from '@utils/dateFormat.ts'
import { firstDayOfWeek } from '@utils/firstDayOfWeek.ts'
import { resolveLocale } from '@utils/resolveLocale.ts'

vi.mock('@utils/resolveLocale.ts', () => ({ resolveLocale: vi.fn() }))

const resolve = vi.mocked(resolveLocale)

beforeEach(() => {
  resolve.mockReset()
})

describe('the utilities that call Intl', () => {
  it('write the date with the tag that resolveLocale gives for the date formatter, asking once', () => {
    resolve.mockReturnValue('de')

    const format = createDateFormat('wired-date')

    expect(format.format({ year: 2026, month: 10, day: 28 })).toBe('28.10.2026')
    expect(format.monthLabel({ year: 2026, month: 10, day: 28 })).toBe('Oktober 2026')
    expect(resolve).toHaveBeenCalledTimes(1)
    expect(resolve).toHaveBeenCalledWith('wired-date', Intl.DateTimeFormat)
  })

  it('start the week with the tag that resolveLocale gives for the date formatter, asking once', () => {
    resolve.mockReturnValue('en-GB')

    expect(firstDayOfWeek('wired-week')).toBe(1)
    expect(resolve).toHaveBeenCalledTimes(1)
    expect(resolve).toHaveBeenCalledWith('wired-week', Intl.DateTimeFormat)
  })

  it('write the number with the tag that resolveLocale gives for the number formatter, asking once', () => {
    resolve.mockReturnValue('de')

    const numbers = createNumberFormat('wired-number')

    expect(numbers.format(1234.5)).toBe('1.234,5')
    expect(numbers.decimal).toBe(',')
    expect(resolve).toHaveBeenCalledTimes(1)
    expect(resolve).toHaveBeenCalledWith('wired-number', Intl.NumberFormat)
  })
})
