import type { ColorMode, ColorModeStorage } from './types.ts'

export const colorModes: readonly ColorMode[] = ['light', 'dark', 'system']

export const defaultColorMode: ColorMode = 'system'

export const defaultStorageKey = 'enchase-color-mode'

export const systemDarkQuery = '(prefers-color-scheme: dark)'

export const getDefaultStorage = (): ColorModeStorage | null => {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

export const readStoredMode = (storage: ColorModeStorage | null, key: string): ColorMode | null => {
  if (!storage) return null

  try {
    const value = storage.getItem(key)

    return colorModes.find((mode) => mode === value) ?? null
  } catch {
    return null
  }
}

export const writeStoredMode = (storage: ColorModeStorage | null, key: string, mode: ColorMode) => {
  if (!storage) return

  try {
    storage.setItem(key, mode)
  } catch {
    return
  }
}
