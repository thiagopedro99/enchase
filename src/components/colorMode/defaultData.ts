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

const scriptLiteral = (value: string) => JSON.stringify(value).replace(/</g, '\\u003c')

export const colorModeScript = (storageKey: string = defaultStorageKey, defaultMode: ColorMode = defaultColorMode) =>
  `(function(){try{var m=localStorage.getItem(${scriptLiteral(storageKey)});if(m!=='light'&&m!=='dark'&&m!=='system')m=${scriptLiteral(defaultMode)};if(m==='system')m=matchMedia(${scriptLiteral(systemDarkQuery)}).matches?'dark':'light';var d=document.documentElement;d.dataset.theme=m;d.style.colorScheme=m}catch(e){}})()`

const listeners = new Map<string, Set<() => void>>()

export const subscribeToStoredMode = (key: string, notify: () => void) => {
  const set = listeners.get(key) ?? new Set<() => void>()
  const handleStorage = (event: StorageEvent) => {
    if (event.key === key || event.key === null) notify()
  }

  set.add(notify)
  listeners.set(key, set)
  window.addEventListener('storage', handleStorage)

  return () => {
    set.delete(notify)
    window.removeEventListener('storage', handleStorage)
  }
}

export const writeStoredMode = (storage: ColorModeStorage | null, key: string, mode: ColorMode) => {
  if (!storage) return

  try {
    storage.setItem(key, mode)
  } catch {
    return
  }

  listeners.get(key)?.forEach((listener) => listener())
}
