import { useCallback, useLayoutEffect, useMemo, useState } from 'react'
import { ThemeProvider } from 'styled-components'

import { defaultColorMode, defaultStorageKey, getDefaultStorage, readStoredMode, systemDarkQuery, writeStoredMode } from './defaultData.ts'
import { useMediaQuery } from '@hooks/useMediaQuery.ts'
import { ThemeVariables, variableTheme } from '@styles/themeVariables.ts'
import { ColorModeContext } from './context.ts'

import type { ColorMode, ColorModeProviderProps, ResolvedColorMode } from './types.ts'

export const ColorModeProvider = ({ children, mode: controlledMode, defaultMode = defaultColorMode, onModeChange, storage, storageKey = defaultStorageKey }: ColorModeProviderProps) => {
  const store = useMemo(() => (storage === undefined ? getDefaultStorage() : storage), [storage])
  const [internalMode, setInternalMode] = useState<ColorMode>(() => readStoredMode(store, storageKey) ?? defaultMode)
  const systemPrefersDark = useMediaQuery(systemDarkQuery)
  const mode = controlledMode ?? internalMode
  const resolvedMode: ResolvedColorMode = mode === 'system' ? (systemPrefersDark ? 'dark' : 'light') : mode

  const setMode = useCallback(
    (next: ColorMode) => {
      if (controlledMode === undefined) {
        setInternalMode(next)
        writeStoredMode(store, storageKey, next)
      }

      onModeChange?.(next)
    },
    [controlledMode, store, storageKey, onModeChange]
  )

  const toggleMode = useCallback(() => setMode(resolvedMode === 'dark' ? 'light' : 'dark'), [resolvedMode, setMode])

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = resolvedMode
    document.documentElement.style.colorScheme = resolvedMode
  }, [resolvedMode])

  const value = useMemo(() => ({ mode, resolvedMode, setMode, toggleMode }), [mode, resolvedMode, setMode, toggleMode])

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeVariables />
      <ThemeProvider theme={variableTheme}>{children}</ThemeProvider>
    </ColorModeContext.Provider>
  )
}

export default ColorModeProvider
