import { brandRoles } from './brandRoles.ts'
import { assertValidColor } from './color.ts'
import { assertSafeCssValue } from './cssValue.ts'
import { assertValidFontSize, assertValidFontWeight } from './font.ts'
import { hasOwn, isRecord, mergeTokens } from './merge.ts'
import { assertValidRadius, shapePresets } from './shape.ts'
import { assertValidLetterSpacing, assertValidLineHeight } from './typography.ts'
import { baseTokens, lightTheme } from '../tokens/index.ts'
import { variableGroups } from '../tokens/groups.ts'
import { labelPlacements, themeModes } from '../tokens/types.ts'

import type { BrandRole } from './brandRoles.ts'
import type { RadiusOverrides } from './shape.ts'
import type { BaseTokens, ColorTokens, HookValues, ShadowTokens, ThemeDefaults } from '../tokens/types.ts'

type Partial2<Tokens> = { [Key in keyof Tokens]?: Tokens[Key] extends string | number ? Tokens[Key] : Partial2<Tokens[Key]> }

export type ThemeStyleMode = {
  colors?: Partial2<ColorTokens>
  shadows?: Partial<Omit<ShadowTokens, 'none'>>
  hooks?: HookValues
}

export type ThemeStyle = {
  base?: Partial2<Pick<BaseTokens, 'control' | 'focus' | 'border' | 'halo' | 'hit' | 'state'>>
  fonts?: Partial2<Pick<BaseTokens['fonts'], 'sizes' | 'weights' | 'lineHeights' | 'letterSpacings'>>
  radius?: RadiusOverrides
  hooks?: HookValues
  colorHooks?: HookValues
  brand?: ReadonlyArray<BrandRole>
  light?: ThemeStyleMode
  dark?: ThemeStyleMode
  defaults?: Partial<ThemeDefaults>
}

const styleSections = ['base', 'fonts', 'radius', 'hooks', 'colorHooks', 'brand', ...themeModes, 'defaults']

const modeSections = ['colors', 'shadows', 'hooks']

const baseGroups = ['control', 'focus', 'border', 'halo', 'hit', 'state'] as const

const fontValidators = {
  sizes: assertValidFontSize,
  weights: assertValidFontWeight,
  lineHeights: assertValidLineHeight,
  letterSpacings: assertValidLetterSpacing
}

const overridableRadius = Object.fromEntries(Object.entries(shapePresets.pill).filter(([key]) => key !== 'none'))

const overridableShadows = Object.fromEntries(Object.entries(lightTheme.shadows).filter(([key]) => key !== 'none'))

