import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'

import { colorModeScript, defaultColorMode, defaultStorageKey, getDefaultStorage, readStoredMode, subscribeToStoredMode, systemDarkQuery, writeStoredMode } from './defaultData.ts'
import { useMediaQuery } from '@hooks/useMediaQuery.ts'
import { defaultTheme } from '@styles/tokens/index.ts'
import { createTheme } from '@styles/theme/createTheme.ts'
import { defaultThemeCss, themeCss } from '@styles/css/declarations.ts'
import { formatMotionIssues, validateMotion } from '@styles/theme/motion.ts'
import { formatContrastIssues, validateTheme } from '@styles/theme/validateTheme.ts'
import { ThemeVariables } from '@styles/react.tsx'
import { ColorModeContext } from './context.ts'
import { defaultThemeDefaults, ThemeDefaultsContext } from './themeDefaults.ts'

import type { ColorMode, ColorModeProviderProps, ColorModeScriptProps, ResolvedColorMode } from './types.ts'

export const ColorModeProvider = ({ children, theme, mode: controlledMode, defaultMode = defaultColorMode, onModeChange, storage, storageKey = defaultStorageKey, cssLayer }: ColorModeProviderProps) => {
  const store = useMemo(() => (storage === undefined ? getDefaultStorage() : storage), [storage])
  const subscribe = useCallback((notify: () => void) => subscribeToStoredMode(storageKey, notify), [storageKey])
  const storedMode = useSyncExternalStore(
    subscribe,
    () => readStoredMode(store, storageKey),
    () => null
  )
  const systemPrefersDark = useMediaQuery(systemDarkQuery)
  const [chosenMode, setChosenMode] = useState<ColorMode | null>(null)
  const mode: ColorMode = controlledMode ?? chosenMode ?? storedMode ?? defaultMode
  const resolvedMode: ResolvedColorMode = mode === 'system' ? (systemPrefersDark ? 'dark' : 'light') : mode

  const setMode = useCallback(
    (next: ColorMode) => {
      if (controlledMode === undefined) {
        setChosenMode(next)
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
  const css = useMemo(() => {
    if (cssLayer) return themeCss(themeSet ?? defaultTheme, { layer: cssLayer })

    return themeSet === undefined ? defaultThemeCss : themeCss(themeSet)
  }, [themeSet, cssLayer])

  useEffect(() => {
    if (themeSet === undefined || process.env.NODE_ENV === 'production') return

    const parts = [formatContrastIssues(validateTheme(themeSet)), formatMotionIssues(validateMotion(themeSet.base))].filter((part): part is string => part !== null)
    const message = parts.length === 0 ? null : parts.join('\n')

    if (message && message !== lastWarning.current) console.warn(message)

    lastWarning.current = message
  }, [themeSet])

  const value = useMemo(() => ({ mode, resolvedMode, setMode, toggleMode }), [mode, resolvedMode, setMode, toggleMode])
  const labelPlacement = themeSet?.defaults?.labelPlacement ?? defaultThemeDefaults.labelPlacement
  const defaults = useMemo(() => ({ ...defaultThemeDefaults, labelPlacement }), [labelPlacement])

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeDefaultsContext.Provider value={defaults}>
        <ThemeVariables css={css} />
        {children}
      </ThemeDefaultsContext.Provider>
    </ColorModeContext.Provider>
  )
}

export const ColorModeScript = ({ storageKey, defaultMode, nonce }: ColorModeScriptProps) => <script nonce={nonce} dangerouslySetInnerHTML={{ __html: colorModeScript(storageKey, defaultMode) }} />

export default ColorModeProvider
