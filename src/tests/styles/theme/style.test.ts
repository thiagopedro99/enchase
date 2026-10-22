import { describe, expect, it } from 'vitest'

import { themeCss } from '@styles/css/declarations.ts'
import { createTheme } from '@styles/theme/createTheme.ts'
import { shadcn } from '@styles/presets/shadcn.ts'
import { shapePresets } from '@styles/theme/shape.ts'
import { assertStyle, defineStyle } from '@styles/theme/style.ts'
import { baseTokens, darkTheme, defaultTheme, lightTheme } from '@styles/tokens/index.ts'

import type { ThemeInput } from '@styles/theme/createTheme.ts'
import type { ThemeStyle } from '@styles/theme/style.ts'

const asStyle = (value: unknown) => value as ThemeStyle

const full = {
  base: { control: { height: { md: '3rem' } }, focus: { width: '3px', offsetSelector: '4px' }, hit: { size: '36px' } },
  fonts: { sizes: { base: '0.9375rem' }, weights: { medium: 550 }, lineHeights: { normal: 1.6 }, letterSpacings: { control: '0.02em' } },
  radius: { button: '0.25rem', md: '0.375rem' },
  hooks: { '--enchase-button-font-weight': '550', '--enchase-input-height': 'var(--enchase-control-height-md)' },
  colorHooks: { '--enchase-card-background-default': 'var(--enchase-color-surface)', '--enchase-focus-color': 'var(--enchase-color-primary)' },
  brand: ['primary', 'onPrimary'],
  light: { colors: { background: '#FAFAFA', text: { primary: '#111111' } }, shadows: { sm: '0 1px 2px rgb(0 0 0 / 0.2)' }, hooks: { '--enchase-badge-background-neutral': '#EEEEEE' } },
  dark: { colors: { background: '#101010' }, shadows: { md: '0 2px 4px rgb(0 0 0 / 0.6)' }, hooks: { '--enchase-badge-background-neutral': '#202020' } },
  defaults: { labelPlacement: 'stacked' }
} as const satisfies ThemeStyle

describe('defineStyle', () => {
  it('accepts the empty style and a style that sets every section', () => {
    expect(() => defineStyle({})).not.toThrow()
    expect(() => defineStyle(full)).not.toThrow()
  })

  it('returns a deeply frozen copy and leaves the object it was given alone', () => {
    const input = { hooks: { '--enchase-button-font-weight': '500' }, brand: ['primary'], light: { hooks: { '--enchase-card-shadow-default': 'var(--enchase-shadow-sm)' } } } as ThemeStyle
    const defined = defineStyle(input)

    expect(defined).not.toBe(input)
    expect(defined).toEqual(input)
    expect(Object.isFrozen(defined)).toBe(true)
    expect(Object.isFrozen(defined.hooks)).toBe(true)
    expect(Object.isFrozen(defined.brand)).toBe(true)
    expect(Object.isFrozen(defined.light?.hooks)).toBe(true)
    expect(Object.isFrozen(input)).toBe(false)
    expect(Object.isFrozen(input.hooks)).toBe(false)
    expect(() => {
      ;(defined.hooks as Record<string, string>)['--enchase-button-font-weight'] = '700'
    }).toThrow(TypeError)
  })

  it('checks the style where it is defined, naming the part that is wrong', () => {
    expect(() => defineStyle(asStyle({ hooks: { 'button-font-weight': '500' } }))).toThrow('Invalid hook name "button-font-weight" in "style.hooks"')
    expect(() => defineStyle(asStyle({ light: { colors: { primary: 'blue' } } }))).toThrow('Invalid color for "style.light.colors.primary"')
  })

  it('takes a style read from JSON, as long as it passes the same checks', () => {
    const stored = JSON.parse(JSON.stringify(full))

    expect(createTheme({ style: defineStyle(stored) }).base.control.height.md).toBe('3rem')
    expect(() => defineStyle(JSON.parse('{"hooks":{"__proto__":"x"}}'))).toThrow('Invalid hook name "__proto__"')
  })
})

