import { defaultTheme } from '../tokens/index.ts'
import { variableName } from './names.ts'

import type { BaseTokens, ColorTokens, ModeTokens, ShadowTokens, ThemeSet } from '../tokens/types.ts'
import type { VariableGroup } from './names.ts'

type FontTokens = BaseTokens['fonts']

type ThemeTokens = ModeTokens

type LayoutTokens = Pick<BaseTokens, 'spacing' | 'borderRadius' | 'transitions' | 'state' | 'zIndex'>

type ColorTree = { [key: string]: string | ColorTree }

const flatten = (tree: ColorTree, path: string[] = []): [string[], string][] =>
  Object.entries(tree).flatMap(([key, value]) => (typeof value === 'string' ? [[[...path, key], value] as [string[], string]] : flatten(value, [...path, key])))

const declare = (group: VariableGroup, record: Record<string, string | number>): Record<string, string> =>
  Object.fromEntries(Object.entries(record).map(([key, value]) => [variableName(group, key), String(value)]))

export const colorVariables = (colors: ColorTokens): Record<string, string> => Object.fromEntries(flatten(colors).map(([path, value]) => [variableName('color', ...path), value]))

export const shadowVariables = (shadows: ShadowTokens): Record<string, string> => declare('shadow', shadows)

export const fontVariables = (fonts: FontTokens): Record<string, string> => ({
  [variableName('font', 'primary')]: fonts.primary,
  [variableName('font', 'mono')]: fonts.mono,
  ...declare('font-size', fonts.sizes),
  ...declare('font-weight', fonts.weights)
})

export const layoutVariables = (theme: LayoutTokens): Record<string, string> => ({
  ...declare('space', theme.spacing),
  ...declare('radius', theme.borderRadius),
  ...declare('transition', theme.transitions),
  ...declare('state', theme.state),
  ...declare('z', theme.zIndex)
})

export const themeVariables = (theme: ThemeTokens): Record<string, string> => ({ ...colorVariables(theme.colors), ...shadowVariables(theme.shadows) })

const variablesRule = (selector: string, variables: Record<string, string>) => {
  const declarations = Object.entries(variables).map(([name, value]) => `  ${name}: ${value};`)

  return `${selector} {\n${declarations.join('\n')}\n}`
}

export const cssVariablesRule = (selector: string, theme: ThemeTokens) => variablesRule(selector, themeVariables(theme))

export const fontVariablesRule = (selector: string, fonts: FontTokens) => variablesRule(selector, fontVariables(fonts))

export const layoutVariablesRule = (selector: string, theme: LayoutTokens) => variablesRule(selector, layoutVariables(theme))

export const themeCss = ({ base, light, dark }: ThemeSet) =>
  [fontVariablesRule(':root', base.fonts), layoutVariablesRule(':root', base), cssVariablesRule(":root, [data-theme='light']", light), cssVariablesRule("[data-theme='dark']", dark)].join('\n\n')

export const defaultThemeCss = themeCss(defaultTheme)
