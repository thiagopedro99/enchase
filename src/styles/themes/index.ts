import { baseTokens } from './shared.ts'
import { lightTheme } from './light.ts'
import { darkTheme } from './dark.ts'

import type { ThemeSet } from './types.ts'

export const defaultTheme: ThemeSet = { base: baseTokens, light: lightTheme, dark: darkTheme }

export { baseTokens, lightTheme, darkTheme }
