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
  theme?: ThemeInput
  mode?: ColorMode
  defaultMode?: ColorMode
  onModeChange?: (mode: ColorMode) => void
  storage?: ColorModeStorage | null
  storageKey?: string
}
