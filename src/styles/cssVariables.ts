import type { Theme } from './themes/index.ts'

type ColorTokens = Theme['colors']

type ColorTree = { [key: string]: string | ColorTree }

const variablePrefix = '--enchase-color-'

const toKebabCase = (key: string) => key.replace(/([A-Z])/g, '-$1').toLowerCase()

const walk = (tree: ColorTree, path: string[], visit: (path: string[], value: string) => string): ColorTree =>
  Object.fromEntries(Object.entries(tree).map(([key, value]) => [key, typeof value === 'string' ? visit([...path, key], value) : walk(value, [...path, key], visit)]))

export const colorVariableName = (path: string[]) => `${variablePrefix}${path.map(toKebabCase).join('-')}`

export const colorVariables = (colors: ColorTokens): Record<string, string> => {
  const entries: [string, string][] = []

  walk(colors, [], (path, value) => {
    entries.push([colorVariableName(path), value])

    return value
  })

  return Object.fromEntries(entries)
}

export const colorReferences = (colors: ColorTokens): ColorTokens => walk(colors, [], (path) => `var(${colorVariableName(path)})`) as ColorTokens

export const cssVariablesRule = (selector: string, colors: ColorTokens) => {
  const declarations = Object.entries(colorVariables(colors)).map(([name, value]) => `  ${name}: ${value};`)

  return `${selector} {\n${declarations.join('\n')}\n}`
}