const hookName = /^--enchase-[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/

const maxHookNameLength = 100

const themeReference = /var\(\s*--enchase-(?:color|shadow)-/

const optionalThemeVariables = ['--enchase-focus-color']

const validated = new WeakSet<object>()

const isThemeToken = (name: string) => !optionalThemeVariables.includes(name) && variableGroups.some((group) => name.startsWith(`--enchase-${group}-`))

const checkBase = (base: unknown) => {
  if (base === undefined) return

  if (!isRecord(base)) throw new Error('Expected an object for "style.base"')

  for (const [group, value] of Object.entries(base)) {
    if (!(baseGroups as readonly string[]).includes(group)) throw new Error(`Unknown base token "style.base.${group}"`)
    if (value === undefined) continue

    mergeTokens(baseTokens[group as (typeof baseGroups)[number]], value, `style.base.${group}`, assertSafeCssValue, 'base')
  }
}

const checkFonts = (fonts: unknown) => {
  if (fonts === undefined) return

  if (!isRecord(fonts)) throw new Error('Expected an object for "style.fonts"')

  for (const [group, value] of Object.entries(fonts)) {
    if (!hasOwn(fontValidators, group)) throw new Error(`Unknown font token "style.fonts.${group}"`)
    if (value === undefined) continue

    mergeTokens(baseTokens.fonts[group as keyof typeof fontValidators], value, `style.fonts.${group}`, fontValidators[group as keyof typeof fontValidators], 'font')
  }
}

const checkHooks = (hooks: unknown, path: string, followsMode: boolean) => {
  if (hooks === undefined) return

  if (!isRecord(hooks)) throw new Error(`Expected an object for "${path}"`)

  for (const [name, value] of Object.entries(hooks)) {
    if (!hookName.test(name) || name.length > maxHookNameLength) throw new Error(`Invalid hook name "${name}" in "${path}": a hook is written --enchase- followed by words in lowercase kebab case`)
    if (isThemeToken(name)) throw new Error(`"${name}" in "${path}" is a token of the theme, not a hook: set it with base, fonts, radius, light or dark`)

    const css = assertSafeCssValue(`${path}.${name}`, value)

    if (!followsMode && themeReference.test(css)) {
      throw new Error(`"${path}.${name}" reads a color or a shadow of the theme, so it has to be declared where the mode is: move it to colorHooks, or to light.hooks and dark.hooks`)
    }
  }
}

const checkBrand = (brand: unknown) => {
  if (brand === undefined) return

  if (!Array.isArray(brand)) throw new Error('Expected a list for "style.brand"')

  for (const role of brand) {
    if (!(brandRoles as readonly unknown[]).includes(role)) throw new Error(`Unknown brand role ${JSON.stringify(role)} in "style.brand": use ${brandRoles.join(', ')}`)
  }
}

const checkMode = (mode: unknown, path: string) => {
  if (mode === undefined) return

  if (!isRecord(mode)) throw new Error(`Expected an object for "${path}"`)

  for (const section of Object.keys(mode)) {
    if (!modeSections.includes(section)) throw new Error(`Unknown style section "${path}.${section}"`)
  }

  if (mode.colors !== undefined) mergeTokens(lightTheme.colors, mode.colors, `${path}.colors`, assertValidColor, 'color')
  if (mode.shadows !== undefined) mergeTokens(overridableShadows, mode.shadows, `${path}.shadows`, assertSafeCssValue, 'shadow')

  checkHooks(mode.hooks, `${path}.hooks`, true)
}

const checkDefaults = (defaults: unknown) => {
  if (defaults === undefined) return

  if (!isRecord(defaults)) throw new Error('Expected an object for "style.defaults"')

  for (const [key, value] of Object.entries(defaults)) {
    if (key !== 'labelPlacement') throw new Error(`Unknown default "style.defaults.${key}"`)
    if (value !== undefined && !(labelPlacements as readonly unknown[]).includes(value)) throw new Error(`Invalid label placement for "style.defaults.labelPlacement": ${JSON.stringify(value)}`)
  }
}

export const assertStyle = (style: unknown): ThemeStyle => {
  if (typeof style === 'object' && style !== null && validated.has(style)) return style as ThemeStyle

  if (!isRecord(style)) throw new Error('Expected an object for "style"')

  for (const section of Object.keys(style)) {
    if (!styleSections.includes(section)) throw new Error(`Unknown style section "${section}"`)
  }

  checkBase(style.base)
  checkFonts(style.fonts)

  if (style.radius !== undefined) mergeTokens(overridableRadius, style.radius, 'style.radius', assertValidRadius, 'radius')

  checkHooks(style.hooks, 'style.hooks', false)
  checkHooks(style.colorHooks, 'style.colorHooks', true)
  checkBrand(style.brand)
  checkMode(style.light, 'style.light')
  checkMode(style.dark, 'style.dark')
  checkDefaults(style.defaults)

  return style as ThemeStyle
}

const frozen = <Value>(value: Value): Value => {
  if (Array.isArray(value)) return Object.freeze(value.map(frozen)) as Value
  if (isRecord(value)) return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, item]) => [key, frozen(item)]))) as Value

  return value
}

export const defineStyle = (style: ThemeStyle): ThemeStyle => {
  const defined = frozen(assertStyle(style))

  validated.add(defined)

  return defined
}
