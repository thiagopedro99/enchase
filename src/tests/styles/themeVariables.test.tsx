import { ServerStyleSheet } from 'styled-components'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ThemeVariables, variableTheme } from '@styles/themeVariables.ts'
import { darkTheme, lightTheme } from '@styles/themes/index.ts'
import { themeReferences } from '@styles/cssVariables.ts'

const renderCss = () => {
  const sheet = new ServerStyleSheet()

  try {
    renderToString(sheet.collectStyles(<ThemeVariables />))

    return sheet.getStyleTags().replace(/\s+/g, '')
  } finally {
    sheet.seal()
  }
}

describe('ThemeVariables', () => {
  const css = renderCss()
  const lightStart = css.indexOf('--enchase-color-primary:' + lightTheme.colors.primary)
  const darkStart = css.indexOf('--enchase-color-primary:' + darkTheme.colors.primary)

  it('writes the light values for the default and for the light selector', () => {
    expect(lightStart).toBeGreaterThan(-1)
    expect(css).toMatch(/:root,\[data-theme=['"]light['"]\]\{/)
  })

  it('writes the dark values under the dark selector', () => {
    expect(darkStart).toBeGreaterThan(-1)
    expect(css).toMatch(/\[data-theme=['"]dark['"]\]\{/)
  })

  it('writes the dark rule after the light one, so it wins when both could apply', () => {
    expect(darkStart).toBeGreaterThan(lightStart)
  })

  it('writes the colors and the shadows of each mode', () => {
    expect(css).toContain('--enchase-color-background:' + lightTheme.colors.background)
    expect(css).toContain('--enchase-color-background:' + darkTheme.colors.background)
    expect(css).toContain('--enchase-shadow-md:' + lightTheme.shadows.md.replace(/\s+/g, ''))
    expect(css).toContain('--enchase-shadow-md:' + darkTheme.shadows.md.replace(/\s+/g, ''))
  })
})

describe('ThemeVariables fonts', () => {
  const css = renderCss()

  it('writes the fonts once, under the root selector, not per mode', () => {
    const family = '--enchase-font-primary:' + lightTheme.fonts.primary.replace(/\s+/g, '')

    expect(css).toContain(family)
    expect(css.split(family)).toHaveLength(2)
    expect(css.indexOf(family)).toBeLessThan(css.indexOf('--enchase-color-primary:'))
  })

  it('writes the sizes and weights', () => {
    expect(css).toContain('--enchase-font-size-base:' + lightTheme.fonts.sizes.base)
    expect(css).toContain('--enchase-font-weight-bold:' + lightTheme.fonts.weights.bold)
  })
})

describe('variableTheme', () => {
  it('is the theme with every color and shadow turned into a variable reference', () => {
    expect(variableTheme).toEqual(themeReferences(lightTheme))
    expect(variableTheme.colors.primary).toBe('var(--enchase-color-primary)')
    expect(variableTheme.shadows.md).toBe('var(--enchase-shadow-md)')
    expect(variableTheme.fonts.primary).toBe('var(--enchase-font-primary)')
    expect(variableTheme.fonts.sizes.base).toBe('var(--enchase-font-size-base)')
  })
})
