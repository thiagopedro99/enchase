import { describe, expect, it } from 'vitest'

import { darkTheme, lightTheme } from '@styles/themes/index.ts'
import { themeVariables } from '@styles/cssVariables.ts'
import { createTheme } from '@styles/createTheme.ts'

import type { ThemeInput } from '@styles/createTheme.ts'

describe('createTheme', () => {
  it('returns the built-in light and dark themes when nothing is customized', () => {
    const { light, dark } = createTheme()

    expect(light).toEqual(lightTheme)
    expect(dark).toEqual(darkTheme)
    expect(createTheme({})).toEqual({ light: lightTheme, dark: darkTheme })
  })

  it('overrides a single color in one mode and leaves everything else alone', () => {
    const { light, dark } = createTheme({ light: { colors: { primary: '#0B6BCB' } } })

    expect(light.colors.primary).toBe('#0B6BCB')
    expect(light.colors.onPrimary).toBe(lightTheme.colors.onPrimary)
    expect(light.colors.background).toBe(lightTheme.colors.background)
    expect(dark).toEqual(darkTheme)
  })

  it('overrides nested tokens without touching their siblings', () => {
    const { light } = createTheme({ light: { colors: { text: { primary: '#101010' } } } })

    expect(light.colors.text.primary).toBe('#101010')
    expect(light.colors.text.secondary).toBe(lightTheme.colors.text.secondary)
    expect(light.colors.text.placeholder).toBe(lightTheme.colors.text.placeholder)
  })

  it('customizes the two modes independently', () => {
    const { light, dark } = createTheme({ light: { colors: { primary: '#0B6BCB' } }, dark: { colors: { primary: 'rgb(150 200 255)' } } })

    expect(light.colors.primary).toBe('#0B6BCB')
    expect(dark.colors.primary).toBe('rgb(150 200 255)')
  })

  it('accepts every color format the validator accepts', () => {
    const { light } = createTheme({ light: { colors: { primary: 'hsl(210 90% 40%)', secondary: 'oklch(0.5 0.1 250)', overlay: 'rgba(0, 0, 0, 0.5)' } } })

    expect(light.colors.primary).toBe('hsl(210 90% 40%)')
    expect(light.colors.secondary).toBe('oklch(0.5 0.1 250)')
    expect(light.colors.overlay).toBe('rgba(0, 0, 0, 0.5)')
  })

  it('does not change the built-in themes', () => {
    const before = JSON.stringify([lightTheme, darkTheme])

    createTheme({ light: { colors: { primary: '#0B6BCB', text: { primary: '#101010' } } }, dark: { colors: { background: '#000000' } } })

    expect(JSON.stringify([lightTheme, darkTheme])).toBe(before)
  })

  it('keeps the parts of the theme that are not colors', () => {
    const { light, dark } = createTheme({ light: { colors: { primary: '#0B6BCB' } }, dark: { colors: { primary: '#CCDDFF' } } })

    expect(light.fonts).toEqual(lightTheme.fonts)
    expect(light.spacing).toEqual(lightTheme.spacing)
    expect(light.shadows).toEqual(lightTheme.shadows)
    expect(dark.shadows).toEqual(darkTheme.shadows)
  })

  it('ignores a token that is explicitly undefined', () => {
    const { light } = createTheme({ light: { colors: { primary: undefined, secondary: '#445566' } } })

    expect(light.colors.primary).toBe(lightTheme.colors.primary)
    expect(light.colors.secondary).toBe('#445566')
  })

  it('keeps the same set of tokens in both modes, so every css variable still has a value', () => {
    const { light, dark } = createTheme({ light: { colors: { primary: '#0B6BCB' } }, dark: { colors: { text: { primary: '#FFFFFF' } } } })

    expect(Object.keys(themeVariables(light)).sort()).toEqual(Object.keys(themeVariables(lightTheme)).sort())
    expect(Object.keys(themeVariables(dark)).sort()).toEqual(Object.keys(themeVariables(darkTheme)).sort())
  })
})

describe('createTheme with wrong input', () => {
  const bad = (input: unknown) => () => createTheme(input as ThemeInput)

  it('rejects a color token that does not exist, naming where it is', () => {
    expect(bad({ light: { colors: { primaryy: '#0B6BCB' } } })).toThrow('Unknown color token "light.colors.primaryy"')
    expect(bad({ dark: { colors: { text: { main: '#FFFFFF' } } } })).toThrow('Unknown color token "dark.colors.text.main"')
  })

  it('rejects an invalid color, naming the token and showing the value', () => {
    expect(bad({ dark: { colors: { primary: 'red' } } })).toThrow('Invalid color for "dark.colors.primary": "red"')
    expect(bad({ light: { colors: { text: { primary: '#fff; display: none' } } } })).toThrow('Invalid color for "light.colors.text.primary"')
  })

  it('rejects values that are not strings', () => {
    expect(bad({ light: { colors: { primary: 123 } } })).toThrow('Invalid color for "light.colors.primary"')
    expect(bad({ light: { colors: { primary: null } } })).toThrow('Invalid color for "light.colors.primary"')
    expect(bad({ light: { colors: { primary: { value: '#fff' } } } })).toThrow('Invalid color for "light.colors.primary"')
  })

  it('rejects a group of tokens given as a single color, and a token given as a group', () => {
    expect(bad({ light: { colors: { text: '#FFFFFF' } } })).toThrow('Expected an object for "light.colors.text"')
    expect(bad({ light: { colors: 'blue' } })).toThrow('Expected an object for "light.colors"')
  })

  it('rejects a mode that does not exist', () => {
    expect(bad({ middle: { colors: { primary: '#0B6BCB' } } })).toThrow('Unknown theme mode "middle"')
  })

  it('rejects a section that cannot be customized yet', () => {
    expect(bad({ light: { shadows: { sm: 'none' } } })).toThrow('Unknown theme section "light.shadows"')
    expect(bad({ dark: { fonts: {} } })).toThrow('Unknown theme section "dark.fonts"')
  })

  it('rejects an input that is not an object', () => {
    expect(bad('light')).toThrow('Expected an object for the theme input')
    expect(bad(null)).toThrow('Expected an object for the theme input')
    expect(bad({ light: 'dark' })).toThrow('Expected an object for "light"')
  })

  it('does not let a crafted key pollute objects, and refuses it as an unknown token', () => {
    const input = JSON.parse('{"light":{"colors":{"__proto__":{"primary":"#FFFFFF"}}}}')

    expect(bad(input)).toThrow('Unknown color token "light.colors.__proto__"')
    expect(({} as Record<string, unknown>).primary).toBeUndefined()
  })

  it('leaves the themes untouched when one of several tokens is wrong', () => {
    const before = JSON.stringify([lightTheme, darkTheme])

    expect(bad({ light: { colors: { primary: '#0B6BCB', secondary: 'nope' } } })).toThrow()
    expect(JSON.stringify([lightTheme, darkTheme])).toBe(before)
  })
})
