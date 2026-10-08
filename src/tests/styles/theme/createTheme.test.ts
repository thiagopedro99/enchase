import { describe, expect, it } from 'vitest'

import { baseTokens, darkTheme, defaultTheme, lightTheme } from '@styles/tokens/index.ts'
import { themeVariables } from '@styles/css/declarations.ts'
import { createTheme } from '@styles/theme/createTheme.ts'

import type { ThemeInput } from '@styles/theme/createTheme.ts'

describe('createTheme', () => {
  it('returns the built-in light and dark themes when nothing is customized', () => {
    const { base, light, dark } = createTheme()

    expect(base).toEqual(baseTokens)
    expect(light).toEqual(lightTheme)
    expect(dark).toEqual(darkTheme)
    expect(createTheme({})).toEqual(defaultTheme)
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
    const before = JSON.stringify(defaultTheme)

    createTheme({ light: { colors: { primary: '#0B6BCB', text: { primary: '#101010' } } }, dark: { colors: { background: '#000000' } } })

    expect(JSON.stringify(defaultTheme)).toBe(before)
  })

  it('keeps the parts of the theme that are not colors', () => {
    const { base, light, dark } = createTheme({ light: { colors: { primary: '#0B6BCB' } }, dark: { colors: { primary: '#CCDDFF' } } })

    expect(base).toEqual(baseTokens)
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

describe('createTheme fonts', () => {
  it('customizes the fonts of the base and leaves the modes alone', () => {
    const { base, light, dark } = createTheme({ fonts: { primary: "'Inter', sans-serif", mono: 'Menlo, monospace' } })

    expect(base.fonts.primary).toBe("'Inter', sans-serif")
    expect(base.fonts.mono).toBe('Menlo, monospace')
    expect(base.fonts.sizes).toEqual(baseTokens.fonts.sizes)
    expect(base.fonts.weights).toEqual(baseTokens.fonts.weights)
    expect(base.spacing).toEqual(baseTokens.spacing)
    expect(light).toEqual(lightTheme)
    expect(dark).toEqual(darkTheme)
  })

  it('overrides single sizes and weights without touching their siblings', () => {
    const { base } = createTheme({ fonts: { sizes: { base: '1.0625rem' }, weights: { bold: 800 } } })

    expect(base.fonts.sizes.base).toBe('1.0625rem')
    expect(base.fonts.sizes.sm).toBe(baseTokens.fonts.sizes.sm)
    expect(base.fonts.weights.bold).toBe(800)
    expect(base.fonts.weights.regular).toBe(baseTokens.fonts.weights.regular)
  })

  it('combines fonts with color overrides', () => {
    const { base, light, dark } = createTheme({ fonts: { primary: 'Arial' }, light: { colors: { primary: '#0B6BCB' } } })

    expect(light.colors.primary).toBe('#0B6BCB')
    expect(base.fonts.primary).toBe('Arial')
    expect(dark.colors).toEqual(darkTheme.colors)
  })

  it('ignores a font token that is explicitly undefined', () => {
    const { base } = createTheme({ fonts: { primary: undefined, sizes: { base: undefined, sm: '0.8rem' } } })

    expect(base.fonts.primary).toBe(baseTokens.fonts.primary)
    expect(base.fonts.sizes.base).toBe(baseTokens.fonts.sizes.base)
    expect(base.fonts.sizes.sm).toBe('0.8rem')
  })

  it('does not change the built-in themes', () => {
    const before = JSON.stringify(defaultTheme)

    createTheme({ fonts: { primary: 'Arial', sizes: { base: '2rem' }, weights: { bold: 900 } } })

    expect(JSON.stringify(defaultTheme)).toBe(before)
  })

  it('keeps the same css variables when fonts change', () => {
    const { light } = createTheme({ fonts: { primary: 'Arial', sizes: { base: '2rem' } } })

    expect(Object.keys(themeVariables(light)).sort()).toEqual(Object.keys(themeVariables(lightTheme)).sort())
  })

  it('rejects a font token that does not exist, naming where it is', () => {
    const bad = (input: unknown) => () => createTheme(input as ThemeInput)

    expect(bad({ fonts: { display: 'Arial' } })).toThrow('Unknown font token "fonts.display"')
    expect(bad({ fonts: { sizes: { huge: '9rem' } } })).toThrow('Unknown font token "fonts.sizes.huge"')
    expect(bad({ fonts: { weights: { heavy: 900 } } })).toThrow('Unknown font token "fonts.weights.heavy"')
  })

  it('rejects invalid values, naming the token and showing the value', () => {
    const bad = (input: unknown) => () => createTheme(input as ThemeInput)

    expect(bad({ fonts: { primary: 'Arial; display: none' } })).toThrow('Invalid font family for "fonts.primary": "Arial; display: none"')
    expect(bad({ fonts: { mono: 12 } })).toThrow('Invalid font family for "fonts.mono"')
    expect(bad({ fonts: { sizes: { base: 'calc(1rem + 1px)' } } })).toThrow('Invalid font size for "fonts.sizes.base"')
    expect(bad({ fonts: { sizes: { base: 16 } } })).toThrow('Invalid font size for "fonts.sizes.base"')
    expect(bad({ fonts: { weights: { bold: '700' } } })).toThrow('Invalid font weight for "fonts.weights.bold"')
    expect(bad({ fonts: { weights: { bold: 1500 } } })).toThrow('Invalid font weight for "fonts.weights.bold"')
  })

  it('rejects a group given as a single value, and fonts that are not an object', () => {
    const bad = (input: unknown) => () => createTheme(input as ThemeInput)

    expect(bad({ fonts: { sizes: '1rem' } })).toThrow('Expected an object for "fonts.sizes"')
    expect(bad({ fonts: { weights: 400 } })).toThrow('Expected an object for "fonts.weights"')
    expect(bad({ fonts: 'Arial' })).toThrow('Expected an object for "fonts"')
    expect(bad({ fonts: null })).toThrow('Expected an object for "fonts"')
  })

  it('does not let a crafted key pollute objects, and refuses it as an unknown token', () => {
    const bad = (input: unknown) => () => createTheme(input as ThemeInput)
    const input = JSON.parse('{"fonts":{"sizes":{"__proto__":{"base":"9rem"}}}}')

    expect(bad(input)).toThrow('Unknown font token "fonts.sizes.__proto__"')
    expect(bad(JSON.parse('{"fonts":{"__proto__":{"primary":"Arial"}}}'))).toThrow('Unknown font token "fonts.__proto__"')
    expect(({} as Record<string, unknown>).base).toBeUndefined()
  })

  it('leaves the themes untouched when one of several font tokens is wrong', () => {
    const before = JSON.stringify(defaultTheme)

    expect(() => createTheme({ fonts: { primary: 'Arial', sizes: { base: 'nope' } } })).toThrow()
    expect(JSON.stringify(defaultTheme)).toBe(before)
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
    const before = JSON.stringify(defaultTheme)

    expect(bad({ light: { colors: { primary: '#0B6BCB', secondary: 'nope' } } })).toThrow()
    expect(JSON.stringify(defaultTheme)).toBe(before)
  })
})
