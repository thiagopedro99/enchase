import { describe, expect, it } from 'vitest'

import { shadcn } from '@styles/presets/shadcn.ts'
import { baseTokens, darkTheme, lightTheme } from '@styles/tokens/index.ts'
import { oklchToHex, rgbToOklch } from '@styles/theme/oklch.ts'
import { validateTheme } from '@styles/theme/validateTheme.ts'
import { createTheme } from '@styles/theme/createTheme.ts'
import { contrastRatio } from '@styles/theme/contrast.ts'
import { brandPalette } from '@styles/theme/brand.ts'
import { parseColor } from '@styles/theme/rgb.ts'

import type { ColorTokens } from '@styles/tokens/types.ts'

const rgbOf = (hex: string) => parseColor(hex) as { r: number; g: number; b: number; a: number }

const keysOf = (colors: ColorTokens) => Object.entries(colors).flatMap(([key, value]) => (typeof value === 'object' ? Object.keys(value).map((inner) => `${key}.${inner}`) : [key]))

const hues = Array.from({ length: 36 }, (_, index) => index * 10)

const grid = hues.flatMap((hue) => [0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 0.97].flatMap((lightness) => [0, 0.03, 0.08, 0.15, 0.25, 0.35].map((chroma) => oklchToHex({ lightness, chroma, hue }))))

