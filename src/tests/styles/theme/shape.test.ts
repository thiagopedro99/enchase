import { describe, expect, it } from 'vitest'

import { baseTokens, defaultTheme } from '@styles/tokens/index.ts'
import { assertShapePreset, assertValidRadius, isShapePreset, isValidRadius, shapePresets } from '@styles/theme/shape.ts'
import { layoutVariables, themeCss } from '@styles/css/declarations.ts'
import { createTheme } from '@styles/theme/createTheme.ts'
import { validateTheme } from '@styles/theme/validateTheme.ts'

const pixels = (value: string) => (value.endsWith('rem') ? parseFloat(value) * 16 : parseFloat(value))

const scale = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const

const presetNames = ['pill', 'soft', 'square'] as const

describe('the shape presets', () => {
  it('have exactly the radius tokens of the base theme', () => {
    for (const name of presetNames) expect(Object.keys(shapePresets[name]), name).toEqual(Object.keys(baseTokens.borderRadius))
  })

  it('keep the pill as the look the theme always had, with buttons that follow the full radius', () => {
    expect(shapePresets.pill).toBe(baseTokens.borderRadius)
    expect(baseTokens.borderRadius.button).toBe('var(--enchase-radius-full)')
    expect(baseTokens.borderRadius.full).toBe('9999px')
  })

  it('give every token a length, except the pill button that points to the full radius', () => {
    for (const name of presetNames) {
      for (const [token, value] of Object.entries(shapePresets[name])) {
        if (name === 'pill' && token === 'button') continue

        expect(isValidRadius(value), `${name}.${token}`).toBe(true)
      }
    }
  })

  it('grow with the size of the surface, never shrinking from one step to the next', () => {
    for (const name of presetNames) {
      const values = scale.map((step) => pixels(shapePresets[name][step]))

      expect([...values].sort((first, second) => first - second), name).toEqual(values)
    }
  })

  it('get squarer from pill to soft to square on every step of the scale', () => {
    for (const token of scale) {
      expect(pixels(shapePresets.soft[token]), token).toBeLessThanOrEqual(pixels(shapePresets.pill[token]))
      expect(pixels(shapePresets.square[token]), token).toBeLessThanOrEqual(pixels(shapePresets.soft[token]))
    }
  })

  it('make the buttons and the fields square off from the pill to the soft to the square', () => {
    expect(pixels(shapePresets.soft.button)).toBeLessThan(pixels(shapePresets.pill.full))
    expect(pixels(shapePresets.square.button)).toBeLessThan(pixels(shapePresets.soft.button))
    expect(pixels(shapePresets.square.control)).toBeLessThan(pixels(shapePresets.pill.control))
    expect(shapePresets.soft.control).toBe(shapePresets.soft.button)
  })

  it('keep the full radius a pill in every preset, for the switch, the radio and the avatar', () => {
    for (const name of presetNames) expect(shapePresets[name].full, name).toBe('9999px')
  })
})

describe('createTheme with a shape', () => {
  it('returns the default theme for the pill and when no shape is given', () => {
    expect(createTheme({ shape: 'pill' })).toEqual(defaultTheme)
    expect(createTheme({ shape: 'pill' }).base).toBe(baseTokens)
    expect(createTheme({}).base).toBe(baseTokens)
  })

  it('swaps only the radius tokens', () => {
    for (const name of ['soft', 'square'] as const) {
      const theme = createTheme({ shape: name })

      expect(theme.base.borderRadius, name).toEqual(shapePresets[name])
      expect(theme.base.fonts).toBe(baseTokens.fonts)
      expect(theme.base.motion).toBe(baseTokens.motion)
      expect(theme.base.transitions).toBe(baseTokens.transitions)
      expect(theme.base.spacing).toBe(baseTokens.spacing)
      expect(theme.light).toEqual(defaultTheme.light)
      expect(theme.dark).toEqual(defaultTheme.dark)
    }
  })

  it('goes with the other sections', () => {
    const theme = createTheme({ shape: 'square', brand: '#0F766E', fonts: { primary: 'Inter' }, motion: { duration: { base: '200ms' } } })

    expect(theme.base.borderRadius).toEqual(shapePresets.square)
    expect(theme.base.fonts.primary).toBe('Inter')
    expect(theme.base.motion.duration.base).toBe('200ms')
    expect(theme.light.colors.primary).not.toBe(defaultTheme.light.colors.primary)
  })

  it('does not touch the contrast of the colors', () => {
    expect(validateTheme(createTheme({ shape: 'square' }))).toEqual([])
  })

  it('throws for a shape that is not a preset, naming the ones that are', () => {
    expect(() => createTheme({ shape: 'round' } as never)).toThrow('Unknown shape "round": use pill, soft, square')
    expect(() => createTheme({ shape: 3 } as never)).toThrow(/Unknown shape 3/)
    expect(() => createTheme({ shape: 'toString' } as never)).toThrow(/Unknown shape/)
  })

  it('writes the radius variables of the preset in the css of the theme', () => {
    const css = themeCss(createTheme({ shape: 'square' }))

    expect(css).toContain('--enchase-radius-button: 0.25rem;')
    expect(css).toContain('--enchase-radius-control: 0.25rem;')
    expect(css).toContain('--enchase-radius-full: 9999px;')
    expect(themeCss(defaultTheme)).toContain('--enchase-radius-button: var(--enchase-radius-full);')
  })

  it('declares one variable for the button role, next to the others', () => {
    const variables = layoutVariables(createTheme({ shape: 'soft' }).base)

    expect(variables['--enchase-radius-button']).toBe('0.75rem')
    expect(Object.keys(variables)).toEqual(Object.keys(layoutVariables(baseTokens)))
  })
})

