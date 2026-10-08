import { setViewportWidth } from '@tests/viewport.ts'

import type { ThemeMode } from '@styles/tokens/types.ts'

export type ClientVariant = {
  name: string
  width: number
  systemDark: boolean
  stored: ThemeMode | null
  reducedMotion: boolean
}

export const clientVariants: ClientVariant[] = [
  { name: 'A desktop, dark saved', width: 1280, systemDark: false, stored: 'dark', reducedMotion: false },
  { name: 'B mobile, light, nothing saved', width: 390, systemDark: false, stored: null, reducedMotion: false },
  { name: 'C desktop, light', width: 1280, systemDark: false, stored: null, reducedMotion: false },
  { name: 'D mobile, system dark', width: 390, systemDark: true, stored: null, reducedMotion: false },
  { name: 'F mobile, system light, dark saved', width: 390, systemDark: false, stored: 'dark', reducedMotion: false }
]

export const reducedMotionVariant: ClientVariant = { name: 'E desktop, reduced motion', width: 1280, systemDark: false, stored: null, reducedMotion: true }

const queryMatches = (query: string, variant: ClientVariant) => {
  if (query.includes('prefers-color-scheme: dark')) return variant.systemDark
  if (query.includes('prefers-reduced-motion')) return variant.reducedMotion

  const min = query.match(/\(min-width:\s*(\d+)px\)/)
  const max = query.match(/\(max-width:\s*(\d+)px\)/)

  if (min && window.innerWidth < Number(min[1])) return false
  if (max && window.innerWidth > Number(max[1])) return false

  return Boolean(min || max)
}

export const applyClientVariant = (variant: ClientVariant) => {
  const originalMatchMedia = window.matchMedia
  const originalWidth = window.innerWidth

  setViewportWidth(variant.width)

  window.matchMedia = ((query: string) => ({
    matches: queryMatches(query, variant),
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => true
  })) as typeof window.matchMedia

  window.localStorage.clear()

  if (variant.stored) window.localStorage.setItem('enchase-color-mode', variant.stored)

  return () => {
    window.matchMedia = originalMatchMedia
    setViewportWidth(originalWidth)
    window.localStorage.clear()
    delete document.documentElement.dataset.theme
    document.documentElement.style.colorScheme = ''
    document.body.innerHTML = ''
  }
}
