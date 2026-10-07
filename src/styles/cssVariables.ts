import type { Theme } from './themes/index.ts'

type ColorTokens = Theme['colors']

type ShadowTokens = Theme['shadows']

type ThemeTokens = Pick<Theme, 'colors' | 'shadows'>

type ColorTree = { [key: string]: string | ColorTree }

const colorPrefix = '--enchase-color-'

const shadowPrefix = '--enchase-shadow-'

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

export const themeVariables = (theme: ThemeTokens): Record<string, string> => ({ ...colorVariables(theme.colors), ...shadowVariables(theme.shadows) })

export const colorReferences = (colors: ColorTokens): ColorTokens => walk(colors, [], (path) => `var(${colorVariableName(path)})`) as ColorTokens

export const shadowReferences = (shadows: ShadowTokens): ShadowTokens => Object.fromEntries(Object.keys(shadows).map((key) => [key, `var(${shadowVariableName(key)})`])) as ShadowTokens

export const themeReferences = (theme: Theme): Theme => ({ ...theme, colors: colorReferences(theme.colors), shadows: shadowReferences(theme.shadows) })

export const cssVariablesRule = (selector: string, theme: ThemeTokens) => {
  const declarations = Object.entries(themeVariables(theme)).map(([name, value]) => `  ${name}: ${value};`)

  return `${selector} {\n${declarations.join('\n')}\n}`
}
