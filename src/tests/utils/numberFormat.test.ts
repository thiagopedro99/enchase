import { describe, expect, it } from 'vitest'

import { createNumberFormat } from '@utils/numberFormat.ts'

import type { NumberFormatOptions } from '@utils/numberFormat.ts'

const locales = ['en', 'en-US', 'pt-BR', 'pt-PT', 'de-DE', 'de-CH', 'fr-FR', 'es-ES', 'ja-JP', 'hi-IN', 'ar-EG', 'sv-SE', 'ru-RU']

const optionSets: NumberFormatOptions[] = [
  {},
  { useGrouping: false },
  { maximumFractionDigits: 0 },
  { minimumFractionDigits: 2, maximumFractionDigits: 2 },
  { style: 'percent', maximumFractionDigits: 2 },
  { style: 'currency', currency: 'BRL' },
  { style: 'currency', currency: 'USD', currencyDisplay: 'code' },
  { style: 'currency', currency: 'EUR', currencyDisplay: 'narrowSymbol' }
]

const values = [0, 1, -1, 0.5, -0.5, 12.345, 1234.5, -1234.5, 99999.99, 1234567.891, 0.004, -0.004, 1000, 100]

describe('createNumberFormat in English', () => {
  const english = createNumberFormat('en')

  it('formats with the grouping and the decimal separator of the locale', () => {
    expect(english.format(1234.5)).toBe('1,234.5')
    expect(english.format(-1234.5678)).toBe('-1,234.568')
    expect(english.decimal).toBe('.')
    expect(english.group).toBe(',')
    expect(english.fractionDigits).toBe(3)
  })

  it('parses what it formats and what a person types', () => {
    expect(english.parse('1,234.5')).toBe(1234.5)
    expect(english.parse('1234.5')).toBe(1234.5)
    expect(english.parse('-1,234.5')).toBe(-1234.5)
    expect(english.parse('1.')).toBe(1)
    expect(english.parse('.5')).toBe(0.5)
    expect(english.parse(' 12 ')).toBe(12)
  })

  it('returns NaN for what is not a number', () => {
    for (const text of ['', ' ', 'abc', '-', '.', '1.2.3', '--5', '1-', '12abc', '1e3', 'R$ 5', '5 %', '+']) expect(english.parse(text), text).toBeNaN()
  })

  it('accepts a comma as a decimal mark only where it cannot be a thousands mark', () => {
    expect(english.parse('1,5')).toBe(1.5)
    expect(english.parse('1,50')).toBe(1.5)
    expect(english.parse('1,2345')).toBe(1.2345)
    expect(english.parse('1,234')).toBe(1234)
    expect(english.parse('1,234,567')).toBe(1234567)
    expect(english.parse('1.234,50')).toBeNaN()
  })

  it('tells which texts can still become a number', () => {
    for (const text of ['', '-', '.', '1.', '12', '-1,234.5', ' 1 ']) expect(english.isPartial(text), text).toBe(true)
    for (const text of ['a', '1a', '--', '1.2.', 'R$', '1-2', '+1']) expect(english.isPartial(text), text).toBe(false)
  })
})

