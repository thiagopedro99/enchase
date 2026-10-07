import type { Theme } from './themes/index.ts'

type ColorTokens = Theme['colors']

type ShadowTokens = Theme['shadows']

type FontTokens = Theme['fonts']

type ThemeTokens = Pick<Theme, 'colors' | 'shadows'>

type ColorTree = { [key: string]: string | ColorTree }

const colorPrefix = '--enchase-color-'

const shadowPrefix = '--enchase-shadow-'

const fontPrefix = '--enchase-font-'

const fontSizePrefix = '--enchase-font-size-'

const fontWeightPrefix = '--enchase-font-weight-'

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

export const themeVariables = (theme: ThemeTokens): Record<string, string> => ({ ...colorVariables(theme.colors), ...shadowVariables(theme.shadows) })

export const colorReferences = (colors: ColorTokens): ColorTokens => walk(colors, [], (path) => `var(${colorVariableName(path)})`) as ColorTokens

export const shadowReferences = (shadows: ShadowTokens): ShadowTokens => Object.fromEntries(Object.keys(shadows).map((key) => [key, `var(${shadowVariableName(key)})`])) as ShadowTokens

export const fontReferences = (fonts: FontTokens): FontTokens => ({
  primary: `var(${fontFamilyVariableName('primary')})`,
  mono: `var(${fontFamilyVariableName('mono')})`,
  sizes: Object.fromEntries(Object.keys(fonts.sizes).map((key) => [key, `var(${fontSizeVariableName(key)})`])) as FontTokens['sizes'],
  weights: Object.fromEntries(Object.keys(fonts.weights).map((key) => [key, `var(${fontWeightVariableName(key)})`])) as unknown as FontTokens['weights']
})

export const themeReferences = (theme: Theme): Theme => ({ ...theme, colors: colorReferences(theme.colors), shadows: shadowReferences(theme.shadows), fonts: fontReferences(theme.fonts) })

const variablesRule = (selector: string, variables: Record<string, string>) => {
  const declarations = Object.entries(variables).map(([name, value]) => `  ${name}: ${value};`)

  return `${selector} {\n${declarations.join('\n')}\n}`
}

export const cssVariablesRule = (selector: string, theme: ThemeTokens) => variablesRule(selector, themeVariables(theme))

export const fontVariablesRule = (selector: string, fonts: FontTokens) => variablesRule(selector, fontVariables(fonts))
