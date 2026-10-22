import { describe, expect, it } from 'vitest'

import { assertSafeCssValue, isSafeCssValue } from '@styles/theme/cssValue.ts'

describe('isSafeCssValue', () => {
  it.each([
    '0',
    '500',
    '2px',
    '0.5rem',
    'none',
    'var(--enchase-control-height-md)',
    'var(--enchase-color-primary, #171717)',
    'calc(var(--enchase-control-height-md) + 2px)',
    'calc((100% - 2rem) / 3)',
    '0 1px 2px 0 rgb(0 0 0 / 0.05), 0 0 0 3px rgb(0 0 0 / 0.1)',
    'color-mix(in srgb, var(--enchase-color-primary) 25%, transparent)',
    'inset 0 0 0 1px var(--enchase-color-border)',
    '1px solid transparent',
    '"a;b"',
    "'a{b}'",
    '"it\'s"'
  ])('accepts %s', (value) => {
    expect(isSafeCssValue(value)).toBe(true)
  })

  it.each([
    '',
    ' ',
    '500; color: red',
    '500 }',
    '{ color: red',
    '500 {}',
    '<style>',
    '5px\\',
    'url(https://example.com/a.png)',
    'URL( "x" )',
    'image-set("a.png" 1x)',
    'image("a.png")',
    'expression(alert(1))',
    '@import "x"',
    'javascript:alert(1)',
    '1px /* x */',
    '/* x */ 1px',
    '1px */',
    'calc(1px',
    '1px)',
    ')(',
    '"open',
    "'open",
    '"a" "b',
    '"a\\"b"',
    '"a\nb"',
    '1px\n2px',
    '1px\t2px',
    '1px\u0000',
    '1px\u007f',
    '1'.repeat(401)
  ])('rejects %j', (value) => {
    expect(isSafeCssValue(value)).toBe(false)
  })

  it('accepts a value of the largest size and rejects one more character', () => {
    expect(isSafeCssValue('1'.repeat(400))).toBe(true)
    expect(isSafeCssValue('1'.repeat(401))).toBe(false)
  })

  it('rejects what is not a string', () => {
    expect(isSafeCssValue(500)).toBe(false)
    expect(isSafeCssValue(null)).toBe(false)
    expect(isSafeCssValue(undefined)).toBe(false)
    expect(isSafeCssValue({ toString: () => '500' })).toBe(false)
    expect(isSafeCssValue(['500'])).toBe(false)
  })
})

describe('assertSafeCssValue', () => {
  it('returns a safe value untouched', () => {
    expect(assertSafeCssValue('style.hooks.--enchase-button-font-weight', '500')).toBe('500')
  })

  it('names what was being set and shows the value in the error', () => {
    expect(() => assertSafeCssValue('style.hooks.--enchase-button-font-weight', '500; color: red')).toThrow('Invalid CSS value for "style.hooks.--enchase-button-font-weight": "500; color: red"')
  })

  it('shows a value that is not a string without breaking', () => {
    expect(() => assertSafeCssValue('style.base.focus.width', undefined)).toThrow('Invalid CSS value for "style.base.focus.width"')
  })
})
