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

type Validate = (name: string, value: unknown) => string | number

type Validators = Validate | { [key: string]: Validators }

const inputSections = [...themeModes, 'fonts']

const customizableSections = ['colors']

const fontValidators: Validators = {
  primary: assertValidFontFamily,
  mono: assertValidFontFamily,
  sizes: assertValidFontSize,
  weights: assertValidFontWeight
}

const hasOwn = (target: object, key: string) => Object.prototype.hasOwnProperty.call(target, key)

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value)

const mergeTokens = (base: Record<string, unknown>, overrides: unknown, path: string, validators: Validators, kind: 'color' | 'font'): Record<string, unknown> => {
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

export const createTheme = (input: ThemeInput = {}): ThemeSet => {
  if (!isRecord(input)) throw new Error('Expected an object for the theme input')

  for (const section of Object.keys(input)) {
    if (!inputSections.includes(section)) throw new Error(`Unknown theme mode "${section}"`)
  }

  const fonts = input.fonts === undefined ? baseTokens.fonts : (mergeTokens(baseTokens.fonts, input.fonts, 'fonts', fontValidators, 'font') as BaseTokens['fonts'])

  return {
    base: fonts === baseTokens.fonts ? baseTokens : { ...baseTokens, fonts },
    light: mergeMode(lightTheme, input.light, 'light'),
    dark: mergeMode(darkTheme, input.dark, 'dark')
  }
}
