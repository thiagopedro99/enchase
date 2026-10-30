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
  base: { spacing: { sm: '0.375rem', md: '0.75rem' }, control: { height: { md: '3rem' } }, focus: { width: '3px', offsetSelector: '4px' }, hit: { size: '36px' } },
  fonts: { sizes: { base: '0.9375rem' }, weights: { medium: 550 }, lineHeights: { normal: 1.6 }, letterSpacings: { control: '0.02em' } },
  radius: { button: '0.25rem', md: '0.375rem' },
  hooks: { '--enchase-button-font-weight': '550', '--enchase-input-height': 'var(--enchase-control-height-md)' },
  colorHooks: { '--enchase-card-background-default': 'var(--enchase-color-surface)', '--enchase-focus-color': 'var(--enchase-color-primary)' },
  brand: ['primary', 'onPrimary'],
  light: { colors: { background: '#FAFAFA', text: { primary: '#111111' } }, shadows: { sm: '0 1px 2px rgb(0 0 0 / 0.2)' }, hooks: { '--enchase-badge-background-neutral': '#EEEEEE' } },
  dark: { colors: { background: '#101010' }, shadows: { md: '0 2px 4px rgb(0 0 0 / 0.6)' }, hooks: { '--enchase-badge-background-neutral': '#202020' } },
  density: {
    compact: {
      tokens: { '--enchase-hit-size': '28px', '--enchase-space-md': '0.625rem', '--enchase-font-size-base': '0.9375rem', '--enchase-line-height-normal': 1.4 },
      hooks: { '--enchase-input-height': '2.25rem' }
    }
  },
  defaults: { labelPlacement: 'stacked' }
} as const satisfies ThemeStyle

