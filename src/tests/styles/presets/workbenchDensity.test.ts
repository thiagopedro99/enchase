import { describe, expect, it } from 'vitest'

import { densityRules, layoutVariables, themeCss } from '@styles/css/declarations.ts'
import { createTheme } from '@styles/theme/createTheme.ts'
import { workbench } from '@styles/presets/workbench.ts'
import { defineStyle } from '@styles/theme/style.ts'
import { densities } from '@styles/tokens/index.ts'

const tokensSelector = ":root[data-density='compact']"

const hooksSelector = `:where(${tokensSelector})`

const compactTokens = [
  ['--enchase-hit-size', '1.5rem'],
  ['--enchase-control-height-sm', '1.5rem'],
  ['--enchase-control-height-md', '1.75rem'],
  ['--enchase-control-height-lg', '2.1875rem'],
  ['--enchase-space-sm', '0.25rem'],
  ['--enchase-space-md', '0.5rem'],
  ['--enchase-space-lg', '1rem'],
  ['--enchase-space-xl', '2rem'],
  ['--enchase-space-2xl', '3rem']
] as const

const inheritedTokens = [['--enchase-space-3xl', '3rem']] as const

const pixels = (value: string) => (value.endsWith('rem') ? Number.parseFloat(value) * 16 : Number.parseFloat(value))

const indent = (css: string) => css.replace(/^(?=.)/gm, '  ')

const declaredBy = (css: string, selector: string): Record<string, string> => {
  const start = css.indexOf(`\n${selector} {\n`)

  if (start === -1) return {}

  const body = css.slice(start + selector.length + 4, css.indexOf('\n}', start))

  return Object.fromEntries(body.split('\n').map((line) => line.trim().replace(/;$/, '').split(': ')))
}

const theme = createTheme({ style: workbench })

const css = themeCss(theme)

const tokens = declaredBy(css, tokensSelector)

const hooks = declaredBy(css, hooksSelector)

const block = densityRules('compact', theme.density?.compact)

describe('the compact density of the workbench style', () => {
  it('is carried by the theme set as the compact density, with the tokens of the table and no others', () => {
    expect(Object.keys(theme.density ?? {})).toEqual(['compact'])
    expect(theme.density?.compact?.tokens).toEqual(Object.fromEntries(compactTokens))
  })

  it.each(compactTokens)('writes %s: %s in the rule of the tokens', (name, value) => {
    expect(tokens[name]).toBe(value)
  })

  it.each(inheritedTokens)('keeps %s: %s of the default block, because the style does not say it', (name, value) => {
    expect(theme.density?.compact?.tokens).not.toHaveProperty(name)
    expect(densities.compact.tokens[name]).toBe(value)
    expect(tokens[name]).toBe(value)
  })

  it('writes the tokens of the default block, in the same order, and no token of its own', () => {
    expect(Object.keys(tokens)).toEqual(Object.keys(densities.compact.tokens))
  })

  it('leaves the typography out, because a smaller font takes the small segmented control below 24px and moves the floating label', () => {
    expect(Object.keys(tokens).filter((name) => /^--enchase-(?:font-size|line-height)-/.test(name))).toEqual([])
  })

  it('keeps the hooks of the default block that the style does not redeclare in the rule at 0,0,0', () => {
    const redeclared = theme.density?.compact?.hooks ?? {}
    const kept = Object.entries(densities.compact.hooks).filter(([name]) => !(name in redeclared))

    expect(kept.length).toBeGreaterThan(0)
    expect(Object.entries(hooks)).toEqual(kept)
  })

  it('writes the block once, right after the layout variables and before the colors', () => {
    expect(css.split(block)).toHaveLength(2)
    expect(css).toContain(`\n\n${block}\n\n`)
    expect(css.indexOf('--enchase-z-tooltip')).toBeLessThan(css.indexOf(block))
    expect(css.indexOf(block)).toBeLessThan(css.indexOf(":root, [data-theme='light']"))
  })

  it('keeps the targets at 24px or more, and the large target out of the block', () => {
    const sized = ['--enchase-hit-size', '--enchase-control-height-sm', '--enchase-control-height-md', '--enchase-control-height-lg']

    expect(sized.filter((name) => pixels(tokens[name]) < 24)).toEqual([])
    expect(pixels(tokens['--enchase-hit-size'])).toBe(24)
    expect(tokens['--enchase-hit-size-lg']).toBeUndefined()
  })

  it('keeps the medium space at twice the small one, which keeps the floating label of the fields in line with the notch', () => {
    expect(pixels(tokens['--enchase-space-sm'])).toBeGreaterThan(0)
    expect(pixels(tokens['--enchase-space-md'])).toBe(2 * pixels(tokens['--enchase-space-sm']))
  })

  it('never goes above the value of the style: no token of the block is bigger than the token of the style', () => {
    const variables = layoutVariables(theme.base)

    expect(Object.keys(tokens).filter((name) => variables[name] === undefined)).toEqual([])
    expect(Object.entries(tokens).filter(([name, value]) => pixels(value) > pixels(variables[name]))).toEqual([])
  })

  it('is the reason the style carries its own: the default block would raise the small control above the 24px of the style', () => {
    expect(pixels(theme.base.control.height.sm)).toBe(24)
    expect(pixels(densities.compact.tokens['--enchase-control-height-sm'])).toBeGreaterThan(pixels(theme.base.control.height.sm))
    expect(pixels(tokens['--enchase-control-height-sm'])).toBeLessThanOrEqual(pixels(theme.base.control.height.sm))
  })

  it('replaces only the block of the default theme, and leaves everything else in the css as it is without the density', () => {
    const plain = createTheme({ style: defineStyle({ ...workbench, density: undefined }) })

    expect(css).not.toContain(densityRules('compact'))
    expect(css.replace(`${block}\n\n`, '')).toBe(themeCss(plain).replace(`${densityRules('compact')}\n\n`, ''))
  })

  it('goes inside the same layer as the rest of the theme', () => {
    const layered = themeCss(theme, { layer: 'app' })

    expect(layered).toBe(`@layer app {\n${indent(css)}\n}`)
    expect(layered).toContain(indent(block))
  })

  it('writes the same block with a brand, a shape and fonts, which have nothing to do with the density', () => {
    const other = themeCss(createTheme({ style: workbench, brand: '#0B6BCB', shape: 'soft', fonts: { primary: 'Arial' } }))

    expect(declaredBy(other, tokensSelector)).toEqual(tokens)
    expect(declaredBy(other, hooksSelector)).toEqual(hooks)
  })
})