describe('createTheme with a style', () => {
  it('leaves the default theme as it is without a style, with the empty one or with a null', () => {
    expect(createTheme({ style: undefined })).toEqual(defaultTheme)
    expect(createTheme({ style: null as unknown as undefined })).toEqual(defaultTheme)
    expect(createTheme({ style: defineStyle({}) })).toEqual(defaultTheme)
    expect(createTheme({ style: defineStyle({}) }).base).toBe(baseTokens)
  })

  it('asks for the style itself when it is given a name, and says where to import it from', () => {
    expect(() => createTheme({ style: 'shadcn' } as unknown as ThemeInput)).toThrow('Unknown style "shadcn"')
    expect(() => createTheme({ style: 'shadcn' } as unknown as ThemeInput)).toThrow("import { shadcn } from 'enchase/styles'")
  })

  it('rejects what is not an object, and a section that does not exist', () => {
    expect(() => createTheme({ style: 3 } as unknown as ThemeInput)).toThrow('Expected an object for "style"')
    expect(() => createTheme({ style: [] } as unknown as ThemeInput)).toThrow('Expected an object for "style"')
    expect(() => createTheme({ style: { colors: {} } } as unknown as ThemeInput)).toThrow('Unknown style section "colors"')
  })

  it('takes the tokens, the corners, the type, the colors, the shadows, the hooks and the defaults from the style', () => {
    const theme = createTheme({ style: defineStyle(full) })

    expect(theme.base.control.height).toEqual({ ...baseTokens.control.height, md: '3rem' })
    expect(theme.base.focus).toEqual({ ...baseTokens.focus, width: '3px', offsetSelector: '4px' })
    expect(theme.base.hit.size).toBe('36px')
    expect(theme.base.borderRadius).toEqual({ ...shapePresets.pill, button: '0.25rem', md: '0.375rem' })
    expect(theme.base.fonts.sizes.base).toBe('0.9375rem')
    expect(theme.base.fonts.weights.medium).toBe(550)
    expect(theme.base.fonts.lineHeights.normal).toBe(1.6)
    expect(theme.base.fonts.letterSpacings.control).toBe('0.02em')
    expect(theme.light.colors.background).toBe('#FAFAFA')
    expect(theme.light.colors.text.primary).toBe('#111111')
    expect(theme.light.colors.text.secondary).toBe(lightTheme.colors.text.secondary)
    expect(theme.dark.colors.background).toBe('#101010')
    expect(theme.light.shadows.sm).toBe('0 1px 2px rgb(0 0 0 / 0.2)')
    expect(theme.light.shadows.none).toBe('none')
    expect(theme.dark.shadows.md).toBe('0 2px 4px rgb(0 0 0 / 0.6)')
    expect(theme.hooks).toEqual(full.hooks)
    expect(theme.light.hooks).toEqual({ ...full.colorHooks, ...full.light.hooks })
    expect(theme.dark.hooks).toEqual({ ...full.colorHooks, ...full.dark.hooks })
    expect(theme.defaults).toEqual({ labelPlacement: 'stacked' })
  })

  it('writes the hooks on the root and the color hooks in the blocks of each mode', () => {
    const css = themeCss(createTheme({ style: defineStyle(full) }))
    const rootRules = (css.match(/:root \{[^}]*\}/g) ?? []).join('\n')

    expect(rootRules).toContain('--enchase-button-font-weight: 550;')
    expect(rootRules).not.toContain('--enchase-card-background-default')
    expect(css).toContain("[data-theme='dark'] {")
    expect(css.match(/--enchase-card-background-default: var\(--enchase-color-surface\);/g)).toHaveLength(3)
    expect(css).toContain('--enchase-badge-background-neutral: #202020;')
    expect(css).toContain('--enchase-badge-background-neutral: #EEEEEE;')
  })

  it('lets what the caller passes win over the style', () => {
    const style = defineStyle(full)

    expect(createTheme({ style, shape: 'soft' }).base.borderRadius).toEqual(shapePresets.soft)
    expect(createTheme({ style, radius: { button: '1rem' } }).base.borderRadius).toMatchObject({ button: '1rem', md: '0.375rem' })
    expect(createTheme({ style, fonts: { sizes: { base: '1rem' } } }).base.fonts.sizes.base).toBe('1rem')
    expect(createTheme({ style, light: { colors: { background: '#FFFFFF' } } }).light.colors.background).toBe('#FFFFFF')
    expect(createTheme({ style, dark: { colors: { background: '#000000' } } }).dark.colors.background).toBe('#000000')
  })

  it('takes from a brand only the roles that the style lists', () => {
    const branded = createTheme({ style: defineStyle(full), brand: '#0B6BCB' })
    const unstyled = createTheme({ brand: '#0B6BCB' })

    expect(branded.light.colors.primary).not.toBe(lightTheme.colors.primary)
    expect(branded.light.colors.primary).toBe(unstyled.light.colors.primary)
    expect(branded.light.colors.onPrimary).toBe(unstyled.light.colors.onPrimary)
    expect(branded.dark.colors.primary).toBe(unstyled.dark.colors.primary)
    expect(unstyled.light.colors.secondary).not.toBe(lightTheme.colors.secondary)
    expect(branded.light.colors.secondary).toBe(lightTheme.colors.secondary)
    expect(branded.dark.colors.surfaceContainer).toBe(darkTheme.colors.surfaceContainer)
    expect(createTheme({ style: defineStyle({}), brand: '#0B6BCB' }).light.colors.secondary).toBe(unstyled.light.colors.secondary)
  })

  it('does not change the style, the base tokens or the built-in themes', () => {
    const style = defineStyle(full)
    const before = JSON.stringify([style, baseTokens, lightTheme, darkTheme, defaultTheme])

    createTheme({ style, brand: '#0B6BCB', radius: { md: '1rem' }, light: { colors: { primary: '#101010' } } })

    expect(JSON.stringify([style, baseTokens, lightTheme, darkTheme, defaultTheme])).toBe(before)
  })

  it('checks again an object that was not made by defineStyle, so a change made after the first use is caught', () => {
    const raw = { hooks: { '--enchase-button-font-weight': '500' } } as ThemeStyle

    expect(() => createTheme({ style: raw })).not.toThrow()

    raw.hooks = { 'button-font-weight': '500' } as never

    expect(() => createTheme({ style: raw })).toThrow('Invalid hook name "button-font-weight"')
  })

  it('does not check again a style made by defineStyle', () => {
    const defined = defineStyle(full)

    expect(assertStyle(defined)).toBe(defined)
    expect(createTheme({ style: defined }).hooks).toBe(defined.hooks)
  })
})

