import { assertValidFontFamily, assertValidFontSize, assertValidFontWeight } from './font.ts'
import { assertShapePreset, assertValidRadius, shapePresets } from './shape.ts'
import { mergeMotion, motionTransitions } from './motion.ts'
import { baseTokens, darkTheme, lightTheme } from '../tokens/index.ts'
import { assertValidColor } from './color.ts'
import { brandPalette } from './brand.ts'
import { themeModes } from '../tokens/types.ts'

import type { BaseTokens, ColorTokens, ModeTokens, ThemeSet } from '../tokens/types.ts'
import type { BrandColors } from './brand.ts'
import type { MotionOverrides } from './motion.ts'
import type { RadiusOverrides, RadiusTokens, ShapePreset } from './shape.ts'

type DeepPartial<T> = { [K in keyof T]?: T[K] extends string ? string : DeepPartial<T[K]> }

export type ThemeOverrides = { colors?: DeepPartial<ColorTokens> }

export type FontOverrides = {
  primary?: string
  mono?: string
  sizes?: Partial<BaseTokens['fonts']['sizes']>
  weights?: Partial<BaseTokens['fonts']['weights']>
}

export type ThemeInput = { brand?: string; fonts?: FontOverrides; motion?: MotionOverrides; shape?: ShapePreset; radius?: RadiusOverrides; light?: ThemeOverrides; dark?: ThemeOverrides }

type Validate = (name: string, value: unknown) => string | number

type Validators = Validate | { [key: string]: Validators }

const inputSections = [...themeModes, 'brand', 'fonts', 'motion', 'shape', 'radius']

const customizableSections = ['colors']

const fontValidators: Validators = {
  primary: assertValidFontFamily,
  mono: assertValidFontFamily,
  sizes: assertValidFontSize,
  weights: assertValidFontWeight
}

const hasOwn = (target: object, key: string) => Object.prototype.hasOwnProperty.call(target, key)

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value)

const mergeTokens = (base: Record<string, unknown>, overrides: unknown, path: string, validators: Validators, kind: 'color' | 'font' | 'radius'): Record<string, unknown> => {
  if (!isRecord(overrides)) throw new Error(`Expected an object for "${path}"`)

  const result = { ...base }

  for (const [key, value] of Object.entries(overrides)) {
    const tokenPath = `${path}.${key}`

    if (!hasOwn(base, key)) throw new Error(`Unknown ${kind} token "${tokenPath}"`)
    if (value === undefined) continue

    const validator = typeof validators === 'function' ? validators : validators[key]
    const current = base[key]

    result[key] = isRecord(current) ? mergeTokens(current, value, tokenPath, validator, kind) : (validator as Validate)(tokenPath, value)
  }

  return result
}

const mergeMode = (base: ModeTokens, overrides: ThemeOverrides | undefined, mode: string): ModeTokens => {
  if (overrides !== undefined && !isRecord(overrides)) throw new Error(`Expected an object for "${mode}"`)

  for (const section of Object.keys(overrides ?? {})) {
    if (!customizableSections.includes(section)) throw new Error(`Unknown theme section "${mode}.${section}"`)
  }

  if (overrides?.colors === undefined) return base

  return { ...base, colors: mergeTokens(base.colors, overrides.colors, `${mode}.colors`, assertValidColor, 'color') as ColorTokens }
}

const withBrand = (theme: ModeTokens, palette: BrandColors | undefined, mode: string): ModeTokens => (palette === undefined ? theme : { ...theme, colors: mergeTokens(theme.colors, palette, `${mode}.colors`, assertValidColor, 'color') as ColorTokens })

const base = (fonts: BaseTokens['fonts'], motion: BaseTokens['motion'], borderRadius: RadiusTokens): BaseTokens => {
  if (fonts === baseTokens.fonts && motion === baseTokens.motion && borderRadius === baseTokens.borderRadius) return baseTokens

  return { ...baseTokens, fonts, motion, borderRadius, transitions: motion === baseTokens.motion ? baseTokens.transitions : motionTransitions(motion) }
}

const resolveRadius = (shape: ShapePreset | undefined, overrides: RadiusOverrides | undefined): RadiusTokens => {
  const preset = shape === undefined ? shapePresets.pill : shapePresets[assertShapePreset(shape)]

  if (overrides === undefined) return preset

  const { none, ...overridable } = preset

  return { none, ...mergeTokens(overridable, overrides, 'radius', assertValidRadius, 'radius') } as RadiusTokens
}

export const createTheme = (input: ThemeInput = {}): ThemeSet => {
  if (!isRecord(input)) throw new Error('Expected an object for the theme input')

  for (const section of Object.keys(input)) {
    if (!inputSections.includes(section)) throw new Error(`Unknown theme mode "${section}"`)
  }

  const fonts = input.fonts === undefined ? baseTokens.fonts : (mergeTokens(baseTokens.fonts, input.fonts, 'fonts', fontValidators, 'font') as BaseTokens['fonts'])

  const motion = input.motion === undefined ? baseTokens.motion : mergeMotion(input.motion)
  const radius = resolveRadius(input.shape, input.radius)
  const palette = input.brand === undefined ? undefined : brandPalette(input.brand)

  return {
    base: base(fonts, motion, radius),
    light: mergeMode(withBrand(lightTheme, palette?.light, 'light'), input.light, 'light'),
    dark: mergeMode(withBrand(darkTheme, palette?.dark, 'dark'), input.dark, 'dark')
  }
}
