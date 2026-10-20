import { commands } from 'vitest/browser'

type MediaOptions = { reducedMotion?: 'reduce' | 'no-preference'; colorScheme?: 'dark' | 'light' | 'no-preference'; forcedColors?: 'active' | 'none'; contrast?: 'more' | 'no-preference' }

const emulateMedia = (options: MediaOptions) => (commands as unknown as { emulateMedia: (options: MediaOptions) => Promise<void> }).emulateMedia(options)

export const setReducedMotion = (value: 'reduce' | 'no-preference') => emulateMedia({ reducedMotion: value })

export const setColorScheme = (value: 'dark' | 'light') => emulateMedia({ colorScheme: value })

export const setForcedColors = (value: 'active' | 'none') => emulateMedia({ forcedColors: value })

export const setContrast = (value: 'more' | 'no-preference') => emulateMedia({ contrast: value })

export const setReducedTransparency = (value: 'reduce' | 'no-preference') => (commands as unknown as { emulateReducedTransparency: (value: string) => Promise<void> }).emulateReducedTransparency(value)
