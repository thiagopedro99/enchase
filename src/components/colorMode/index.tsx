import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

import { defaultColorMode, defaultStorageKey, getDefaultStorage, readStoredMode, systemDarkQuery, writeStoredMode } from './defaultData.ts'
import { useMediaQuery } from '@hooks/useMediaQuery.ts'
import { createTheme } from '@styles/theme/createTheme.ts'
import { defaultThemeCss, themeCss } from '@styles/css/declarations.ts'
import { formatContrastIssues, validateTheme } from '@styles/theme/validateTheme.ts'
import { ThemeVariables } from '@styles/react.tsx'
import { ColorModeContext } from './context.ts'

import type { ColorMode, ColorModeProviderProps, ResolvedColorMode } from './types.ts'

export const ColorModeProvider = ({ children, theme, mode: controlledMode, defaultMode = defaultColorMode, onModeChange, storage, storageKey = defaultStorageKey }: ColorModeProviderProps) => {
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

  const themeSet = useMemo(() => (theme === undefined ? undefined : createTheme(theme)), [theme])
  const lastWarning = useRef<string | null>(null)
  const css = useMemo(() => (themeSet === undefined ? defaultThemeCss : themeCss(themeSet)), [themeSet])

  useEffect(() => {
    if (themeSet === undefined || process.env.NODE_ENV === 'production') return

    const message = formatContrastIssues(validateTheme(themeSet))

    if (message && message !== lastWarning.current) console.warn(message)

    lastWarning.current = message
  }, [themeSet])

  const value = useMemo(() => ({ mode, resolvedMode, setMode, toggleMode }), [mode, resolvedMode, setMode, toggleMode])

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeVariables css={css} />
      {children}
    </ColorModeContext.Provider>
  )
}

export default ColorModeProvider
