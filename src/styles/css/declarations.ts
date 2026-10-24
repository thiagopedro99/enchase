import { defaultTheme } from '../tokens/index.ts'
import { variableName } from './names.ts'

import type { BaseTokens, ColorTokens, HookValues, ModeTokens, ShadowTokens, ThemeSet } from '../tokens/types.ts'
import type { VariableGroup } from './names.ts'

type FontTokens = BaseTokens['fonts']

type ThemeTokens = ModeTokens

type LayoutTokens = Pick<BaseTokens, 'spacing' | 'borderRadius' | 'transitions' | 'motion' | 'control' | 'focus' | 'border' | 'halo' | 'hit' | 'state' | 'zIndex'>

type ColorTree = { [key: string]: string | ColorTree }

const flatten = (tree: ColorTree, path: string[] = []): [string[], string][] =>
  Object.entries(tree).flatMap(([key, value]) => (typeof value === 'string' ? [[[...path, key], value] as [string[], string]] : flatten(value, [...path, key])))

const declareTree = (group: VariableGroup, tree: ColorTree): Record<string, string> => Object.fromEntries(flatten(tree).map(([path, value]) => [variableName(group, ...path), value]))

const declare = (group: VariableGroup, record: Record<string, string | number>): Record<string, string> =>
  Object.fromEntries(Object.entries(record).map(([key, value]) => [variableName(group, key), String(value)]))

export const colorVariables = (colors: ColorTokens): Record<string, string> => Object.fromEntries(flatten(colors).map(([path, value]) => [variableName('color', ...path), value]))

export const shadowVariables = (shadows: ShadowTokens): Record<string, string> => declare('shadow', shadows)

export const fontVariables = (fonts: FontTokens): Record<string, string> => ({
  [variableName('font', 'primary')]: fonts.primary,
  [variableName('font', 'mono')]: fonts.mono,
  ...declare('font-size', fonts.sizes),
  ...declare('font-weight', fonts.weights),
  ...declare('line-height', fonts.lineHeights),
  ...declare('letter-spacing', fonts.letterSpacings)
})

export const layoutVariables = (theme: LayoutTokens): Record<string, string> => ({
  ...declare('space', theme.spacing),
  ...declare('radius', theme.borderRadius),
  ...declare('transition', theme.transitions),
  ...declareTree('motion', theme.motion),
  ...declareTree('control', theme.control),
  ...declare('focus', theme.focus),
  ...declare('border', theme.border),
  ...declare('halo', theme.halo),
  ...declare('hit', theme.hit),
  ...declare('state', theme.state),
  ...declare('z', theme.zIndex)
})

export const themeVariables = (theme: ThemeTokens): Record<string, string> => ({ ...colorVariables(theme.colors), ...shadowVariables(theme.shadows), ...theme.hooks })

const variablesRule = (selector: string, variables: Record<string, string>) => {
  const declarations = Object.entries(variables).map(([name, value]) => `  ${name}: ${value};`)

  return `${selector} {\n${declarations.join('\n')}\n}`
}

export const cssVariablesRule = (selector: string, theme: ThemeTokens) => variablesRule(selector, themeVariables(theme))

export const fontVariablesRule = (selector: string, fonts: FontTokens) => variablesRule(selector, fontVariables(fonts))

export const layoutVariablesRule = (selector: string, theme: LayoutTokens, hooks?: HookValues) => variablesRule(selector, { ...layoutVariables(theme), ...hooks })

export type ThemeCssOptions = {
  layer?: string | undefined
}

const indent = (css: string) =>
  css
    .split('\n')
    .map((line) => (line ? `  ${line}` : line))
    .join('\n')

export const themeCss = ({ base, light, dark, hooks }: ThemeSet, { layer }: ThemeCssOptions = {}) => {
  const rules = [
    fontVariablesRule(':root', base.fonts),
    layoutVariablesRule(':root', base, hooks),
    cssVariablesRule(":root, [data-theme='light']", light),
    cssVariablesRule("[data-theme='dark']", dark),
    `@media (prefers-color-scheme: dark) {\n${indent(cssVariablesRule(':root:not([data-theme])', dark))}\n}`
  ].join('\n\n')

  return layer ? `@layer ${layer} {\n${indent(rules)}\n}` : rules
}

export const defaultThemeCss = themeCss(defaultTheme)
