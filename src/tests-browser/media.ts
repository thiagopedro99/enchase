import { commands } from 'vitest/browser'

type MediaOptions = { reducedMotion?: 'reduce' | 'no-preference'; colorScheme?: 'dark' | 'light' | 'no-preference' }

const emulateMedia = (options: MediaOptions) => (commands as unknown as { emulateMedia: (options: MediaOptions) => Promise<void> }).emulateMedia(options)

export const setReducedMotion = (value: 'reduce' | 'no-preference') => emulateMedia({ reducedMotion: value })

export const setColorScheme = (value: 'dark' | 'light') => emulateMedia({ colorScheme: value })
