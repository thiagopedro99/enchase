import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { densityRules, themeCss } from '@styles/css/declarations.ts'
import { collectCssHooks, isToken, tokenGroups } from '../../../../scripts/cssHooks.mjs'
import { builtInStyleEntries, builtInStyles } from '@tests/shared/fixtures/styles.ts'
import { createTheme } from '@styles/theme/createTheme.ts'
import { enchase } from '@styles/presets/enchase.ts'
import { shadcn } from '@styles/presets/shadcn.ts'
import { shapePresets } from '@styles/theme/shape.ts'
import { validateTheme } from '@styles/theme/validateTheme.ts'
import { variableGroups } from '@styles/tokens/groups.ts'
import { assertStyle, defineStyle } from '@styles/theme/style.ts'
import { baseTokens, darkTheme, defaultTheme, lightTheme } from '@styles/tokens/index.ts'

import type { ThemeSet } from '@styles/tokens/types.ts'

const components = path.resolve(__dirname, '../../../components')

const hookNames = new Set(collectCssHooks(components).map((hook: { name: string }) => hook.name))

const namesIn = (css: string) => new Set([...css.matchAll(/(--enchase-[a-z0-9-]+):/g)].map((match) => match[1] as string))

const tokensOf = (theme: ThemeSet) => [...namesIn(themeCss(theme))].filter((name) => isToken(name)).sort()

const pixels = (value: string) => (value.endsWith('rem') ? Number.parseFloat(value) * 16 : Number.parseFloat(value))

const hooksOf = (style: (typeof builtInStyles)[string]) => [style.hooks, style.colorHooks, style.light?.hooks, style.dark?.hooks].flatMap((record) => Object.keys(record ?? {}))

describe('the built-in styles', () => {
  it('exports the same two styles that the contract below runs on', () => {
    expect(Object.keys(builtInStyles)).toEqual(['enchase', 'shadcn'])
    expect(builtInStyles.enchase).toBe(enchase)
    expect(builtInStyles.shadcn).toBe(shadcn)
  })

  it('keeps the list of token groups of the checks in step with the list of the css variables', () => {
    expect([...tokenGroups]).toEqual([...variableGroups])
  })

  describe.each(builtInStyleEntries)('%s', (_, style) => {
    const theme = createTheme({ style })

    it('is a style that passed defineStyle, deeply frozen and valid when it is checked again', () => {
      expect(Object.isFrozen(style)).toBe(true)
      expect(assertStyle(style)).toBe(style)
      expect(() => assertStyle(JSON.parse(JSON.stringify(style)))).not.toThrow()
    })

    it('makes the same set of css variables as the default theme, so a style changes values and never the names', () => {
      expect(tokensOf(theme)).toEqual(tokensOf(defaultTheme))
      expect(Object.keys(theme.base).sort()).toEqual(Object.keys(baseTokens).sort())
      expect(Object.keys(theme.light.colors).sort()).toEqual(Object.keys(lightTheme.colors).sort())
      expect(Object.keys(theme.dark.colors).sort()).toEqual(Object.keys(darkTheme.colors).sort())
      expect(Object.keys(theme.light.shadows).sort()).toEqual(Object.keys(lightTheme.shadows).sort())
    })

    it('has no pair of colors below the minimum contrast in either mode, with and without a brand color', () => {
      expect(validateTheme(theme)).toEqual([])
      expect(validateTheme(createTheme({ style, brand: '#0B6BCB' }))).toEqual([])
      expect(validateTheme(createTheme({ style, brand: '#FFD54F' }))).toEqual([])
    })

    it('keeps the floors of accessibility: targets of 24px, 44px on touch and a focus ring of 2px', () => {
      expect(pixels(theme.base.hit.size)).toBeGreaterThanOrEqual(24)
      expect(pixels(theme.base.hit.sizeLg)).toBeGreaterThanOrEqual(44)
      expect(pixels(theme.base.focus.width)).toBeGreaterThanOrEqual(2)

      for (const height of Object.values(theme.base.control.height)) expect(pixels(height)).toBeGreaterThanOrEqual(24)
    })

    it('only sets hooks that exist in the components and that are not tokens of the theme', () => {
      const named = hooksOf(style)

      expect(named.filter((name) => !hookNames.has(name))).toEqual([])
      expect(named.filter((name) => isToken(name))).toEqual([])
    })

    it('writes each hook of the style in the css, on the root or in the blocks of the modes', () => {
      const css = themeCss(theme).replace(densityRules('compact'), '')
      const declared = namesIn(css)

      for (const name of hooksOf(style)) expect(declared, name).toContain(name)
    })

    it('puts the hooks that read a color or a shadow where the mode is, never on the root', () => {
      const css = themeCss(theme)
      const rootRules = (css.match(/:root \{[^}]*\}/g) ?? []).join('\n')

      for (const [name, value] of Object.entries(style.hooks ?? {})) {
        expect(value, name).not.toMatch(/var\(--enchase-(?:color|shadow)-/)
        expect(rootRules).toContain(`${name}:`)
      }
    })

    it('lets the caller override the shape, the radius, a color and the brand', () => {
      expect(createTheme({ style, shape: 'soft' }).base.borderRadius).toEqual(shapePresets.soft)
      expect(createTheme({ style, radius: { md: '1rem' } }).base.borderRadius.md).toBe('1rem')
      expect(createTheme({ style, dark: { colors: { background: '#000000' } } }).dark.colors.background).toBe('#000000')
      expect(createTheme({ style, brand: '#0B6BCB' }).light.colors.primary).not.toBe(theme.light.colors.primary)
    })

    it('does not change the style or the built-in themes when a theme is made from it', () => {
      const before = JSON.stringify([builtInStyles, defaultTheme, baseTokens, lightTheme, darkTheme])

      createTheme({ style, brand: '#0B6BCB', radius: { md: '1rem' }, light: { colors: { primary: '#101010' } } })

      expect(JSON.stringify([builtInStyles, defaultTheme, baseTokens, lightTheme, darkTheme])).toBe(before)
    })
  })
})