describe('createNumberFormat in Brazilian Portuguese', () => {
  const portuguese = createNumberFormat('pt-BR')

  it('uses a comma for decimals and a dot for thousands', () => {
    expect(portuguese.format(1234.5)).toBe('1.234,5')
    expect(portuguese.parse('1.234,5')).toBe(1234.5)
    expect(portuguese.parse('1234,5')).toBe(1234.5)
    expect(portuguese.parse(',5')).toBe(0.5)
    expect(portuguese.decimal).toBe(',')
    expect(portuguese.group).toBe('.')
  })

  it('reads a dot as a decimal mark when it cannot be a thousands mark and as a thousands mark when it can', () => {
    expect(portuguese.parse('1.5')).toBe(1.5)
    expect(portuguese.parse('1.50')).toBe(1.5)
    expect(portuguese.parse('12.34')).toBe(12.34)
    expect(portuguese.parse('1.2345')).toBe(1.2345)
    expect(portuguese.parse('-1.5')).toBe(-1.5)
    expect(portuguese.parse('1.234')).toBe(1234)
    expect(portuguese.parse('1.000.000')).toBe(1000000)
    expect(portuguese.parse('12.345,6')).toBe(12345.6)
  })

  it('refuses a text that mixes the two marks the wrong way', () => {
    for (const text of ['1,234.50', '1.5.5', '1.000,5.5', '1,5,5']) expect(portuguese.parse(text), text).toBeNaN()
  })

  it('formats and parses a currency with its symbol and without it', () => {
    const real = createNumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

    expect(real.format(1234.5)).toBe('R$ 1.234,50')
    expect(real.format(-7.456)).toBe('-R$ 7,46')
    expect(real.fractionDigits).toBe(2)

    for (const text of ['R$ 1.234,50', 'R$ 1.234,50', 'R$1.234,50', '1234,5', '1.234,5']) expect(real.parse(text), text).toBe(1234.5)

    expect(real.parse('R$ 1.5')).toBe(1.5)
    expect(real.parse('$ 5')).toBeNaN()
    expect(real.isPartial('R$')).toBe(true)
    expect(real.isPartial('R')).toBe(false)
  })

  it('keeps the currency symbol of another currency and the code display', () => {
    expect(createNumberFormat('pt-BR', { style: 'currency', currency: 'USD' }).parse('US$ 1.234,50')).toBe(1234.5)

    const code = createNumberFormat('pt-BR', { style: 'currency', currency: 'BRL', currencyDisplay: 'code' })

    expect(code.parse('BRL 1.234,50')).toBe(1234.5)
    expect(code.parse('1.234,50 BRL')).toBe(1234.5)
  })

  it('stores a percentage as a fraction without floating point noise', () => {
    const percent = createNumberFormat('en', { style: 'percent', maximumFractionDigits: 1 })

    expect(percent.format(0.125)).toBe('12.5%')
    expect(percent.parse('12.5%')).toBe(0.125)
    expect(percent.parse('7')).toBe(0.07)
    expect(percent.parse('1.1')).toBe(0.011)
    expect(percent.parse('-1.1%')).toBe(-0.011)
    expect(percent.normalize(0.1234)).toBe(0.123)
  })

  it('does not accept a decimal mark when no fraction digit is allowed', () => {
    const integers = createNumberFormat('pt-BR', { maximumFractionDigits: 0 })

    expect(integers.isPartial('12,')).toBe(false)
    expect(integers.isPartial('12')).toBe(true)
    expect(integers.normalize(12.6)).toBe(13)
  })
})

describe('createNumberFormat in other writing systems', () => {
  it('reads the digits, the marks and the minus of Arabic', () => {
    const arabic = createNumberFormat('ar-EG-u-nu-arab')

    expect(arabic.parse(arabic.format(-123.5))).toBe(-123.5)
    expect(arabic.parse('١٢٣٫٥')).toBe(123.5)
    expect(arabic.parse('123.5')).toBe(123.5)
    expect(arabic.parse(arabic.format(1234567))).toBe(1234567)
  })

  it('reads the Indian grouping and the narrow no-break space of French', () => {
    expect(createNumberFormat('hi-IN').parse('12,34,567.5')).toBe(1234567.5)
    expect(createNumberFormat('fr-FR').parse('1 234 567,891')).toBe(1234567.891)
    expect(createNumberFormat('fr-FR').parse('1 234 567,891')).toBe(1234567.891)
  })

  it('reads the typographic minus of Swedish', () => {
    const swedish = createNumberFormat('sv-SE')

    expect(swedish.parse('−1 234,5')).toBe(-1234.5)
    expect(swedish.parse('-1234,5')).toBe(-1234.5)
  })

  it('reads a thousands mark where the locale does not even write one', () => {
    expect(createNumberFormat('es-ES').parse('1.234')).toBe(1234)
  })
})

