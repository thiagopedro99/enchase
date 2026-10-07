import { assertValidColor } from './colorFormat.ts'
import { assertValidFontFamily, assertValidFontSize, assertValidFontWeight } from './fontFormat.ts'
import { darkTheme, lightTheme } from './themes/index.ts'

import type { Theme } from './themes/index.ts'

type DeepPartial<T> = { [K in keyof T]?: T[K] extends string ? string : DeepPartial<T[K]> }

export type ThemeOverrides = { colors?: DeepPartial<Theme['colors']> }

export type FontOverrides = {
  primary?: string
  mono?: string
  sizes?: Partial<Theme['fonts']['sizes']>
  weights?: Partial<Theme['fonts']['weights']>
}

export type ThemeInput = { fonts?: FontOverrides; light?: ThemeOverrides; dark?: ThemeOverrides }

export type ThemeSet = { light: Theme; dark: Theme }

const themeModes = ['light', 'dark'] as const

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

const mergeFonts = (base: Theme['fonts'], overrides: unknown): Theme['fonts'] => {
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

  return result as Theme['fonts']
}

const mergeTheme = (base: Theme, overrides: ThemeOverrides | undefined, fonts: Theme['fonts'], mode: string): Theme => {
  if (overrides !== undefined && !isRecord(overrides)) throw new Error(`Expected an object for "${mode}"`)

  for (const section of Object.keys(overrides ?? {})) {
    if (!customizableSections.includes(section)) throw new Error(`Unknown theme section "${mode}.${section}"`)
  }

  const colors = overrides?.colors === undefined ? base.colors : (mergeColors(base.colors, overrides.colors, `${mode}.colors`) as Theme['colors'])

  if (colors === base.colors && fonts === base.fonts) return base

  return { ...base, colors, fonts }
}

export const createTheme = (input: ThemeInput = {}): ThemeSet => {
  if (!isRecord(input)) throw new Error('Expected an object for the theme input')

  for (const section of Object.keys(input)) {
    if (!inputSections.includes(section)) throw new Error(`Unknown theme mode "${section}"`)
  }

  const fonts = mergeFonts(lightTheme.fonts, input.fonts)

  return { light: mergeTheme(lightTheme, input.light, fonts, 'light'), dark: mergeTheme(darkTheme, input.dark, fonts, 'dark') }
}
