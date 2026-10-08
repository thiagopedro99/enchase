import type { baseTokens } from './shared.ts'

export const themeModes = ['light', 'dark'] as const

export const colorRoles = ['primary', 'secondary', 'error', 'success', 'warning', 'info'] as const

export type ThemeMode = (typeof themeModes)[number]

export type ColorRole = (typeof colorRoles)[number]

type RoleColors<Role extends string> = {
  [Key in Role | `on${Capitalize<Role>}` | `${Role}Container` | `on${Capitalize<Role>}Container`]: string
}

export type ColorTokens = RoleColors<ColorRole> & {
  primaryHover: string
  background: string
  surface: string
  surfaceContainerLow: string
  surfaceContainer: string
  surfaceContainerHigh: string
  text: {
    primary: string
    secondary: string
    disabled: string
    placeholder: string
    inverse: string
  }
  border: string
  borderStrong: string
  borderLight: string
  inverseSurface: string
  inverseOnSurface: string
  inversePrimary: string
  overlay: string
  codeBackground: string
}

export type ShadowTokens = Record<'none' | 'sm' | 'md' | 'lg' | 'xl', string>

export type ModeTokens = {
  colors: ColorTokens
  shadows: ShadowTokens
}

export type BaseTokens = typeof baseTokens

export type ThemeSet = {
  base: BaseTokens
  light: ModeTokens
  dark: ModeTokens
}