describe('the examples of the documentation', () => {
  const compact = {
    base: { control: { height: { sm: '1.75rem', md: '2rem', lg: '2.25rem' } }, hit: { size: '1.5rem' } },
    fonts: { weights: { medium: 500 } },
    radius: { button: '0.375rem', control: '0.375rem' },
    hooks: { '--enchase-button-font-size-md': 'var(--enchase-font-size-sm)' },
    colorHooks: { '--enchase-button-border-color-outline': 'var(--enchase-color-border)' },
    light: { colors: { background: '#FAFAFA' }, shadows: { sm: '0 1px 2px rgb(0 0 0 / 0.08)' } },
    dark: { colors: { background: '#0A0A0A' } },
    brand: ['primary', 'onPrimary'],
    defaults: { labelPlacement: 'stacked' }
  } as const satisfies ThemeStyle

  it('defines the compact style and makes a theme from it', () => {
    const theme = createTheme({ style: defineStyle(compact) })

    expect(theme.base.control.height).toEqual({ sm: '1.75rem', md: '2rem', lg: '2.25rem' })
    expect(theme.base.hit.size).toBe('1.5rem')
    expect(theme.base.borderRadius.control).toBe('0.375rem')
    expect(theme.light.colors.background).toBe('#FAFAFA')
    expect(theme.hooks).toEqual(compact.hooks)
    expect(theme.light.hooks).toEqual(compact.colorHooks)
    expect(theme.defaults).toEqual({ labelPlacement: 'stacked' })
  })

  it('starts from a ready style by spreading it', () => {
    const floating = defineStyle({ ...shadcn, defaults: { labelPlacement: 'floating' } })
    const theme = createTheme({ style: floating })

    expect(theme.defaults).toEqual({ labelPlacement: 'floating' })
    expect(theme.base.control.height).toEqual(createTheme({ style: shadcn }).base.control.height)
    expect(theme.hooks).toEqual(shadcn.hooks)
    expect(Object.isFrozen(floating)).toBe(true)
    expect(floating).not.toBe(shadcn)
  })
})

