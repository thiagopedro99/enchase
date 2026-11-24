import { describe, expect, it } from 'vitest'

import { baseTokens } from '@styles/tokens/index.ts'
import { createTheme } from '@styles/theme/createTheme.ts'
import { material2 } from '@styles/presets/material2.ts'
import { themeCss } from '@styles/css/declarations.ts'
import { shapePresets } from '@styles/theme/shape.ts'
import { defineStyle } from '@styles/theme/style.ts'

const geometry = [
  ['--enchase-control-height-sm', '1.875rem', 'control.height.sm'],
  ['--enchase-control-height-md', '2.25rem', 'control.height.md'],
  ['--enchase-control-height-lg', '2.625rem', 'control.height.lg'],
  ['--enchase-state-hover', '0.04', 'state.hover'],
  ['--enchase-state-focus', '0.12', 'state.focus'],
  ['--enchase-state-pressed', '0.12', 'state.pressed'],
  ['--enchase-state-row-hover', '0.04', 'state.rowHover'],
  ['--enchase-state-disabled-container', '0.12', 'state.disabledContainer'],
  ['--enchase-state-disabled-content', '0.38', 'state.disabledContent'],
  ['--enchase-radius-xs', '0.125rem', 'borderRadius.xs'],
  ['--enchase-radius-sm', '0.25rem', 'borderRadius.sm'],
  ['--enchase-radius-md', '0.25rem', 'borderRadius.md'],
  ['--enchase-radius-lg', '0.25rem', 'borderRadius.lg'],
  ['--enchase-radius-xl', '0.25rem', 'borderRadius.xl'],
  ['--enchase-radius-2xl', '0.25rem', 'borderRadius.2xl'],
  ['--enchase-radius-control', '0.25rem', 'borderRadius.control'],
  ['--enchase-radius-button', '0.25rem', 'borderRadius.button']
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

const theme = createTheme({ style: material2 })

const tokens = Object.fromEntries(leaves(theme.base))

const originalTokens = Object.fromEntries(leaves(baseTokens))

const written = rootVariables(themeCss(theme))

const originalWritten = rootVariables(themeCss(createTheme({ style: defineStyle({}) })))

const listedPaths = new Set<string>(geometry.map(([, , path]) => path))

const listedVariables = new Set<string>(geometry.map(([variable]) => variable))

describe('the geometry of the material2 style', () => {
  it('lists each token of the table once, and each one is a token of the theme set and a variable of the css', () => {
    expect(geometry).toHaveLength(17)
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

  it('keeps the font family and the motion of the default theme', () => {
    expect(theme.base.fonts.primary).toBe(baseTokens.fonts.primary)
    expect(theme.base.fonts.primary).toContain('Figtree')
    expect(theme.base.motion).toEqual(baseTokens.motion)
    expect(theme.base.transitions).toEqual(baseTokens.transitions)
  })

  it('puts the label inside the field by default, as MUI does', () => {
    expect(theme.defaults).toEqual({ labelPlacement: 'floating' })
  })

  it('leaves the geometry as it is when a brand color is given', () => {
    expect(createTheme({ style: material2, brand: '#0B6BCB' }).base).toEqual(theme.base)
  })

  it('lets the caller choose a shape, a radius and the fonts over the style', () => {
    expect(createTheme({ style: material2, shape: 'soft' }).base.borderRadius).toEqual(shapePresets.soft)
    expect(createTheme({ style: material2, radius: { button: '9999px' } }).base.borderRadius).toMatchObject({ button: '9999px', control: '0.25rem' })
    expect(createTheme({ style: material2, fonts: { sizes: { base: '1rem' } } }).base.fonts).toMatchObject({ sizes: { base: '1rem', sm: '0.875rem' } })
  })
})
