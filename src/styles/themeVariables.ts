import { createGlobalStyle } from 'styled-components'

import { cssVariablesRule, fontVariablesRule, themeReferences } from './cssVariables.ts'
import { darkTheme, lightTheme } from './themes/index.ts'

export const variableTheme = themeReferences(lightTheme)

export const ThemeVariables = createGlobalStyle`
  ${fontVariablesRule(':root', lightTheme.fonts)}

  ${cssVariablesRule(":root, [data-theme='light']", lightTheme)}

  ${cssVariablesRule("[data-theme='dark']", darkTheme)}
`