describe('the checks of a style', () => {
  const rejected: [string, unknown, string][] = [
    ['a base group that does not exist', { base: { shadows: {} } }, 'Unknown base token "style.base.shadows"'],
    ['a base token that does not exist', { base: { focus: { color: '#FFFFFF' } } }, 'Unknown base token "style.base.focus.color"'],
    ['a base group that is not an object', { base: { focus: '2px' } }, 'Expected an object for "style.base.focus"'],
    ['a base value that closes the rule', { base: { focus: { width: '2px; color: red' } } }, 'Invalid CSS value for "style.base.focus.width"'],
    ['a font family, which only the caller picks', { fonts: { primary: 'Inter' } }, 'Unknown font token "style.fonts.primary"'],
    ['a font size without a unit', { fonts: { sizes: { base: '16' } } }, 'Invalid font size for "style.fonts.sizes.base"'],
    ['a font weight that is not a number', { fonts: { weights: { medium: 'bold' } } }, 'Invalid font weight for "style.fonts.weights.medium"'],
    ['a line height below one', { fonts: { lineHeights: { normal: 0.5 } } }, 'Invalid line height for "style.fonts.lineHeights.normal"'],
    ['a letter spacing in another unit', { fonts: { letterSpacings: { control: '1ch' } } }, 'Invalid letter spacing for "style.fonts.letterSpacings.control"'],
    ['the radius none', { radius: { none: '0' } }, 'Unknown radius token "style.radius.none"'],
    ['a radius with a space in it', { radius: { md: '1 rem' } }, 'Invalid radius for "style.radius.md"'],
    ['a hook without the prefix', { hooks: { '--button-font-weight': '500' } }, 'Invalid hook name "--button-font-weight" in "style.hooks"'],
    ['a hook in capitals', { hooks: { '--enchase-Button-font-weight': '500' } }, 'Invalid hook name "--enchase-Button-font-weight"'],
    ['a hook that is a token of the theme', { hooks: { '--enchase-space-md': '1rem' } }, '"--enchase-space-md" in "style.hooks" is a token of the theme'],
    ['a color token as a hook', { colorHooks: { '--enchase-color-primary': '#FFFFFF' } }, 'is a token of the theme'],
    ['a hook that is not a string', { hooks: { '--enchase-button-font-weight': 500 } }, 'Invalid CSS value for "style.hooks.--enchase-button-font-weight"'],
    ['a hook with an empty value', { hooks: { '--enchase-button-font-weight': ' ' } }, 'Invalid CSS value'],
    ['a hook value that ends the declaration', { hooks: { '--enchase-button-font-weight': '500; color: red' } }, 'Invalid CSS value'],
    ['a hook value that closes the rule', { hooks: { '--enchase-button-font-weight': '500 }' } }, 'Invalid CSS value'],
    ['a hook value that loads an address', { hooks: { '--enchase-card-background-default': 'url(https://example.com/a.png)' } }, 'Invalid CSS value'],
    ['a hook value with a comment', { hooks: { '--enchase-button-font-weight': '500 /* heavy */' } }, 'Invalid CSS value'],
    ['a hook value with an open parenthesis', { hooks: { '--enchase-button-font-size-md': 'calc(1rem' } }, 'Invalid CSS value'],
    ['a hook value with an open quote', { hooks: { '--enchase-button-font-weight': "'500" } }, 'Invalid CSS value'],
    ['a hook value that is too long', { hooks: { '--enchase-button-font-weight': '1'.repeat(401) } }, 'Invalid CSS value'],
    ['a root hook that reads a color of the theme', { hooks: { '--enchase-button-color-outline': 'var(--enchase-color-text-primary)' } }, 'reads a color or a shadow of the theme'],
    ['a root hook that reads a shadow of the theme', { hooks: { '--enchase-card-shadow-default': 'var(--enchase-shadow-sm)' } }, 'move it to colorHooks, or to light.hooks and dark.hooks'],
    ['a brand role that does not exist', { brand: ['primary', 'accent'] }, 'Unknown brand role "accent" in "style.brand"'],
    ['a brand that is not a list', { brand: 'primary' }, 'Expected a list for "style.brand"'],
    ['a mode section that does not exist', { light: { accents: {} } }, 'Unknown style section "style.light.accents"'],
    ['a mode that is not an object', { dark: 'dark' }, 'Expected an object for "style.dark"'],
    ['a color that is not a color', { light: { colors: { primary: 'blue' } } }, 'Invalid color for "style.light.colors.primary"'],
    ['a color role that does not exist', { dark: { colors: { accent: '#FFFFFF' } } }, 'Unknown color token "style.dark.colors.accent"'],
    ['a shadow none', { light: { shadows: { none: '1px' } } }, 'Unknown shadow token "style.light.shadows.none"'],
    ['a shadow that ends the declaration', { dark: { shadows: { sm: '0 0 0 1px red;' } } }, 'Invalid CSS value for "style.dark.shadows.sm"'],
    ['a hook of a mode that is a token', { light: { hooks: { '--enchase-shadow-sm': 'none' } } }, '"--enchase-shadow-sm" in "style.light.hooks" is a token of the theme'],
    ['a default that does not exist', { defaults: { density: 'compact' } }, 'Unknown default "style.defaults.density"'],
    ['a label placement that does not exist', { defaults: { labelPlacement: 'left' } }, 'Invalid label placement for "style.defaults.labelPlacement"']
  ]

  it.each(rejected)('rejects %s', (_, style, message) => {
    expect(() => defineStyle(asStyle(style))).toThrow(message)
    expect(() => createTheme({ style: asStyle(style) })).toThrow(message)
  })

  it('accepts the optional variable of the focus color as a color hook, which is read like a hook and is not a token', () => {
    expect(() => defineStyle({ colorHooks: { '--enchase-focus-color': 'var(--enchase-color-primary)' } })).not.toThrow()
    expect(() => defineStyle({ hooks: { '--enchase-focus-width': '3px' } })).toThrow('is a token of the theme')
  })

  it('accepts a quoted string with characters that would otherwise end a declaration', () => {
    expect(() => defineStyle({ hooks: { '--enchase-button-label': '"a;b"' } })).not.toThrow()
    expect(() => defineStyle({ hooks: { '--enchase-button-label': '"a" ; "b"' } })).toThrow('Invalid CSS value')
  })

  it('accepts the values that the components read: lengths, calc, color-mix and shadow lists', () => {
    expect(() =>
      defineStyle({
        hooks: { '--enchase-input-height': 'calc(var(--enchase-control-height-md) + 2px)', '--enchase-button-shadow-primary': '0 1px 2px 0 rgb(0 0 0 / 0.05), 0 0 0 3px rgb(0 0 0 / 0.1)' },
        colorHooks: { '--enchase-input-outline-shadow-focus': '0 0 0 3px color-mix(in srgb, var(--enchase-color-primary) 25%, transparent)' }
      })
    ).not.toThrow()
  })
})
