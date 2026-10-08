import { assertValidColor } from './color.ts'
import { assertValidFontFamily, assertValidFontSize, assertValidFontWeight } from './font.ts'
import { baseTokens, darkTheme, lightTheme } from '../tokens/index.ts'
import { themeModes } from '../tokens/types.ts'

import type { BaseTokens, ColorTokens, ModeTokens, ThemeSet } from '../tokens/types.ts'

type DeepPartial<T> = { [K in keyof T]?: T[K] extends string ? string : DeepPartial<T[K]> }

export type ThemeOverrides = { colors?: DeepPartial<ColorTokens> }

export type FontOverrides = {
  primary?: string
  mono?: string
  sizes?: Partial<BaseTokens['fonts']['sizes']>
  weights?: Partial<BaseTokens['fonts']['weights']>
}

export type ThemeInput = { fonts?: FontOverrides; light?: ThemeOverrides; dark?: ThemeOverrides }

const inputSections = [...themeModes, 'fonts']

const customizableSections = ['colors']

const fontFamilyTokens = ['primary', 'mono']

const fontGroupValidators: Record<string, (name: string, value: unknown) => string | number> = {
  sizes: assertValidFontSize,
  weights: assertValidFontWeight
}

const hasOwn = (target: object, key: string) => Object.prototype.hasOwnProperty.call(target, key)

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value)

const mergeColors = (base: Record<string, unknown>, overrides: unknown, path: string): Record<string, unknown> => {
  if (!isRecord(overrides)) throw new Error(`Expected an object for "${path}"`)

  const result = { ...base }

  for (const [key, value] of Object.entries(overrides)) {
    const tokenPath = `${path}.${key}`

    if (!hasOwn(base, key)) throw new Error(`Unknown color token "${tokenPath}"`)
    if (value === undefined) continue

    const current = base[key]

    result[key] = typeof current === 'string' ? assertValidColor(tokenPath, value) : mergeColors(current as Record<string, unknown>, value, tokenPath)
  }

  return result
}

const mergeFontGroup = (base: Record<string, unknown>, overrides: unknown, path: string, validate: (name: string, value: unknown) => string | number) => {
  if (!isRecord(overrides)) throw new Error(`Expected an object for "${path}"`)

  const result = { ...base }

  for (const [key, value] of Object.entries(overrides)) {
    const tokenPath = `${path}.${key}`

    if (!hasOwn(base, key)) throw new Error(`Unknown font token "${tokenPath}"`)
    if (value === undefined) continue

    result[key] = validate(tokenPath, value)
  }

  return result
}

const mergeFonts = (base: BaseTokens['fonts'], overrides: unknown): BaseTokens['fonts'] => {
  if (overrides === undefined) return base
  if (!isRecord(overrides)) throw new Error('Expected an object for "fonts"')

  const result: Record<string, unknown> = { ...base }

  for (const [key, value] of Object.entries(overrides)) {
    const tokenPath = `fonts.${key}`

    if (!hasOwn(base, key)) throw new Error(`Unknown font token "${tokenPath}"`)
    if (value === undefined) continue

    if (fontFamilyTokens.includes(key)) result[key] = assertValidFontFamily(tokenPath, value)
    else result[key] = mergeFontGroup(base[key as 'sizes' | 'weights'], value, tokenPath, fontGroupValidators[key])
  }

  return result as BaseTokens['fonts']
}

const mergeMode = (base: ModeTokens, overrides: ThemeOverrides | undefined, mode: string): ModeTokens => {
  if (overrides !== undefined && !isRecord(overrides)) throw new Error(`Expected an object for "${mode}"`)

  for (const section of Object.keys(overrides ?? {})) {
    if (!customizableSections.includes(section)) throw new Error(`Unknown theme section "${mode}.${section}"`)
  }

  if (overrides?.colors === undefined) return base

  return { ...base, colors: mergeColors(base.colors, overrides.colors, `${mode}.colors`) as ColorTokens }
}

export const createTheme = (input: ThemeInput = {}): ThemeSet => {
  if (!isRecord(input)) throw new Error('Expected an object for the theme input')

  for (const section of Object.keys(input)) {
    if (!inputSections.includes(section)) throw new Error(`Unknown theme mode "${section}"`)
  }

  const fonts = mergeFonts(baseTokens.fonts, input.fonts)

  return {
    base: fonts === baseTokens.fonts ? baseTokens : { ...baseTokens, fonts },
    light: mergeMode(lightTheme, input.light, 'light'),
    dark: mergeMode(darkTheme, input.dark, 'dark')
  }
}
