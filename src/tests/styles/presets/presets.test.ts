import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { themeCss } from '@styles/css/declarations.ts'
import { collectCssHooks, isToken } from '../../../../scripts/cssHooks.mjs'
import { assertStyleName, styleNames, themeStyles } from '@styles/presets/index.ts'
import { createTheme } from '@styles/theme/createTheme.ts'
import { validateTheme } from '@styles/theme/validateTheme.ts'
import { baseTokens, darkTheme, defaultTheme, lightTheme } from '@styles/tokens/index.ts'
import { shapePresets } from '@styles/theme/shape.ts'

import type { ThemeInput } from '@styles/theme/createTheme.ts'

const components = path.resolve(__dirname, '../../../components')

const hookNames = new Set(collectCssHooks(components).map((hook: { name: string }) => hook.name))

describe('the styles of the theme', () => {
  it('lists the built-in styles and rejects any other name', () => {
    expect(styleNames).toEqual(['enchase', 'shadcn'])
    expect(assertStyleName('shadcn')).toBe('shadcn')
    expect(() => assertStyleName('material')).toThrow('Unknown style "material": use enchase, shadcn')
    expect(() => createTheme({ style: 'material' } as unknown as ThemeInput)).toThrow('Unknown style "material"')
  })

  it('leaves the theme exactly as it is for the enchase style', () => {
    expect(createTheme({ style: 'enchase' })).toEqual(defaultTheme)
    expect(createTheme({ style: 'enchase' }).base).toBe(baseTokens)
  })

  it('does not change the definitions or the built-in themes when a theme is made from them', () => {
    const before = JSON.stringify([themeStyles, defaultTheme])

    createTheme({ style: 'shadcn', brand: '#0B6BCB', radius: { md: '1rem' }, light: { colors: { primary: '#101010' } } })

    expect(JSON.stringify([themeStyles, defaultTheme])).toBe(before)
  })
})

describe('the shadcn style', () => {
  const theme = createTheme({ style: 'shadcn' })

  it('sets the heights, the focus ring, the borders and the halo of the controls', () => {
    expect(theme.base.control.height).toEqual({ sm: '2rem', md: '2.25rem', lg: '2.5rem' })
    expect(theme.base.focus).toEqual({ width: '2px', offset: '2px', offsetInset: '-2px', offsetSelector: '2px' })
    expect(theme.base.hit).toEqual({ size: '2rem', sizeLg: '44px' })
    expect(theme.base.border).toEqual({ width: '1px', widthStrong: '1px' })
    expect(theme.base.halo).toEqual({ size: '0px', sizeSwitch: '0px' })
  })

  it('keeps every other token of the base, so the css variables are the same set', () => {
    expect(theme.base.spacing).toEqual(baseTokens.spacing)
    expect(theme.base.motion).toEqual(baseTokens.motion)
    expect(theme.base.fonts).toEqual(baseTokens.fonts)
    expect(theme.base.state).toEqual(baseTokens.state)
    expect(Object.keys(theme.base).sort()).toEqual(Object.keys(baseTokens).sort())
  })

  it('uses the corners of the style until the caller picks a shape or a radius', () => {
    expect(theme.base.borderRadius.md).toBe('0.5rem')
    expect(theme.base.borderRadius.button).toBe('0.5rem')
    expect(createTheme({ style: 'shadcn', shape: 'pill' }).base.borderRadius).toEqual(shapePresets.pill)
    expect(createTheme({ style: 'shadcn', radius: { md: '1rem' } }).base.borderRadius).toMatchObject({ md: '1rem', sm: '0.375rem' })
  })

  it('takes the neutral palette in both modes and keeps the roles that it does not set', () => {
    expect(theme.light.colors.background).toBe('#FFFFFF')
    expect(theme.light.colors.primary).toBe('#171717')
    expect(theme.dark.colors.background).toBe('#0A0A0A')
    expect(theme.light.colors.success).toBe(lightTheme.colors.success)
    expect(theme.dark.colors.warningContainer).toBe(darkTheme.colors.warningContainer)
    expect(Object.keys(theme.light.colors).sort()).toEqual(Object.keys(lightTheme.colors).sort())
  })

  it('swaps the shadows of both modes and keeps none', () => {
    expect(theme.light.shadows.none).toBe('none')
    expect(theme.light.shadows.sm).toContain('rgb(0 0 0 / 0.1)')
    expect(theme.dark.shadows.sm).not.toBe(theme.light.shadows.sm)
  })

  it('puts the label above the field by default', () => {
    expect(theme.defaults).toEqual({ labelPlacement: 'stacked' })
    expect(createTheme().defaults).toBeUndefined()
  })

  it('lets the caller override a color of the palette in one mode', () => {
    const custom = createTheme({ style: 'shadcn', dark: { colors: { background: '#000000' } } })

    expect(custom.dark.colors.background).toBe('#000000')
    expect(custom.light.colors.background).toBe('#FFFFFF')
  })

  it('takes only the accent from a brand color and keeps the neutrals', () => {
    const branded = createTheme({ style: 'shadcn', brand: '#0B6BCB' })

    expect(branded.light.colors.primary).not.toBe('#171717')
    expect(branded.light.colors.background).toBe('#FFFFFF')
    expect(branded.light.colors.surfaceContainer).toBe('#F5F5F5')
    expect(branded.dark.colors.background).toBe('#0A0A0A')
  })

  it('has no pair of colors below the minimum contrast in either mode', () => {
    expect(validateTheme(theme)).toEqual([])
    expect(validateTheme(createTheme({ style: 'shadcn', brand: '#0B6BCB' }))).toEqual([])
  })

  it('declares its hooks on the root and the ones that cite a color inside the mode blocks', () => {
    const css = themeCss(theme)
    const rootRules = (css.match(/:root \{[^}]*\}/g) ?? []).join('\n')

    for (const name of Object.keys(theme.hooks ?? {})) expect(rootRules).toContain(`${name}:`)

    for (const mode of ['light', 'dark'] as const) for (const name of Object.keys(theme[mode].hooks ?? {})) expect(css).toContain(`${name}:`)
  })

  it('only sets hooks that exist in the components and that are not tokens of the theme', () => {
    const named = [themeStyles.shadcn.hooks, themeStyles.shadcn.colorHooks, themeStyles.shadcn.light?.hooks, themeStyles.shadcn.dark?.hooks].flatMap((record) => Object.keys(record ?? {}))

    expect(named.filter((name) => !hookNames.has(name))).toEqual([])
    expect(named.filter((name) => isToken(name))).toEqual([])
  })
})
