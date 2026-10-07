import { describe, expect, it } from 'vitest'

import { componentContrast, contrastChecks, textContrast, validateTheme } from '@styles/validateTheme.ts'
import { createTheme } from '@styles/createTheme.ts'
import { darkTheme, lightTheme, themes } from '@styles/themes/index.ts'

describe('contrastChecks', () => {
  const checks = contrastChecks(lightTheme.colors)

  it('lists text pairs at 4.5:1 and component pairs at 3:1', () => {
    expect(textContrast).toBe(4.5)
    expect(componentContrast).toBe(3)
    expect(checks.every((check) => check.minimum === textContrast || check.minimum === componentContrast)).toBe(true)
    expect(checks.filter((check) => check.minimum === componentContrast)).toHaveLength(15)
  })

  it('gives every pair its own label and uses the colors of the theme it receives', () => {
    const labels = checks.map((check) => check.label)

    expect(new Set(labels).size).toBe(labels.length)
    expect(checks.find((check) => check.label === 'onPrimary on primary')).toMatchObject({ foreground: lightTheme.colors.onPrimary, background: lightTheme.colors.primary })
    expect(contrastChecks(darkTheme.colors).find((check) => check.label === 'onPrimary on primary')).toMatchObject({ foreground: darkTheme.colors.onPrimary })
  })
})

describe('validateTheme', () => {
  it('finds nothing wrong in the built-in themes', () => {
    expect(validateTheme(themes)).toEqual([])
    expect(validateTheme(createTheme())).toEqual([])
  })

  it('reports the pairs below the minimum, with the mode and the measured ratio', () => {
    const issues = validateTheme(createTheme({ light: { colors: { onPrimary: '#EEEEEE', primary: '#DDDDDD' } } }))
    const issue = issues.find((item) => item.label === 'onPrimary on primary')

    expect(issue).toMatchObject({ mode: 'light', foreground: '#EEEEEE', background: '#DDDDDD', minimum: textContrast })
    expect(issue?.ratio).toBeGreaterThan(1)
    expect(issue?.ratio).toBeLessThan(textContrast)
    expect(issues.every((item) => item.mode === 'light')).toBe(true)
  })

  it('reports each mode on its own', () => {
    const issues = validateTheme(createTheme({ dark: { colors: { text: { primary: '#222222' } } } }))

    expect(issues.length).toBeGreaterThan(0)
    expect(issues.every((item) => item.mode === 'dark')).toBe(true)
    expect(issues.some((item) => item.label.startsWith('primary text on'))).toBe(true)
  })

  it('applies the lower minimum to borders and focus rings', () => {
    const issues = validateTheme(createTheme({ light: { colors: { borderStrong: '#F0F0F0' } } }))
    const border = issues.find((item) => item.label === 'form control border on surface')

    expect(border?.minimum).toBe(componentContrast)
  })

  it('does not report a pair that is exactly enough', () => {
    const issues = validateTheme(createTheme({ light: { colors: { onPrimary: '#FFFFFF', primary: '#767676' } } }))

    expect(issues.find((item) => item.label === 'onPrimary on primary')).toBeUndefined()
  })

  it('marks as unmeasured the pairs in formats it cannot read, instead of guessing', () => {
    const issues = validateTheme(createTheme({ light: { colors: { primary: 'hsl(244 76% 59%)' } } }))
    const unmeasured = issues.filter((item) => item.ratio === null)

    expect(unmeasured.length).toBeGreaterThan(0)
    expect(unmeasured.every((item) => item.foreground === 'hsl(244 76% 59%)' || item.background === 'hsl(244 76% 59%)')).toBe(true)
    expect(unmeasured.every((item) => item.mode === 'light')).toBe(true)
  })

  it('does not change the themes it receives', () => {
    const before = JSON.stringify(themes)

    validateTheme(createTheme({ light: { colors: { primary: '#DDDDDD' } } }))

    expect(JSON.stringify(themes)).toBe(before)
  })
})
