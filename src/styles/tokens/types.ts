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

export type HookName = `--enchase-${string}`

export type HookValues = Record<HookName, string>

export const labelPlacements = ['floating', 'stacked', 'start'] as const

export type LabelPlacement = (typeof labelPlacements)[number]

export type FieldVariant = 'outlined' | 'filled' | 'borderless' | 'underlined'

export type ThemeDefaults = { labelPlacement: LabelPlacement }

type DensityToken =
  | '--enchase-hit-size'
  | '--enchase-hit-size-lg'
  | `--enchase-control-height-${keyof BaseTokens['control']['height']}`
  | `--enchase-space-${keyof BaseTokens['spacing']}`
  | `--enchase-font-size-${keyof BaseTokens['fonts']['sizes']}`
  | `--enchase-line-height-${keyof BaseTokens['fonts']['lineHeights']}`

type DensityTokens = { [Name in DensityToken]?: Name extends `--enchase-line-height-${string}` ? number : string }

export type ThemeDensity = {
  compact?:
    | {
        tokens?: DensityTokens | undefined
        hooks?: HookValues | undefined
      }
    | undefined
}

export type ModeTokens = {
  colors: ColorTokens
  shadows: ShadowTokens
  hooks?: HookValues | undefined
}

export type BaseTokens = typeof baseTokens

export type ThemeSet = {
  base: BaseTokens
  light: ModeTokens
  dark: ModeTokens
  hooks?: HookValues | undefined
  density?: ThemeDensity | undefined
  defaults?: Partial<ThemeDefaults> | undefined
}
