import { themes } from './themes/index.ts'

import type { ThemeSet } from './createTheme.ts'
import type { Theme } from './themes/index.ts'

type ColorTokens = Theme['colors']

type ShadowTokens = Theme['shadows']

type FontTokens = Theme['fonts']

type ThemeTokens = Pick<Theme, 'colors' | 'shadows'>

type LayoutTokens = Pick<Theme, 'spacing' | 'borderRadius' | 'transitions' | 'state' | 'zIndex'>

type ColorTree = { [key: string]: string | ColorTree }

const colorPrefix = '--enchase-color-'

const shadowPrefix = '--enchase-shadow-'

const fontPrefix = '--enchase-font-'

const fontSizePrefix = '--enchase-font-size-'

const fontWeightPrefix = '--enchase-font-weight-'

const spacingPrefix = '--enchase-space-'

const radiusPrefix = '--enchase-radius-'

const transitionPrefix = '--enchase-transition-'

const statePrefix = '--enchase-state-'

const zIndexPrefix = '--enchase-z-'

const toKebabCase = (key: string) => key.replace(/([A-Z])/g, '-$1').toLowerCase()

const walk = (tree: ColorTree, path: string[], visit: (path: string[], value: string) => string): ColorTree =>
  Object.fromEntries(Object.entries(tree).map(([key, value]) => [key, typeof value === 'string' ? visit([...path, key], value) : walk(value, [...path, key], visit)]))

export const colorVariableName = (path: string[]) => `${colorPrefix}${path.map(toKebabCase).join('-')}`

export const shadowVariableName = (key: string) => `${shadowPrefix}${toKebabCase(key)}`

export const colorVariables = (colors: ColorTokens): Record<string, string> => {
  const entries: [string, string][] = []

  walk(colors, [], (path, value) => {
    entries.push([colorVariableName(path), value])

    return value
  })

  return Object.fromEntries(entries)
}

export const shadowVariables = (shadows: ShadowTokens): Record<string, string> => Object.fromEntries(Object.entries(shadows).map(([key, value]) => [shadowVariableName(key), value]))

export const fontFamilyVariableName = (key: string) => `${fontPrefix}${toKebabCase(key)}`

export const fontSizeVariableName = (key: string) => `${fontSizePrefix}${toKebabCase(key)}`

export const fontWeightVariableName = (key: string) => `${fontWeightPrefix}${toKebabCase(key)}`

export const fontVariables = (fonts: FontTokens): Record<string, string> => ({
  [fontFamilyVariableName('primary')]: fonts.primary,
  [fontFamilyVariableName('mono')]: fonts.mono,
  ...Object.fromEntries(Object.entries(fonts.sizes).map(([key, value]) => [fontSizeVariableName(key), value])),
  ...Object.fromEntries(Object.entries(fonts.weights).map(([key, value]) => [fontWeightVariableName(key), String(value)]))
})

export const spacingVariableName = (key: string) => `${spacingPrefix}${toKebabCase(key)}`

export const radiusVariableName = (key: string) => `${radiusPrefix}${toKebabCase(key)}`

export const transitionVariableName = (key: string) => `${transitionPrefix}${toKebabCase(key)}`

export const stateVariableName = (key: string) => `${statePrefix}${toKebabCase(key)}`

export const zIndexVariableName = (key: string) => `${zIndexPrefix}${toKebabCase(key)}`

const prefixed = (record: Record<string, string>, name: (key: string) => string) => Object.fromEntries(Object.entries(record).map(([key, value]) => [name(key), value]))

export const layoutVariables = (theme: LayoutTokens): Record<string, string> => ({
  ...prefixed(theme.spacing, spacingVariableName),
  ...prefixed(theme.borderRadius, radiusVariableName),
  ...prefixed(theme.transitions, transitionVariableName),
  ...prefixed(theme.state, stateVariableName),
  ...prefixed(Object.fromEntries(Object.entries(theme.zIndex).map(([key, value]) => [key, String(value)])), zIndexVariableName)
})

export const themeVariables = (theme: ThemeTokens): Record<string, string> => ({ ...colorVariables(theme.colors), ...shadowVariables(theme.shadows) })

const variablesRule = (selector: string, variables: Record<string, string>) => {
  const declarations = Object.entries(variables).map(([name, value]) => `  ${name}: ${value};`)

  return `${selector} {\n${declarations.join('\n')}\n}`
}

export const cssVariablesRule = (selector: string, theme: ThemeTokens) => variablesRule(selector, themeVariables(theme))

export const fontVariablesRule = (selector: string, fonts: FontTokens) => variablesRule(selector, fontVariables(fonts))

export const layoutVariablesRule = (selector: string, theme: LayoutTokens) => variablesRule(selector, layoutVariables(theme))

export const themeCss = ({ light, dark }: ThemeSet) =>
  [fontVariablesRule(':root', light.fonts), layoutVariablesRule(':root', light), cssVariablesRule(":root, [data-theme='light']", light), cssVariablesRule("[data-theme='dark']", dark)].join('\n\n')

export const defaultThemeCss = themeCss(themes)
