import { assertValidColor } from './colorFormat.ts'
import { darkTheme, lightTheme } from './themes/index.ts'

import type { Theme } from './themes/index.ts'

type DeepPartial<T> = { [K in keyof T]?: T[K] extends string ? string : DeepPartial<T[K]> }

export type ThemeOverrides = { colors?: DeepPartial<Theme['colors']> }

export type ThemeInput = { light?: ThemeOverrides; dark?: ThemeOverrides }

export type ThemeSet = { light: Theme; dark: Theme }

const themeModes = ['light', 'dark'] as const

const customizableSections = ['colors']

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

const mergeTheme = (base: Theme, overrides: ThemeOverrides | undefined, mode: string): Theme => {
  if (overrides === undefined) return base
  if (!isRecord(overrides)) throw new Error(`Expected an object for "${mode}"`)

  for (const section of Object.keys(overrides)) {
    if (!customizableSections.includes(section)) throw new Error(`Unknown theme section "${mode}.${section}"`)
  }

  if (overrides.colors === undefined) return base

  return { ...base, colors: mergeColors(base.colors, overrides.colors, `${mode}.colors`) as Theme['colors'] }
}

export const createTheme = (input: ThemeInput = {}): ThemeSet => {
  if (!isRecord(input)) throw new Error('Expected an object for the theme input')

  for (const mode of Object.keys(input)) {
    if (!themeModes.some((known) => known === mode)) throw new Error(`Unknown theme mode "${mode}"`)
  }

  return { light: mergeTheme(lightTheme, input.light, 'light'), dark: mergeTheme(darkTheme, input.dark, 'dark') }
}
