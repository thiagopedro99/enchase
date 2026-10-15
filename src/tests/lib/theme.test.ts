import { describe, expect, it } from 'vitest'

import { createTheme, formatContrastIssues, formatMotionIssues, spring, validateMotion, validateTheme } from 'enchase/theme'

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

  it('customizes the motion tokens and warns about a duration longer than 300ms', () => {
    const theme = createTheme({ motion: { duration: { base: '200ms', slow: '500ms' }, easing: { out: 'cubic-bezier(0.1, 0, 0, 1)' }, distance: { md: '2rem' } } })

    expect(theme.base.motion.duration.base).toBe('200ms')
    expect(theme.base.motion.ease.out).toBe('cubic-bezier(0.1, 0, 0, 1)')
    expect(theme.base.transitions.normal).toBe('200ms cubic-bezier(0.1, 0, 0, 1)')
    expect(validateMotion(theme.base).map((issue) => issue.label)).toEqual(['motion.duration.slow'])
    expect(formatMotionIssues(validateMotion(theme.base))).toContain('300ms')
    expect(validateMotion(createTheme().base)).toEqual([])
  })

  it('throws for an invalid motion value or an unknown motion token', () => {
    expect(() => createTheme({ motion: { duration: { base: 'fast' } } } as never)).toThrow(/Invalid duration/)
    expect(() => createTheme({ motion: { easing: { out: 'cubic-bezier(2, 0, 0, 1)' } } } as never)).toThrow(/Invalid easing/)
    expect(() => createTheme({ motion: { distance: { md: '5000px' } } } as never)).toThrow(/Invalid distance/)
    expect(() => createTheme({ motion: { duration: { turbo: '10ms' } } } as never)).toThrow(/Unknown motion token/)
    expect(() => createTheme({ motion: { speed: {} } } as never)).toThrow(/Unknown motion section/)
  })

  it('exposes the spring generator without React', () => {
    expect(spring({ duration: 0.4, bounce: 0.2 }).easing.startsWith('linear(')).toBe(true)
  })
})
