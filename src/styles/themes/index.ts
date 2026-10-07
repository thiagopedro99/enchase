import { lightTheme } from './light.ts'
import { darkTheme } from './dark.ts'

export const themes = {
  light: lightTheme,
  dark: darkTheme,
} as const

export type ThemeType = keyof typeof themes
export type Theme = typeof lightTheme

export { lightTheme, darkTheme }