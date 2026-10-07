import { describe, expect, it } from 'vitest'

import { assertValidColor, isValidColor } from '@styles/colorFormat.ts'
import { darkTheme, lightTheme } from '@styles/themes/index.ts'

const flatten = (tree: Record<string, unknown>, path: string[] = []): [string, string][] =>
  Object.entries(tree).flatMap(([key, value]) => (typeof value === 'string' ? [[[...path, key].join('.'), value] as [string, string]] : flatten(value as Record<string, unknown>, [...path, key])))

describe('isValidColor', () => {
  it.each([
    '#fff',
    '#FFFF',
    '#4F46E5',
    '#4f46e5',
    '#4F46E5CC',
    'transparent',
    'rgb(79, 70, 229)',
    'rgb(79 70 229)',
    'RGB(79, 70, 229)',
    'rgba(27, 27, 33, 0.38)',
    'rgb(79 70 229 / 0.5)',
    'rgb(10% 20% 30%)',
    'hsl(244 76% 59%)',
    'hsla(244, 76%, 59%, 0.5)',
    'hsl(244deg 76% 59% / 50%)',
    'oklch(0.55 0.2 270)',
    'oklch(55% 0.2 270deg / 0.4)',
    'oklab(0.5 0.1 -0.1)',
    'rgb(none 70 229)'
  ])('accepts %s', (value) => {
    expect(isValidColor(value)).toBe(true)
  })

  it.each([
    '',
    ' ',
    'red',
    'currentColor',
    '#12',
    '#12345',
    '#1234567',
    '#GGGGGG',
    '4F46E5',
    'rgb(1, 2)',
    'rgb(1, 2, 3, 4, 5)',
    'rgb(a, b, c)',
    'rgb(1, 2, 3',
    'rgb(1, 2, 3))',
    'rgb(1, 2, calc(3))',
    'rgb()',
    'var(--x)',
    'url(https://example.com/x.png)',
    'url(javascript:alert(1))',
    'expression(alert(1))'
  ])('rejects %j', (value) => {
    expect(isValidColor(value)).toBe(false)
  })

  it.each([
    '#fff; background: url(x)',
    'rgb(1, 2, 3); color: red',
    'red} body{display:none',
    'rgb(1, 2, 3)}',
    'rgb(1, 2, 3)/**/',
    'rgb(1, 2, 3)\n}',
    '#fff</style><script>alert(1)</script>',
    "rgb(1, 2, 3)'; --x: '",
    'rgb(1, 2, 3)\\',
    '#fff !important'
  ])('rejects the injection attempt %j', (value) => {
    expect(isValidColor(value)).toBe(false)
  })

  it('rejects values that are not strings', () => {
    expect(isValidColor(123)).toBe(false)
    expect(isValidColor(null)).toBe(false)
    expect(isValidColor(undefined)).toBe(false)
    expect(isValidColor({ toString: () => '#fff' })).toBe(false)
  })

  it('rejects a value that is too long', () => {
    expect(isValidColor(`rgb(${'1'.repeat(200)}, 2, 3)`)).toBe(false)
  })

  it('accepts every color of the built-in themes', () => {
    for (const theme of [lightTheme, darkTheme]) {
      for (const [name, value] of flatten(theme.colors)) {
        expect(isValidColor(value), `${name}: ${value}`).toBe(true)
      }
    }
  })
})

describe('assertValidColor', () => {
  it('returns a valid color untouched', () => {
    expect(assertValidColor('primary', '#0B6BCB')).toBe('#0B6BCB')
  })

  it('names the token and shows the value in the error', () => {
    expect(() => assertValidColor('primary', 'red; display: none')).toThrow('Invalid color for "primary": "red; display: none"')
  })

  it('shows a non string value in the error without breaking', () => {
    expect(() => assertValidColor('primary', undefined)).toThrow('Invalid color for "primary"')
  })
})
