import { baseTokens } from './base.ts'
import { lightTheme } from './light.ts'
import { darkTheme } from './dark.ts'

import type { ThemeSet } from './types.ts'

export const defaultTheme: ThemeSet = { base: baseTokens, light: lightTheme, dark: darkTheme }

export const breakpoints = baseTokens.breakpoints

export { baseTokens, lightTheme, darkTheme }

export { colorRoles, themeModes } from './types.ts'

export type { BaseTokens, ColorRole, ColorTokens, ModeTokens, ShadowTokens, ThemeMode, ThemeSet } from './types.ts'