const named = ['#000000', '#FFFFFF', '#808080', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#FF00FF', '#4F46E5', '#0F766E', '#F59E0B', '#E11D48']

const brands = [...new Set([...grid, ...named])]

describe('createTheme with a brand color', () => {
  it('generates a theme whose every measured color pair passes the contrast checks, for any brand color', () => {
    const failing = brands.filter((brand) => validateTheme(createTheme({ brand })).length > 0)

    expect(brands.length).toBeGreaterThan(600)
    expect(failing).toEqual([])
  })

  it('keeps every measured color pair above the contrast floor for any brand color over the shadcn style too', () => {
    const failing = brands.filter((brand) => validateTheme(createTheme({ style: shadcn, brand })).length > 0)

    expect(failing).toEqual([])
  })

  it.each(['#4F46E5', '#0000FF', '#000000'])('keeps %s as the light primary because it already passes', (brand) => {
    expect(createTheme({ brand }).light.colors.primary).toBe(brand)
  })

  it('darkens a brand that is too light to be read as text, keeping its hue and chroma family', () => {
    const { light } = createTheme({ brand: '#FFD400' })
    const wanted = rgbToOklch(rgbOf('#FFD400'))
    const primary = rgbToOklch(rgbOf(light.colors.primary))

    expect(light.colors.primary).not.toBe('#FFD400')
    expect(primary.lightness).toBeLessThan(wanted.lightness)
    expect(Math.abs(primary.hue - wanted.hue)).toBeLessThan(5)
    expect(contrastRatio(light.colors.primary, light.colors.surfaceContainerHigh)).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(light.colors.onPrimary, light.colors.primary)).toBeGreaterThanOrEqual(4.5)
  })

  it.each(['#4f46e5', 'rgb(79 70 229)', 'rgb(79, 70, 229)', 'rgba(79, 70, 229, 1)', '#4F46E5FF'])('reads the brand written as %s', (brand) => {
    expect(createTheme({ brand }).light.colors.primary).toBe('#4F46E5')
  })

  it('reads a short hex', () => {
    expect(createTheme({ brand: '#00F' }).light.colors.primary).toBe('#0000FF')
  })

  it('is close to the built-in indigo theme when the brand is its primary', () => {
    const { light, dark } = createTheme({ brand: '#4F46E5' })

    expect(light.colors.primary).toBe(lightTheme.colors.primary)
    expect(contrastRatio(light.colors.primaryHover, lightTheme.colors.primaryHover)).toBeLessThan(1.15)
    expect(contrastRatio(dark.colors.primary, darkTheme.colors.primary)).toBeLessThan(1.1)
    expect(contrastRatio(dark.colors.surface, darkTheme.colors.surface)).toBeLessThan(1.1)
  })

  it('leaves the semantic roles, the shadows, the fonts and the motion as they are', () => {
    const theme = createTheme({ brand: '#0F766E' })

    for (const role of ['error', 'success', 'warning', 'info'] as const) {
      expect(theme.light.colors[role]).toBe(lightTheme.colors[role])
      expect(theme.dark.colors[`${role}Container`]).toBe(darkTheme.colors[`${role}Container`])
    }

    expect(theme.light.shadows).toEqual(lightTheme.shadows)
    expect(theme.dark.shadows).toEqual(darkTheme.shadows)
    expect(theme.light.colors.overlay).toBe(lightTheme.colors.overlay)
    expect(theme.dark.colors.text.disabled).toBe(darkTheme.colors.text.disabled)
    expect(theme.base).toEqual(baseTokens)
  })

  it('keeps the same set of tokens as the built-in themes in both modes', () => {
    const theme = createTheme({ brand: '#E11D48' })

    expect(keysOf(theme.light.colors)).toEqual(keysOf(lightTheme.colors))
    expect(keysOf(theme.dark.colors)).toEqual(keysOf(darkTheme.colors))
  })

  it('lets explicit colors win over the generated ones, in each mode on its own', () => {
    const generated = createTheme({ brand: '#0F766E' })
    const { light, dark } = createTheme({ brand: '#0F766E', light: { colors: { primary: '#0B6BCB', text: { primary: '#101010' } } } })

    expect(light.colors.primary).toBe('#0B6BCB')
    expect(light.colors.text.primary).toBe('#101010')
    expect(light.colors.text.secondary).toBe(generated.light.colors.text.secondary)
    expect(light.colors.primaryContainer).toBe(generated.light.colors.primaryContainer)
    expect(dark).toEqual(generated.dark)
  })

  it('pairs the primary of one mode with the inverse primary of the other', () => {
    const { light, dark } = createTheme({ brand: '#7C3AED' })

    expect(light.colors.inversePrimary).toBe(dark.colors.primary)
    expect(dark.colors.inversePrimary).toBe(light.colors.primary)
    expect(dark.colors.text.inverse).toBe(dark.colors.onPrimary)
  })

  it('tints the neutrals with the hue of the brand and keeps them gray for a gray brand', () => {
    const teal = rgbOf(createTheme({ brand: '#0F766E' }).light.colors.surface)
    const gray = rgbOf(createTheme({ brand: '#808080' }).light.colors.surface)

    expect(teal.r).toBeLessThan(teal.g)
    expect(teal.r).toBeLessThan(teal.b)
    expect(gray.r).toBe(gray.g)
    expect(gray.g).toBe(gray.b)
  })

  it('gives the same result every time and does not change the built-in themes', () => {
    const before = JSON.stringify([lightTheme, darkTheme])

    expect(createTheme({ brand: '#E11D48' })).toEqual(createTheme({ brand: '#E11D48' }))
    expect(brandPalette('#E11D48')).toEqual(brandPalette('#E11D48'))
    expect(JSON.stringify([lightTheme, darkTheme])).toBe(before)
  })

  it('ignores a brand that is explicitly undefined', () => {
    expect(createTheme({ brand: undefined })).toEqual(createTheme())
  })

  it('combines with fonts and motion', () => {
    const theme = createTheme({ brand: '#0F766E', fonts: { primary: 'Georgia, serif' }, motion: { duration: { base: '200ms' } } })

    expect(theme.base.fonts.primary).toBe('Georgia, serif')
    expect(theme.base.motion.duration.base).toBe('200ms')
    expect(theme.light.colors.primary).not.toBe(lightTheme.colors.primary)
  })
})

describe('createTheme with a wrong brand', () => {
  it.each([[42], [null], [{}], [''], ['blue'], ['#12']])('rejects %j as an invalid color', (brand) => {
    expect(() => createTheme({ brand: brand as never })).toThrow('Invalid color for "brand"')
  })

  it.each(['hsl(210 90% 40%)', 'oklch(0.5 0.1 250)', 'transparent'])('rejects %s because its contrast cannot be measured', (brand) => {
    expect(() => createTheme({ brand })).toThrow(/hex or rgb\(\)/)
  })

  it.each(['#4F46E580', 'rgba(79, 70, 229, 0.5)'])('rejects the translucent %s', (brand) => {
    expect(() => createTheme({ brand })).toThrow(/opaque/)
  })

  it('names the brand in the message and shows the value', () => {
    expect(() => createTheme({ brand: 'verde' })).toThrow('Invalid color for "brand": "verde"')
  })
})
