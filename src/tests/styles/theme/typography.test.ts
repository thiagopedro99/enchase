import { describe, expect, it } from 'vitest'

import { assertValidLetterSpacing, assertValidLineHeight, isValidLetterSpacing, isValidLineHeight } from '@styles/theme/typography.ts'
import { baseTokens } from '@styles/tokens/index.ts'

describe('isValidLineHeight', () => {
  it.each([1, 1.25, 1.5, 2, 4])('accepts %s', (value) => {
    expect(isValidLineHeight(value)).toBe(true)
  })

  it.each([0, 0.99, 4.01, -1.5, Number.NaN, Number.POSITIVE_INFINITY, '1.5', '1.5rem', null, undefined, {}])('rejects %j', (value) => {
    expect(isValidLineHeight(value)).toBe(false)
  })

  it('accepts the line heights of the built-in theme', () => {
    for (const [name, value] of Object.entries(baseTokens.fonts.lineHeights)) {
      expect(isValidLineHeight(value), `${name}: ${value}`).toBe(true)
    }
  })
})

describe('isValidLetterSpacing', () => {
  it.each(['0', '0em', '-0.01em', '0.02em', '.05em', '2em', '-2em', '0.125rem', '1px', '-32px', '32px'])('accepts %s', (value) => {
    expect(isValidLetterSpacing(value)).toBe(true)
  })

  it.each(['', ' ', '1', '1ch', '1%', '2.1em', '-2.1rem', '33px', 'normal', 'calc(1px)', 'var(--x)', '1px; color: red', '1px /* x */', '0.0.1em', 0, null, undefined])('rejects %j', (value) => {
    expect(isValidLetterSpacing(value)).toBe(false)
  })

  it('accepts the letter spacings of the built-in theme', () => {
    for (const [name, value] of Object.entries(baseTokens.fonts.letterSpacings)) {
      expect(isValidLetterSpacing(value), `${name}: ${value}`).toBe(true)
    }
  })
})

describe('assertValidLineHeight', () => {
  it('returns a valid line height untouched', () => {
    expect(assertValidLineHeight('fonts.lineHeights.normal', 1.6)).toBe(1.6)
  })

  it('names the token and shows the value in the error', () => {
    expect(() => assertValidLineHeight('fonts.lineHeights.normal', '1.6')).toThrow('Invalid line height for "fonts.lineHeights.normal": "1.6"')
  })
})

describe('assertValidLetterSpacing', () => {
  it('returns a valid letter spacing untouched', () => {
    expect(assertValidLetterSpacing('fonts.letterSpacings.control', '0.02em')).toBe('0.02em')
  })

  it('names the token and shows the value in the error', () => {
    expect(() => assertValidLetterSpacing('fonts.letterSpacings.control', '1ch')).toThrow('Invalid letter spacing for "fonts.letterSpacings.control": "1ch"')
  })
})
