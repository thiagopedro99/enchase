import { describe, expect, it } from 'vitest'

import { assertValidFontFamily, assertValidFontSize, assertValidFontWeight, isValidFontFamily, isValidFontSize, isValidFontWeight } from '@styles/fontFormat.ts'
import { baseTokens } from '@styles/themes/index.ts'

describe('isValidFontFamily', () => {
  it.each([
    'Arial',
    'sans-serif',
    'system-ui',
    '-apple-system',
    'Times New Roman',
    "'Inter'",
    '"Open Sans"',
    "'Inter', sans-serif",
    "'Figtree Variable', 'Figtree', system-ui, -apple-system, 'Segoe UI', sans-serif",
    "ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace",
    "'Noto Sans JP', sans-serif"
  ])('accepts %s', (value) => {
    expect(isValidFontFamily(value)).toBe(true)
  })

  it.each(['', ' ', ',', 'Arial,', ',Arial', "'Inter", "Inter'", "'Inter\"", '123font', 'Arial  Black', "''"])('rejects %j', (value) => {
    expect(isValidFontFamily(value)).toBe(false)
  })

  it.each([
    'Arial; display: none',
    'Arial; } body { display: none',
    'Arial}',
    'Arial /* x */',
    'url(https://example.com/x.woff)',
    'var(--x)',
    'expression(alert(1))',
    "Arial'; --x: '",
    'Arial\\',
    'Arial !important',
    'Arial</style><script>alert(1)</script>',
    "'Inter\n', sans-serif",
    '@import "x"'
  ])('rejects the injection attempt %j', (value) => {
    expect(isValidFontFamily(value)).toBe(false)
  })

  it('rejects values that are not strings', () => {
    expect(isValidFontFamily(123)).toBe(false)
    expect(isValidFontFamily(null)).toBe(false)
    expect(isValidFontFamily(undefined)).toBe(false)
    expect(isValidFontFamily({ toString: () => 'Arial' })).toBe(false)
  })

  it('rejects a value that is too long or has too many families', () => {
    expect(isValidFontFamily(`'${'a'.repeat(200)}'`)).toBe(false)
    expect(isValidFontFamily(Array.from({ length: 9 }, (_, index) => `f${index}`).join(', '))).toBe(false)
    expect(isValidFontFamily(Array.from({ length: 8 }, (_, index) => `f${index}`).join(', '))).toBe(true)
  })

  it('accepts the families of the built-in theme', () => {
    expect(isValidFontFamily(baseTokens.fonts.primary)).toBe(true)
    expect(isValidFontFamily(baseTokens.fonts.mono)).toBe(true)
  })
})

describe('isValidFontSize', () => {
  it.each(['1rem', '0.75rem', '.5rem', '3.5rem', '14px', '1.25em', '100rem', '1600px'])('accepts %s', (value) => {
    expect(isValidFontSize(value)).toBe(true)
  })

  it.each(['', '0', '0rem', '-1rem', '1', '1pt', '1%', '1REM', ' 1rem', '1rem ', '1 rem', '1.rem', 'rem', 'large', '101rem', '1601px', 'NaNrem'])('rejects %j', (value) => {
    expect(isValidFontSize(value)).toBe(false)
  })

  it.each(['calc(1rem + 2px)', 'var(--size)', '1rem; color: red', '1rem}', '1rem !important', 'min(1rem, 2px)', 'url(x)'])('rejects the injection attempt %j', (value) => {
    expect(isValidFontSize(value)).toBe(false)
  })

  it('rejects values that are not strings', () => {
    expect(isValidFontSize(16)).toBe(false)
    expect(isValidFontSize(null)).toBe(false)
    expect(isValidFontSize(undefined)).toBe(false)
  })

  it('accepts the sizes of the built-in theme', () => {
    for (const [name, value] of Object.entries(baseTokens.fonts.sizes)) {
      expect(isValidFontSize(value), `${name}: ${value}`).toBe(true)
    }
  })
})

describe('isValidFontWeight', () => {
  it.each([1, 300, 400, 700, 1000])('accepts %s', (value) => {
    expect(isValidFontWeight(value)).toBe(true)
  })

  it.each([0, -1, 1001, 450.5, Number.NaN, Number.POSITIVE_INFINITY, '400', 'bold', null, undefined, {}])('rejects %j', (value) => {
    expect(isValidFontWeight(value)).toBe(false)
  })

  it('accepts the weights of the built-in theme', () => {
    for (const [name, value] of Object.entries(baseTokens.fonts.weights)) {
      expect(isValidFontWeight(value), `${name}: ${value}`).toBe(true)
    }
  })
})

describe('assertValidFontFamily', () => {
  it('returns a valid font family untouched', () => {
    expect(assertValidFontFamily('fonts.primary', "'Inter', sans-serif")).toBe("'Inter', sans-serif")
  })

  it('names the token and shows the value in the error', () => {
    expect(() => assertValidFontFamily('fonts.primary', 'Arial; display: none')).toThrow('Invalid font family for "fonts.primary": "Arial; display: none"')
  })

  it('shows a non string value in the error without breaking', () => {
    expect(() => assertValidFontFamily('fonts.mono', undefined)).toThrow('Invalid font family for "fonts.mono"')
  })
})

describe('assertValidFontSize', () => {
  it('returns a valid size untouched', () => {
    expect(assertValidFontSize('fonts.sizes.md', '1rem')).toBe('1rem')
  })

  it('names the token and shows the value in the error', () => {
    expect(() => assertValidFontSize('fonts.sizes.md', 'calc(1rem)')).toThrow('Invalid font size for "fonts.sizes.md": "calc(1rem)"')
  })
})

describe('assertValidFontWeight', () => {
  it('returns a valid weight untouched', () => {
    expect(assertValidFontWeight('fonts.weights.bold', 600)).toBe(600)
  })

  it('names the token and shows the value in the error', () => {
    expect(() => assertValidFontWeight('fonts.weights.bold', '600')).toThrow('Invalid font weight for "fonts.weights.bold": "600"')
  })
})
