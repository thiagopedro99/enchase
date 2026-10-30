import { describe, expect, it } from 'vitest'

import { baseTokens, defaultTheme } from '@styles/tokens/index.ts'
import { createTheme } from '@styles/theme/createTheme.ts'
import { workbench } from '@styles/presets/workbench.ts'
import { themeCss } from '@styles/css/declarations.ts'
import { shapePresets } from '@styles/theme/shape.ts'

const geometry = [
  ['--enchase-control-height-sm', '1.5rem', 'control.height.sm'],
  ['--enchase-control-height-md', '2rem', 'control.height.md'],
  ['--enchase-control-height-lg', '2.5rem', 'control.height.lg'],
  ['--enchase-focus-width', '3px', 'focus.width'],
  ['--enchase-focus-offset', '1px', 'focus.offset'],
  ['--enchase-focus-offset-selector', '1px', 'focus.offsetSelector'],
  ['--enchase-focus-offset-inset', '-3px', 'focus.offsetInset'],
  ['--enchase-border-width', '1px', 'border.width'],
  ['--enchase-border-width-strong', '1px', 'border.widthStrong'],
  ['--enchase-halo-size', '0px', 'halo.size'],
  ['--enchase-halo-size-switch', '0px', 'halo.sizeSwitch'],
  ['--enchase-hit-size', '2rem', 'hit.size'],
  ['--enchase-hit-size-lg', '44px', 'hit.sizeLg'],
  ['--enchase-state-hover', '0.06', 'state.hover'],
  ['--enchase-state-focus', '0.1', 'state.focus'],
  ['--enchase-state-pressed', '0.1', 'state.pressed'],
  ['--enchase-state-row-hover', '0.02', 'state.rowHover'],
  ['--enchase-state-disabled-container', '0.04', 'state.disabledContainer'],
  ['--enchase-state-disabled-content', '0.38', 'state.disabledContent'],
  ['--enchase-font-size-xs', '0.75rem', 'fonts.sizes.xs'],
  ['--enchase-font-size-sm', '0.875rem', 'fonts.sizes.sm'],
  ['--enchase-font-size-base', '0.875rem', 'fonts.sizes.base'],
  ['--enchase-font-size-lg', '1rem', 'fonts.sizes.lg'],
  ['--enchase-font-size-xl', '1.25rem', 'fonts.sizes.xl'],
  ['--enchase-font-size-2xl', '1.5rem', 'fonts.sizes.2xl'],
  ['--enchase-font-size-3xl', '1.875rem', 'fonts.sizes.3xl'],
  ['--enchase-font-size-4xl', '2.375rem', 'fonts.sizes.4xl'],
  ['--enchase-font-size-5xl', '3.5rem', 'fonts.sizes.5xl'],
  ['--enchase-line-height-normal', 1.5714, 'fonts.lineHeights.normal'],
  ['--enchase-radius-xs', '0.125rem', 'borderRadius.xs'],
  ['--enchase-radius-sm', '0.25rem', 'borderRadius.sm'],
  ['--enchase-radius-md', '0.375rem', 'borderRadius.md'],
  ['--enchase-radius-lg', '0.5rem', 'borderRadius.lg'],
  ['--enchase-radius-xl', '0.5rem', 'borderRadius.xl'],
  ['--enchase-radius-2xl', '0.5rem', 'borderRadius.2xl'],
  ['--enchase-radius-control', '0.375rem', 'borderRadius.control'],
  ['--enchase-radius-button', '0.375rem', 'borderRadius.button']
] as const

const leaves = (value: unknown, path: string[] = []): Array<[string, string | number]> => {
  if (typeof value !== 'object' || value === null) return [[path.join('.'), value as string | number]]

  return Object.entries(value).flatMap(([key, item]) => leaves(item, [...path, key]))
}

const rootVariables = (css: string) =>
  Object.fromEntries(
    [...css.matchAll(/^:root \{\n([^}]*)\n\}/gm)].flatMap(([, body]) =>
      [...body.matchAll(/^ {2}(--enchase-[a-z0-9-]+): (.+);$/gm)].map(([, name, value]) => [name, value])
    )
  )

const theme = createTheme({ style: workbench })

const tokens = Object.fromEntries(leaves(theme.base))

const originalTokens = Object.fromEntries(leaves(baseTokens))

const written = rootVariables(themeCss(theme))

const originalWritten = rootVariables(themeCss(defaultTheme))

const listedPaths = new Set<string>(geometry.map(([, , path]) => path))

const listedVariables = new Set<string>(geometry.map(([variable]) => variable))

describe('the geometry of the workbench style', () => {
  it('lists each token of the table once, and each one is a token of the theme set and a variable of the css', () => {
    expect(geometry).toHaveLength(37)
    expect(listedPaths.size).toBe(geometry.length)
    expect(listedVariables.size).toBe(geometry.length)
    expect(geometry.filter(([, , path]) => tokens[path] === undefined)).toEqual([])
    expect(geometry.filter(([variable]) => written[variable] === undefined)).toEqual([])
  })

  it.each(geometry)('sets %s to %s in the theme set', (_variable, value, path) => {
    expect(tokens[path]).toBe(value)
  })

  it.each(geometry)('writes %s: %s in the css of the theme', (variable, value) => {
    expect(written[variable]).toBe(String(value))
  })

  it('keeps every other token of the theme set as the default theme has it', () => {
    const others = Object.keys(tokens).filter((path) => !listedPaths.has(path))

    expect(Object.keys(tokens).sort()).toEqual(Object.keys(originalTokens).sort())
    expect(others.length).toBeGreaterThan(0)
    expect(Object.fromEntries(others.map((path) => [path, tokens[path]]))).toEqual(Object.fromEntries(others.map((path) => [path, originalTokens[path]])))
  })

  it('writes every other token of the default theme in the css with the value of the default theme', () => {
    const others = Object.keys(originalWritten).filter((variable) => !listedVariables.has(variable))

    expect(others.length).toBeGreaterThan(0)
    expect(others.filter((variable) => written[variable] !== originalWritten[variable])).toEqual([])
  })

  it('keeps the font family of the default theme', () => {
    expect(theme.base.fonts.primary).toBe(baseTokens.fonts.primary)
    expect(theme.base.fonts.primary).toContain('Figtree')
  })

  it('keeps the motion of the default theme', () => {
    expect(theme.base.motion).toEqual(baseTokens.motion)
    expect(theme.base.transitions).toEqual(baseTokens.transitions)
  })

  it('puts the label above the field by default', () => {
    expect(theme.defaults).toEqual({ labelPlacement: 'stacked' })
  })

  it('leaves the geometry as it is when a brand color is given', () => {
    expect(createTheme({ style: workbench, brand: '#0B6BCB' }).base).toEqual(theme.base)
  })

  it('lets the caller choose a shape, a radius and the fonts over the style', () => {
    expect(createTheme({ style: workbench, shape: 'soft' }).base.borderRadius).toEqual(shapePresets.soft)
    expect(createTheme({ style: workbench, radius: { button: '9999px' } }).base.borderRadius).toMatchObject({ button: '9999px', control: '0.375rem', md: '0.375rem' })
    expect(createTheme({ style: workbench, fonts: { sizes: { base: '1rem' } } }).base.fonts).toMatchObject({ sizes: { base: '1rem', sm: '0.875rem' }, lineHeights: { normal: 1.5714 } })
  })
})
