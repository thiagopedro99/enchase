import { describe, expect, it } from 'vitest'

import * as styles from '@styles/index.ts'

describe('styles public entry', () => {
  it('exposes the tokens, the theme builders and the css generators', () => {
    expect(styles.defaultTheme.base).toBe(styles.baseTokens)
    expect(styles.breakpoints).toBe(styles.baseTokens.breakpoints)
    expect(styles.themeModes).toEqual(['light', 'dark'])
    expect(typeof styles.createTheme).toBe('function')
    expect(typeof styles.validateTheme).toBe('function')
    expect(typeof styles.isValidColor).toBe('function')
    expect(typeof styles.isValidFontFamily).toBe('function')
    expect(typeof styles.themeCss).toBe('function')
    expect(styles.defaultThemeCss).toBe(styles.themeCss(styles.defaultTheme))
    expect(typeof styles.globalStylesCss).toBe('string')
  })

  it('does not expose any react component', () => {
    expect(Object.keys(styles)).not.toContain('GlobalStyles')
    expect(Object.keys(styles)).not.toContain('ThemeVariables')
  })

  it('builds a theme without react', () => {
    const { light } = styles.createTheme({ light: { colors: { primary: '#0B6BCB' } } })

    expect(light.colors.primary).toBe('#0B6BCB')
    expect(styles.validateTheme(styles.defaultTheme)).toEqual([])
  })
})
