import { assertValidFontFamily, assertValidFontSize, assertValidFontWeight } from './font.ts'
import { assertShapePreset, assertValidRadius, shapePresets } from './shape.ts'
import { isRecord, mergeTokens } from './merge.ts'
import { mergeMotion, motionTransitions } from './motion.ts'
import { baseTokens, darkTheme, lightTheme } from '../tokens/index.ts'
import { assertValidColor } from './color.ts'
import { assertStyle } from './style.ts'
import { brandPalette } from './brand.ts'
import { themeModes } from '../tokens/types.ts'

import type { BaseTokens, ColorTokens, HookValues, ModeTokens, ThemeSet } from '../tokens/types.ts'
import type { BrandColors } from './brand.ts'
import type { Validators } from './merge.ts'
import type { MotionOverrides } from './motion.ts'
import type { ThemeStyle, ThemeStyleMode } from './style.ts'
import type { RadiusOverrides, RadiusTokens, ShapePreset } from './shape.ts'

type DeepPartial<T> = { [K in keyof T]?: T[K] extends string ? string : DeepPartial<T[K]> }

export type ThemeOverrides = { colors?: DeepPartial<ColorTokens> }

export type FontOverrides = {
  primary?: string
  mono?: string
  sizes?: Partial<BaseTokens['fonts']['sizes']>
  weights?: Partial<BaseTokens['fonts']['weights']>
}

export type ThemeInput = { style?: ThemeStyle; brand?: string; fonts?: FontOverrides; motion?: MotionOverrides; shape?: ShapePreset; radius?: RadiusOverrides; light?: ThemeOverrides; dark?: ThemeOverrides }

const inputSections = [...themeModes, 'style', 'brand', 'fonts', 'motion', 'shape', 'radius']

const customizableSections = ['colors']

const fontValidators: Validators = {
  primary: assertValidFontFamily,
  mono: assertValidFontFamily,
  sizes: assertValidFontSize,
  weights: assertValidFontWeight
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

const brandOf = (palette: BrandColors | undefined, roles: ThemeStyle['brand']): BrandColors | undefined => {
  if (palette === undefined || roles === undefined) return palette

  return Object.fromEntries(Object.entries(palette).filter(([key]) => roles.includes(key as keyof BrandColors))) as BrandColors
}

const withBrand = (theme: ModeTokens, palette: BrandColors | undefined, mode: string): ModeTokens => (palette === undefined ? theme : { ...theme, colors: mergeTokens(theme.colors, palette, `${mode}.colors`, assertValidColor, 'color') as ColorTokens })

const withStyle = (theme: ModeTokens, definition: ThemeStyleMode | undefined, shared: HookValues | undefined): ModeTokens => {
  const hooks = { ...shared, ...definition?.hooks }
  const colors = overlay(theme.colors, definition?.colors)
  const shadows = definition?.shadows === undefined ? theme.shadows : { ...theme.shadows, ...definition.shadows }

  if (colors === theme.colors && shadows === theme.shadows && Object.keys(hooks).length === 0) return theme

  return { colors, shadows, ...(Object.keys(hooks).length > 0 ? { hooks } : {}) }
}

const base = (fonts: BaseTokens['fonts'], motion: BaseTokens['motion'], borderRadius: RadiusTokens, definition: ThemeStyle): BaseTokens => {
  const styled = overlay(baseTokens, definition.base)

  if (styled === baseTokens && fonts === baseTokens.fonts && motion === baseTokens.motion && borderRadius === baseTokens.borderRadius) return baseTokens

  return { ...styled, fonts, motion, borderRadius, transitions: motion === baseTokens.motion ? baseTokens.transitions : motionTransitions(motion) }
}

const resolveRadius = (shape: ShapePreset | undefined, overrides: RadiusOverrides | undefined, styled: RadiusOverrides | undefined): RadiusTokens => {
  const preset = shape === undefined ? (styled === undefined ? shapePresets.pill : { ...shapePresets.pill, ...styled }) : shapePresets[assertShapePreset(shape)]

  if (overrides === undefined) return preset

  const { none, ...overridable } = preset

  return { none, ...mergeTokens(overridable, overrides, 'radius', assertValidRadius, 'radius') } as RadiusTokens
}

const noStyle: ThemeStyle = {}

const resolveStyle = (style: unknown): ThemeStyle => {
  if (style === undefined || style === null) return noStyle

  if (typeof style === 'string') {
    throw new Error(`Unknown style ${JSON.stringify(style)}: a style is an object, not a name. Import it, as in import { shadcn } from 'enchase/styles', and pass it to createTheme({ style: shadcn })`)
  }

  return assertStyle(style)
}

export const createTheme = (input: ThemeInput = {}): ThemeSet => {
  if (!isRecord(input)) throw new Error('Expected an object for the theme input')

  for (const section of Object.keys(input)) {
    if (!inputSections.includes(section)) throw new Error(`Unknown theme mode "${section}"`)
  }

  const definition = resolveStyle(input.style)
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