const densityTokens = {
  '--enchase-hit-size': '28px',
  '--enchase-hit-size-lg': '44px',
  '--enchase-control-height-sm': '1.5rem',
  '--enchase-control-height-md': '1.75rem',
  '--enchase-control-height-lg': '2.25rem',
  '--enchase-space-xs': '0.125rem',
  '--enchase-space-sm': '0.25rem',
  '--enchase-space-md': '0.5rem',
  '--enchase-space-lg': '0.75rem',
  '--enchase-space-xl': '1rem',
  '--enchase-space-2xl': '1.5rem',
  '--enchase-space-3xl': '2rem',
  '--enchase-font-size-xs': '0.6875rem',
  '--enchase-font-size-sm': '0.8125rem',
  '--enchase-font-size-base': '0.9375rem',
  '--enchase-font-size-lg': '1rem',
  '--enchase-font-size-xl': '1.25rem',
  '--enchase-font-size-2xl': '1.5rem',
  '--enchase-font-size-3xl': '1.75rem',
  '--enchase-font-size-4xl': '2.25rem',
  '--enchase-font-size-5xl': '3rem',
  '--enchase-line-height-none': 1,
  '--enchase-line-height-tight': 1.1,
  '--enchase-line-height-snug': 1.3,
  '--enchase-line-height-normal': 1.4,
  '--enchase-line-height-relaxed': 1.5
} as const satisfies NonNullable<NonNullable<ThemeStyle['density']>['compact']>['tokens']

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

  it('accepts a value for each of the seven steps of the spacing scale', () => {
    const spacing = { xs: '2px', sm: '4px', md: '8px', lg: '12px', xl: '16px', '2xl': '24px', '3xl': '32px' }

    expect(() => assertStyle({ base: { spacing } })).not.toThrow()
    expect(() => defineStyle({ base: { spacing } })).not.toThrow()
    expect(createTheme({ style: defineStyle({ base: { spacing } }) }).base.spacing).toEqual(spacing)
  })

  it('accepts the 26 tokens of the compact density, each with a value of its own kind, and a hook next to them', () => {
    const style = { density: { compact: { tokens: densityTokens, hooks: { '--enchase-input-height': '2rem', '--enchase-sidebar-item-control-height': 'var(--enchase-control-height-md)' } } } } satisfies ThemeStyle

    expect(Object.keys(densityTokens)).toHaveLength(26)
    expect(() => assertStyle(style)).not.toThrow()
    expect(() => defineStyle(style)).not.toThrow()
  })

  it('takes a density, a compact density, tokens or hooks that are undefined as if they were not there', () => {
    expect(() => defineStyle({ density: undefined })).not.toThrow()
    expect(() => defineStyle({ density: {} })).not.toThrow()
    expect(() => defineStyle({ density: { compact: undefined } })).not.toThrow()
    expect(() => defineStyle({ density: { compact: {} } })).not.toThrow()
    expect(() => defineStyle({ density: { compact: { tokens: undefined, hooks: undefined } } })).not.toThrow()
    expect(() => defineStyle({ density: { compact: { tokens: {}, hooks: {} } } })).not.toThrow()
  })

  it('freezes the density down to its tokens and hooks, and leaves the object it was given alone', () => {
    const input = { density: { compact: { tokens: { '--enchase-space-md': '0.5rem' }, hooks: { '--enchase-input-height': '2rem' } } } } as ThemeStyle
    const defined = defineStyle(input)

    expect(defined).not.toBe(input)
    expect(defined).toEqual(input)
    expect(Object.isFrozen(defined.density)).toBe(true)
    expect(Object.isFrozen(defined.density?.compact)).toBe(true)
    expect(Object.isFrozen(defined.density?.compact?.tokens)).toBe(true)
    expect(Object.isFrozen(defined.density?.compact?.hooks)).toBe(true)
    expect(Object.isFrozen(input.density)).toBe(false)
    expect(Object.isFrozen(input.density?.compact?.tokens)).toBe(false)
    expect(() => {
      ;(defined.density?.compact?.tokens as Record<string, string>)['--enchase-space-md'] = '1rem'
    }).toThrow(TypeError)
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
    expect(() => createTheme({ style: 'shadcn' } as unknown as ThemeInput)).toThrow("import { shadcn } from 'enchase/styles/shadcn'")
  })

  it('rejects what is not an object, and a section that does not exist', () => {
    expect(() => createTheme({ style: 3 } as unknown as ThemeInput)).toThrow('Expected an object for "style"')
    expect(() => createTheme({ style: [] } as unknown as ThemeInput)).toThrow('Expected an object for "style"')
    expect(() => createTheme({ style: { colors: {} } } as unknown as ThemeInput)).toThrow('Unknown style section "colors"')
  })

  it('takes the tokens, the corners, the type, the colors, the shadows, the hooks and the defaults from the style', () => {
    const theme = createTheme({ style: defineStyle(full) })

    expect(theme.base.spacing).toEqual({ ...baseTokens.spacing, sm: '0.375rem', md: '0.75rem' })
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

  it('takes a step of the spacing scale from the style, keeps the other steps and writes it on the root', () => {
    const theme = createTheme({ style: defineStyle({ base: { spacing: { md: '0.75rem' } } }) })
    const rootRules = (themeCss(theme).match(/:root \{[^}]*\}/g) ?? []).join('\n')
    const defaultRootRules = (themeCss(defaultTheme).match(/:root \{[^}]*\}/g) ?? []).join('\n')

    expect(theme.base.spacing).toEqual({ ...baseTokens.spacing, md: '0.75rem' })
    expect({ ...theme.base, spacing: baseTokens.spacing }).toEqual(baseTokens)
    expect(rootRules).toContain('--enchase-space-md: 0.75rem;')
    expect(rootRules).not.toContain('--enchase-space-md: 1rem;')
    expect(rootRules).toBe(defaultRootRules.replace('--enchase-space-md: 1rem;', '--enchase-space-md: 0.75rem;'))
  })

  it('leaves the default theme and the base tokens as they are when a style sets the spacing', () => {
    const style = defineStyle({ base: { spacing: { xs: '0.125rem', md: '0.75rem', '3xl': '5rem' } } })
    const before = JSON.stringify([baseTokens, defaultTheme])
    const theme = createTheme({ style })

    expect(theme.base.spacing).toEqual({ ...baseTokens.spacing, xs: '0.125rem', md: '0.75rem', '3xl': '5rem' })
    expect(theme.base.spacing).not.toBe(baseTokens.spacing)
    expect(JSON.stringify([baseTokens, defaultTheme])).toBe(before)
    expect(createTheme().base).toBe(baseTokens)
    expect(themeCss(createTheme())).toBe(themeCss(defaultTheme))
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

  it('checks again the density of an object that was not made by defineStyle, so a change made after the first use is caught', () => {
    const raw = { density: { compact: { tokens: { '--enchase-space-md': '0.5rem' } } } } as ThemeStyle

    expect(() => createTheme({ style: raw })).not.toThrow()

    raw.density = { compact: { tokens: { '--enchase-radius-md': '0.25rem' } } } as never

    expect(() => createTheme({ style: raw })).toThrow('Unknown density token "style.density.compact.tokens.--enchase-radius-md"')
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
    ['a spacing step that does not exist', { base: { spacing: { xxl: '5rem' } } }, 'Unknown base token "style.base.spacing.xxl"'],
    ['a spacing value that closes the rule', { base: { spacing: { md: '1rem; color: red' } } }, 'Invalid CSS value for "style.base.spacing.md"'],
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
    ['a density that is not an object', { density: 'compact' }, 'Expected an object for "style.density"'],
    ['a density that is a list', { density: [] }, 'Expected an object for "style.density"'],
    ['a density that does not exist', { density: { spacious: {} } }, 'Unknown density token "style.density.spacious"'],
    ['a density that is the default one', { density: { default: {} } }, 'Unknown density token "style.density.default"'],
    ['a compact density that is not an object', { density: { compact: 'tight' } }, 'Expected an object for "style.density.compact"'],
    ['a section of the compact density that does not exist', { density: { compact: { colors: {} } } }, 'Unknown density token "style.density.compact.colors"'],
    ['density tokens that are not an object', { density: { compact: { tokens: '0.5rem' } } }, 'Expected an object for "style.density.compact.tokens"'],
    ['a density token that does not exist', { density: { compact: { tokens: { '--enchase-radius-md': '0.25rem' } } } }, 'Unknown density token "style.density.compact.tokens.--enchase-radius-md"'],
    ['a density token without the prefix', { density: { compact: { tokens: { 'space-md': '0.5rem' } } } }, 'Unknown density token "style.density.compact.tokens.space-md"'],
    ['a density token that is a hook', { density: { compact: { tokens: { '--enchase-input-height': '2rem' } } } }, 'Unknown density token "style.density.compact.tokens.--enchase-input-height"'],
    ['a step of the spacing scale that does not exist', { density: { compact: { tokens: { '--enchase-space-xxl': '5rem' } } } }, 'Unknown density token "style.density.compact.tokens.--enchase-space-xxl"'],
    ['a density token value that closes the rule', { density: { compact: { tokens: { '--enchase-space-md': '0.5rem; color: red' } } } }, 'Invalid CSS value for "style.density.compact.tokens.--enchase-space-md"'],
    ['a density token value that is not a string', { density: { compact: { tokens: { '--enchase-hit-size': 32 } } } }, 'Invalid CSS value for "style.density.compact.tokens.--enchase-hit-size"'],
    ['a density token value that loads an address', { density: { compact: { tokens: { '--enchase-control-height-md': 'url(https://example.com/a.png)' } } } }, 'Invalid CSS value for "style.density.compact.tokens.--enchase-control-height-md"'],
    ['a density font size without a unit', { density: { compact: { tokens: { '--enchase-font-size-base': '15' } } } }, 'Invalid font size for "style.density.compact.tokens.--enchase-font-size-base"'],
    ['a density font size that is a number', { density: { compact: { tokens: { '--enchase-font-size-sm': 14 } } } }, 'Invalid font size for "style.density.compact.tokens.--enchase-font-size-sm"'],
    ['a density line height below one', { density: { compact: { tokens: { '--enchase-line-height-normal': 0.5 } } } }, 'Invalid line height for "style.density.compact.tokens.--enchase-line-height-normal"'],
    ['a density line height written as a string', { density: { compact: { tokens: { '--enchase-line-height-tight': '1.2' } } } }, 'Invalid line height for "style.density.compact.tokens.--enchase-line-height-tight"'],
    ['density hooks that are not an object', { density: { compact: { hooks: '2rem' } } }, 'Expected an object for "style.density.compact.hooks"'],
    ['a density hook without the prefix', { density: { compact: { hooks: { '--input-height': '2rem' } } } }, 'Invalid hook name "--input-height" in "style.density.compact.hooks"'],
    ['a density hook that is a token of the theme', { density: { compact: { hooks: { '--enchase-space-md': '0.5rem' } } } }, '"--enchase-space-md" in "style.density.compact.hooks" is a token of the theme'],
    ['a density hook that is not a string', { density: { compact: { hooks: { '--enchase-input-height': 32 } } } }, 'Invalid CSS value for "style.density.compact.hooks.--enchase-input-height"'],
    ['a density hook value that ends the declaration', { density: { compact: { hooks: { '--enchase-input-height': '2rem; color: red' } } } }, 'Invalid CSS value for "style.density.compact.hooks.--enchase-input-height"'],
    ['a density hook that reads a color of the theme', { density: { compact: { hooks: { '--enchase-button-color-outline': 'var(--enchase-color-text-primary)' } } } }, '"style.density.compact.hooks.--enchase-button-color-outline" reads a color or a shadow of the theme'],
    ['a default that does not exist', { defaults: { density: 'compact' } }, 'Unknown default "style.defaults.density"'],
    ['a label placement that does not exist', { defaults: { labelPlacement: 'left' } }, 'Invalid label placement for "style.defaults.labelPlacement"']
  ]

  it.each(rejected)('rejects %s', (_, style, message) => {
    expect(() => defineStyle(asStyle(style))).toThrow(message)
    expect(() => createTheme({ style: asStyle(style) })).toThrow(message)
  })

  const outsideTheList = [
    '--enchase-space-4xl',
    '--enchase-hit-size-md',
    '--enchase-control-height-xl',
    '--enchase-font-size-6xl',
    '--enchase-line-height-loose',
    '--enchase-font-weight-bold',
    '--enchase-letter-spacing-control',
    '--enchase-radius-md',
    '--enchase-focus-width',
    '--enchase-border-width',
    '--enchase-halo-size',
    '--enchase-state-hover',
    '--enchase-color-primary',
    '--enchase-shadow-sm',
    '--enchase-transition-fast',
    '--enchase-motion-duration-fast',
    '--enchase-z-modal',
    '--enchase-font-primary'
  ]

  it.each(outsideTheList)('rejects %s as a token of the compact density, which only has the 26 tokens of the closed list', (name) => {
    const style = asStyle({ density: { compact: { tokens: { [name]: '1rem' } } } })
    const message = `Unknown density token "style.density.compact.tokens.${name}"`

    expect(() => defineStyle(style)).toThrow(message)
    expect(() => createTheme({ style })).toThrow(message)
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
