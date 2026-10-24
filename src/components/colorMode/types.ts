import type { ReactNode } from 'react'

import type { ThemeInput } from '@styles/theme/createTheme.ts'
import type { ThemeMode } from '@styles/tokens/types.ts'

export type ColorMode = 'light' | 'dark' | 'system'

export type ResolvedColorMode = ThemeMode

export type ColorModeStorage = {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
}

export type ColorModeContextValue = {
  mode: ColorMode
  resolvedMode: ResolvedColorMode
  setMode: (mode: ColorMode) => void
  toggleMode: () => void
}

export type ColorModeProviderProps = {
  children: ReactNode
  theme?: ThemeInput | undefined
  mode?: ColorMode | undefined
  defaultMode?: ColorMode | undefined
  onModeChange?: ((mode: ColorMode) => void) | undefined
  storage?: ColorModeStorage | null | undefined
  storageKey?: string | undefined
  cssLayer?: string | undefined
}

export type ColorModeScriptProps = {
  storageKey?: string | undefined
  defaultMode?: ColorMode | undefined
  nonce?: string | undefined
}
