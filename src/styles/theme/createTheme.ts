import { assertValidFontFamily, assertValidFontSize, assertValidFontWeight } from './font.ts'
import { assertShapePreset, assertValidRadius, shapePresets } from './shape.ts'
import { mergeMotion, motionTransitions } from './motion.ts'
import { baseTokens, darkTheme, lightTheme } from '../tokens/index.ts'
import { assertValidColor } from './color.ts'
import { brandPalette } from './brand.ts'
import { assertStyleName, themeStyles } from '../presets/index.ts'
import { themeModes } from '../tokens/types.ts'

import type { BaseTokens, ColorTokens, HookValues, ModeTokens, ThemeSet } from '../tokens/types.ts'
import type { BrandColors } from './brand.ts'
import type { MotionOverrides } from './motion.ts'
import type { StyleDefinition, StyleModeDefinition, StyleName } from '../presets/types.ts'
import type { RadiusOverrides, RadiusTokens, ShapePreset } from './shape.ts'

type DeepPartial<T> = { [K in keyof T]?: T[K] extends string ? string : DeepPartial<T[K]> }

export type ThemeOverrides = { colors?: DeepPartial<ColorTokens> }

export type FontOverrides = {
  primary?: string
  mono?: string
  sizes?: Partial<BaseTokens['fonts']['sizes']>
  weights?: Partial<BaseTokens['fonts']['weights']>
}

export type ThemeInput = { style?: StyleName; brand?: string; fonts?: FontOverrides; motion?: MotionOverrides; shape?: ShapePreset; radius?: RadiusOverrides; light?: ThemeOverrides; dark?: ThemeOverrides }

type Validate = (name: string, value: unknown) => string | number

type Validators = Validate | { [key: string]: Validators }

const inputSections = [...themeModes, 'style', 'brand', 'fonts', 'motion', 'shape', 'radius']

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

const overlay = <Tokens extends object>(base: Tokens, partial: unknown): Tokens => {
  if (!isRecord(partial)) return base

  const result: Record<string, unknown> = { ...(base as Record<string, unknown>) }

  for (const [key, value] of Object.entries(partial)) {
    const current = result[key]

    result[key] = isRecord(current) && isRecord(value) ? overlay(current, value) : value
  }

  return result as Tokens
}

const brandOf = (palette: BrandColors | undefined, roles: StyleDefinition['brand']): BrandColors | undefined => {
  if (palette === undefined || roles === undefined) return palette

  return Object.fromEntries(Object.entries(palette).filter(([key]) => roles.includes(key as keyof BrandColors))) as BrandColors
}

const withBrand = (theme: ModeTokens, palette: BrandColors | undefined, mode: string): ModeTokens => (palette === undefined ? theme : { ...theme, colors: mergeTokens(theme.colors, palette, `${mode}.colors`, assertValidColor, 'color') as ColorTokens })

const withStyle = (theme: ModeTokens, definition: StyleModeDefinition | undefined, shared: HookValues | undefined): ModeTokens => {
  const hooks = { ...shared, ...definition?.hooks }
  const colors = overlay(theme.colors, definition?.colors)
  const shadows = definition?.shadows === undefined ? theme.shadows : { ...theme.shadows, ...definition.shadows }

  if (colors === theme.colors && shadows === theme.shadows && Object.keys(hooks).length === 0) return theme

  return { colors, shadows, ...(Object.keys(hooks).length > 0 ? { hooks } : {}) }
}

const base = (fonts: BaseTokens['fonts'], motion: BaseTokens['motion'], borderRadius: RadiusTokens, definition: StyleDefinition): BaseTokens => {
  const styled = overlay(baseTokens, definition.base)

  if (styled === baseTokens && fonts === baseTokens.fonts && motion === baseTokens.motion && borderRadius === baseTokens.borderRadius) return baseTokens

  return { ...styled, fonts, motion, borderRadius, transitions: motion === baseTokens.motion ? baseTokens.transitions : motionTransitions(motion) }
}

const resolveRadius = (shape: ShapePreset | undefined, overrides: RadiusOverrides | undefined, styled: RadiusTokens | undefined): RadiusTokens => {
  const preset = shape === undefined ? (styled ?? shapePresets.pill) : shapePresets[assertShapePreset(shape)]

  if (overrides === undefined) return preset

  const { none, ...overridable } = preset

  return { none, ...mergeTokens(overridable, overrides, 'radius', assertValidRadius, 'radius') } as RadiusTokens
}

export const createTheme = (input: ThemeInput = {}): ThemeSet => {
  if (!isRecord(input)) throw new Error('Expected an object for the theme input')

  for (const section of Object.keys(input)) {
    if (!inputSections.includes(section)) throw new Error(`Unknown theme mode "${section}"`)
  }

  const definition = themeStyles[assertStyleName(input.style ?? 'enchase')]
  const styledFonts = overlay(baseTokens.fonts, definition.fonts)
  const fonts = input.fonts === undefined ? styledFonts : (mergeTokens(styledFonts, input.fonts, 'fonts', fontValidators, 'font') as BaseTokens['fonts'])

  const motion = input.motion === undefined ? baseTokens.motion : mergeMotion(input.motion)
  const radius = resolveRadius(input.shape, input.radius, definition.radius)
  const palette = input.brand === undefined ? undefined : brandPalette(input.brand)

  return {
    base: base(fonts, motion, radius, definition),
    light: mergeMode(withBrand(withStyle(lightTheme, definition.light, definition.colorHooks), brandOf(palette?.light, definition.brand), 'light'), input.light, 'light'),
    dark: mergeMode(withBrand(withStyle(darkTheme, definition.dark, definition.colorHooks), brandOf(palette?.dark, definition.brand), 'dark'), input.dark, 'dark'),
    ...(definition.hooks === undefined ? {} : { hooks: definition.hooks }),
    ...(definition.defaults === undefined ? {} : { defaults: definition.defaults })
  }
}
