import { describe, expect, it } from 'vitest'

import { createTheme, formatContrastIssues, validateTheme } from 'enchase/theme'

describe('the public theme entry protects the contrast contract', () => {
  it('throws on an unknown token, an unknown section and a value that is not an object', () => {
    expect(() => createTheme({ light: { colors: { notAToken: '#000000' } } } as never)).toThrow(/Unknown/)
    expect(() => createTheme({ light: { sizes: {} } } as never)).toThrow(/Unknown theme section/)
    expect(() => createTheme({ light: 'dark' } as never)).toThrow(/Expected an object/)
    expect(() => createTheme(null as never)).toThrow(/Expected an object/)
  })

  it('lists a bad contrast pair in validateTheme without relying on React', () => {
    const issues = validateTheme(createTheme({ light: { colors: { onPrimary: '#EEEEEE', primary: '#DDDDDD' } } }))

    expect(issues.some((issue) => issue.label === 'onPrimary on primary' && issue.mode === 'light')).toBe(true)
    expect(formatContrastIssues(issues)).toContain('below the minimum contrast')
  })

  it('finds nothing wrong in the built-in theme', () => {
    expect(validateTheme(createTheme())).toEqual([])
  })
})
