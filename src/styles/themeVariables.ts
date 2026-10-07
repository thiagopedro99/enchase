import { createGlobalStyle } from 'styled-components'

import { cssVariablesRule, fontVariablesRule, layoutVariablesRule, themeReferences } from './cssVariables.ts'
import { lightTheme, themes } from './themes/index.ts'

import type { ThemeSet } from './createTheme.ts'

export const variableTheme = themeReferences(lightTheme)

export const themeCss = ({ light, dark }: ThemeSet) =>
  [fontVariablesRule(':root', light.fonts), layoutVariablesRule(':root', light), cssVariablesRule(":root, [data-theme='light']", light), cssVariablesRule("[data-theme='dark']", dark)].join('\n\n')

export const defaultThemeCss = themeCss(themes)

export const ThemeVariables = createGlobalStyle<{ $css: string }>`
  ${({ $css }) => $css}
`
