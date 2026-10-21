import type { baseTokens } from './base.ts'

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

export type HookValues = Record<string, string>

export type LabelPlacement = 'floating' | 'stacked'

export type ThemeDefaults = { labelPlacement: LabelPlacement }

export type ModeTokens = {
  colors: ColorTokens
  shadows: ShadowTokens
  hooks?: HookValues
}

export type BaseTokens = typeof baseTokens

export type ThemeSet = {
  base: BaseTokens
  light: ModeTokens
  dark: ModeTokens
  hooks?: HookValues
  defaults?: Partial<ThemeDefaults>
}
