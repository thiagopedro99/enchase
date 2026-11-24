import { describe, expect, it } from 'vitest'

import { densityRules, themeCss } from '@styles/css/declarations.ts'
import { createTheme } from '@styles/theme/createTheme.ts'
import { material2 } from '@styles/presets/material2.ts'
import { defineStyle } from '@styles/theme/style.ts'
import { densities } from '@styles/tokens/index.ts'

const tokensSelector = ":root[data-density='compact']"

const hooksSelector = `:where(${tokensSelector})`

const pixels = (value: string) => (value.endsWith('rem') ? Number.parseFloat(value) * 16 : Number.parseFloat(value))

const declaredBy = (css: string, selector: string): Record<string, string> => {
  const start = css.indexOf(`\n${selector} {\n`)

  if (start === -1) return {}

  const body = css.slice(start + selector.length + 4, css.indexOf('\n}', start))

  return Object.fromEntries(body.split('\n').map((line) => line.trim().replace(/;$/, '').split(': ')))
}

const theme = createTheme({ style: material2 })

const css = themeCss(theme)

const rule = declaredBy(css, tokensSelector)

const hooks = declaredBy(css, hooksSelector)

const block = densityRules('compact', theme.density?.compact)

describe('the compact density of the material2 style', () => {
  it('declares no token of its own: the tokens of the compact density are the generic block of the library', () => {
    expect(theme.density?.compact?.tokens).toBeUndefined()
    expect(Object.fromEntries(Object.entries(rule).filter(([name]) => name in densities.compact.tokens))).toEqual(densities.compact.tokens)
  })

  it('redeclares only the field height, to the MUI "small" field of 40px', () => {
    expect(theme.density?.compact?.hooks).toEqual({ '--enchase-input-height': '2.5rem' })
    expect(densities.compact.hooks['--enchase-input-height']).toBe('2.75rem')
  })

  it('writes the field height at 0,2,0, with the rule of the tokens, and not at 0,0,0', () => {
    expect(rule).toEqual({ ...densities.compact.tokens, '--enchase-input-height': '2.5rem' })
    expect(hooks).not.toHaveProperty('--enchase-input-height')
  })

  it('keeps every other hook of the generic compact block at 0,0,0, untouched', () => {
    const kept = Object.fromEntries(Object.entries(densities.compact.hooks).filter(([key]) => key !== '--enchase-input-height'))

    expect(Object.keys(kept).length).toBeGreaterThan(0)
    expect(hooks).toEqual(kept)
  })

  it('never shrinks the field below the 24px floor, and stays below the normal height of the style', () => {
    expect(pixels(rule['--enchase-input-height'])).toBeGreaterThanOrEqual(24)
    expect(pixels(rule['--enchase-input-height'])).toBeLessThan(pixels('3.5rem'))
  })

  it('writes the block once, right after the layout variables and before the colors', () => {
    expect(css.split(block)).toHaveLength(2)
    expect(css).toContain(`\n\n${block}\n\n`)
    expect(css.indexOf(block)).toBeLessThan(css.indexOf(":root, [data-theme='light']"))
  })

  it('replaces only the block of the default theme, and leaves everything else in the css as it is without the density', () => {
    const plain = createTheme({ style: defineStyle({ ...material2, density: undefined }) })

    expect(css.replace(`${block}\n\n`, '')).toBe(themeCss(plain).replace(`${densityRules('compact')}\n\n`, ''))
  })

  it('writes the same block with a brand, a shape and fonts, which have nothing to do with the density', () => {
    const other = themeCss(createTheme({ style: material2, brand: '#0B6BCB', shape: 'soft', fonts: { primary: 'Arial' } }))

    expect(declaredBy(other, tokensSelector)).toEqual(rule)
    expect(declaredBy(other, hooksSelector)).toEqual(hooks)
  })
})
