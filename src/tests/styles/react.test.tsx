import { render, screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { defaultThemeCss, themeCss } from '@styles/css/declarations.ts'
import { baseTokens, darkTheme, defaultTheme, lightTheme } from '@styles/tokens/index.ts'
import { createTheme } from '@styles/theme/createTheme.ts'
import { GlobalStyles, ThemeVariables } from '@styles/react.tsx'

import type { ThemeSet } from '@styles/tokens/types.ts'

const renderCss = (set: ThemeSet = defaultTheme) => {
  const html = renderToString(<ThemeVariables css={themeCss(set)} />)
  const match = html.match(/<style[^>]*>([\s\S]*)<\/style>/)

  return (match?.[1] ?? '').replace(/\s+/g, '')
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
    const family = '--enchase-font-primary:' + baseTokens.fonts.primary.replace(/\s+/g, '')

    expect(css).toContain(family)
    expect(css.split(family)).toHaveLength(2)
    expect(css.indexOf(family)).toBeLessThan(css.indexOf('--enchase-color-primary:'))
  })

  it('writes the sizes and weights', () => {
    expect(css).toContain('--enchase-font-size-base:' + baseTokens.fonts.sizes.base)
    expect(css).toContain('--enchase-font-weight-bold:' + baseTokens.fonts.weights.bold)
  })
})

describe('themeCss', () => {
  it('is what the default css is made of', () => {
    expect(defaultThemeCss).toBe(themeCss(defaultTheme))
  })

  it('writes the values of the themes it receives', () => {
    const css = renderCss(createTheme({ fonts: { primary: 'Arial', sizes: { base: '1.25rem' } }, light: { colors: { primary: '#0B6BCB' } }, dark: { colors: { primary: '#99CCFF' } } }))

    expect(css).toContain('--enchase-color-primary:#0B6BCB')
    expect(css).toContain('--enchase-color-primary:#99CCFF')
    expect(css).toContain('--enchase-font-primary:Arial')
    expect(css).toContain('--enchase-font-size-base:1.25rem')
    expect(css).not.toContain('--enchase-color-primary:' + lightTheme.colors.primary)
  })
})

describe('ThemeVariables layout', () => {
  const css = renderCss()

  it('writes spacing, radius and transitions once, not per mode', () => {
    const spacing = '--enchase-space-md:' + baseTokens.spacing.md

    expect(css).toContain(spacing)
    expect(css.split(spacing)).toHaveLength(2)
    expect(css).toContain('--enchase-radius-full:' + baseTokens.borderRadius.full)
    expect(css).toContain('--enchase-transition-fast:' + baseTokens.transitions.fast.replace(/\s+/g, ''))
  })
})

describe('GlobalStyles', () => {
  it('underlines inline links so they do not rely on color alone (WCAG 1.4.1)', () => {
    render(
      <>
        <GlobalStyles />
        <p>
          Read the <a href="/docs">documentation</a> first.
        </p>
      </>
    )

    expect(getComputedStyle(screen.getByRole('link', { name: 'documentation' })).textDecoration).toContain('underline')
  })
})