describe('the enchase style', () => {
  it('leaves the theme exactly as it is', () => {
    expect(createTheme({ style: enchase })).toEqual(defaultTheme)
    expect(createTheme({ style: enchase }).base).toBe(baseTokens)
    expect(createTheme({ style: enchase }).hooks).toBeUndefined()
    expect(createTheme({ style: enchase }).defaults).toBeUndefined()
  })
})

describe('the shadcn style', () => {
  const theme = createTheme({ style: shadcn })

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
    expect(theme.base.borderRadius.none).toBe(shapePresets.pill.none)
    expect(createTheme({ style: shadcn, shape: 'pill' }).base.borderRadius).toEqual(shapePresets.pill)
    expect(createTheme({ style: shadcn, radius: { md: '1rem' } }).base.borderRadius).toMatchObject({ md: '1rem', sm: '0.375rem' })
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

  it('lets a style built on this one put the label at the start of the control', () => {
    expect(createTheme({ style: defineStyle({ ...shadcn, defaults: { labelPlacement: 'start' } }) }).defaults).toEqual({ labelPlacement: 'start' })
  })

  it('lets the caller override a color of the palette in one mode', () => {
    const custom = createTheme({ style: shadcn, dark: { colors: { background: '#000000' } } })

    expect(custom.dark.colors.background).toBe('#000000')
    expect(custom.light.colors.background).toBe('#FFFFFF')
  })

  it('takes only the accent from a brand color and keeps the neutrals', () => {
    const branded = createTheme({ style: shadcn, brand: '#0B6BCB' })

    expect(branded.light.colors.primary).not.toBe('#171717')
    expect(branded.light.colors.background).toBe('#FFFFFF')
    expect(branded.light.colors.surfaceContainer).toBe('#F5F5F5')
    expect(branded.dark.colors.background).toBe('#0A0A0A')
  })

  it('declares its hooks on the root and the ones that cite a color inside the mode blocks', () => {
    const css = themeCss(theme)
    const rootRules = (css.match(/:root \{[^}]*\}/g) ?? []).join('\n')

    for (const name of Object.keys(theme.hooks ?? {})) expect(rootRules).toContain(`${name}:`)

    for (const mode of ['light', 'dark'] as const) for (const name of Object.keys(theme[mode].hooks ?? {})) expect(css).toContain(`${name}:`)
  })
})