describe('createNumberFormat round trip', () => {
  for (const locale of locales) {
    for (const options of optionSets) {
      it(`reads back what it writes in ${locale} with ${JSON.stringify(options)}`, () => {
        const numbers = createNumberFormat(locale, options)
        const scale = options.style === 'percent' ? 0.01 : 1

        for (const value of values) {
          const written = numbers.format(value)
          const normalized = numbers.normalize(value)

          expect(numbers.parse(written), `${value} written as ${written}`).toBe(normalized)
          expect(numbers.isPartial(written), `${written} is partial`).toBe(true)
          expect(numbers.normalize(normalized), `${normalized} stays`).toBe(normalized)
          expect(numbers.format(normalized)).toBe(normalized === 0 ? numbers.format(0) : written)
          expect(Math.abs(normalized - value), `${value} to ${normalized}`).toBeLessThanOrEqual(0.5 * scale * 10 ** -Math.min(numbers.fractionDigits, 3) + 1e-9)
          expect(Object.is(normalized, -0)).toBe(false)
        }
      })
    }
  }
})

describe('createNumberFormat edge cases', () => {
  it('turns a negative zero into zero', () => {
    const numbers = createNumberFormat('en', { maximumFractionDigits: 1 })

    expect(Object.is(numbers.normalize(-0.01), 0)).toBe(true)
    expect(Object.is(numbers.normalize(-0), 0)).toBe(true)
  })

  it('falls back to English for a language tag that is not valid', () => {
    expect(createNumberFormat('pt_BR').format(1234.5)).toBe('1,234.5')
    expect(createNumberFormat('').format(1234.5)).toBe('1,234.5')
  })

  it('falls back to English for a language that the platform does not know', () => {
    for (const tag of ['xx', 'tlh', 'zz-ZZ', 'und']) {
      const numbers = createNumberFormat(tag)

      expect(numbers.format(1234.5), tag).toBe('1,234.5')
      expect(numbers.parse('1,234.5'), tag).toBe(1234.5)
    }
  })

  it('keeps the language of a tag with a region that the platform does not know', () => {
    expect(createNumberFormat('pt-XX').format(1234.5)).toBe('1.234,5')
    expect(createNumberFormat('de-XX').format(1234.5)).toBe('1.234,5')
    expect(createNumberFormat('en-XX').format(1234.5)).toBe('1,234.5')
  })

  it('still throws for options that are wrong, instead of hiding the mistake', () => {
    expect(() => createNumberFormat('en', { style: 'currency', currency: 'XX' })).toThrow(RangeError)
    expect(() => createNumberFormat('en', { style: 'currency' })).toThrow(TypeError)
  })

  it('returns NaN for a number too large to be a number', () => {
    expect(createNumberFormat('en').parse('9'.repeat(400))).toBeNaN()
  })

  it('removes the marks that right-to-left text puts around a number', () => {
    expect(createNumberFormat('en').parse('‎12‏')).toBe(12)
  })
})

describe('createNumberFormat precision', () => {
  it('keeps as many fraction digits as the precision asks for when none were chosen', () => {
    const numbers = createNumberFormat('en', {}, 5)

    expect(numbers.fractionDigits).toBe(5)
    expect(numbers.format(0.12345)).toBe('0.12345')
    expect(numbers.normalize(0.123456)).toBe(0.12346)
  })

  it('never lowers the digits of the style or the ones that were chosen', () => {
    expect(createNumberFormat('en', {}, 1).fractionDigits).toBe(3)
    expect(createNumberFormat('en', { style: 'currency', currency: 'USD' }, 1).fractionDigits).toBe(2)
    expect(createNumberFormat('en', { maximumFractionDigits: 1 }, 4).fractionDigits).toBe(1)
    expect(createNumberFormat('en', { style: 'percent' }, 1).fractionDigits).toBe(1)
  })

  it('keeps a minimum number of digits that is above the style default', () => {
    const numbers = createNumberFormat('en', { minimumFractionDigits: 4 })

    expect(numbers.fractionDigits).toBe(4)
    expect(numbers.format(1.5)).toBe('1.5000')
  })
})

describe('createNumberFormat negative numbers', () => {
  it('can refuse a minus sign while keeping everything else as it was', () => {
    const numbers = createNumberFormat('en')

    expect(numbers.isPartial('-1', true)).toBe(true)
    expect(numbers.isPartial('-1')).toBe(true)
    expect(numbers.isPartial('-1', false)).toBe(false)
    expect(numbers.isPartial('-', false)).toBe(false)
    expect(numbers.isPartial('1.5', false)).toBe(true)
    expect(numbers.isPartial('', false)).toBe(true)
  })
})