describe('createTheme with radius overrides', () => {
  it('changes one token and leaves the rest of the preset alone', () => {
    const theme = createTheme({ shape: 'soft', radius: { button: '1rem' } })

    expect(theme.base.borderRadius.button).toBe('1rem')
    expect(theme.base.borderRadius.control).toBe(shapePresets.soft.control)
    expect(theme.base.borderRadius.full).toBe('9999px')
  })

  it('works over the pill when no shape is given', () => {
    const theme = createTheme({ radius: { button: '0.5rem', xl: '2rem' } })

    expect(theme.base.borderRadius.button).toBe('0.5rem')
    expect(theme.base.borderRadius.xl).toBe('2rem')
    expect(theme.base.borderRadius.md).toBe(baseTokens.borderRadius.md)
  })

  it('accepts zero, rem, em, px and percent', () => {
    const theme = createTheme({ radius: { xs: '0', sm: '4px', md: '.5em', lg: '0.75rem', xl: '50%', full: '9999px' } })

    expect(theme.base.borderRadius).toMatchObject({ xs: '0', sm: '4px', md: '.5em', lg: '0.75rem', xl: '50%', full: '9999px' })
  })

  it('ignores a token that is explicitly undefined', () => {
    expect(createTheme({ radius: { button: undefined, control: '1rem' } }).base.borderRadius.button).toBe('var(--enchase-radius-full)')
  })

  it('throws for a value that is not a radius, naming the token', () => {
    for (const value of ['', '-1px', '12', '1vh', 'calc(1px)', 'auto', '1 rem', '1rem 2rem', '10001px', '101%', '1001rem', 5, null]) {
      expect(() => createTheme({ radius: { button: value } } as never), String(value)).toThrow('Invalid radius for "radius.button"')
    }
  })

  it('throws for a token that does not exist, including none', () => {
    expect(() => createTheme({ radius: { huge: '1rem' } } as never)).toThrow('Unknown radius token "radius.huge"')
    expect(() => createTheme({ radius: { none: '1rem' } } as never)).toThrow('Unknown radius token "radius.none"')
    expect(() => createTheme({ radius: 'round' } as never)).toThrow('Expected an object for "radius"')
  })

  it('does not change the presets or the default theme', () => {
    const before = JSON.stringify([shapePresets, defaultTheme])

    createTheme({ shape: 'soft', radius: { button: '1rem', xl: '2rem' } })
    createTheme({ radius: { control: '1rem' } })

    expect(JSON.stringify([shapePresets, defaultTheme])).toBe(before)
  })
})

describe('the radius validators', () => {
  it('accept a length of the sizes a corner can have', () => {
    for (const value of ['0', '0px', '0.25rem', '.5rem', '8px', '1.5em', '50%', '100%', '9999px', '10000px']) expect(isValidRadius(value), value).toBe(true)
  })

  it('refuse everything else', () => {
    for (const value of ['', ' ', '1', '-1px', '1pt', 'inherit', 'var(--x)', '1rem ', undefined, 4, {}]) expect(isValidRadius(value), String(value)).toBe(false)
  })

  it('throw with the name they were given', () => {
    expect(() => assertValidRadius('radius.card', 'big')).toThrow('Invalid radius for "radius.card": "big"')
    expect(assertValidRadius('radius.card', '1rem')).toBe('1rem')
  })

  it('know the presets by name only', () => {
    expect(isShapePreset('square')).toBe(true)
    expect(isShapePreset('constructor')).toBe(false)
    expect(assertShapePreset('soft')).toBe('soft')
  })
})
