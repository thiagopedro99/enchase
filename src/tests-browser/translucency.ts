import { contrastRatio } from '@styles/theme/contrast.ts'
import { parseComputedColor } from './color.ts'

import type { Rgba } from './color.ts'

export const supportsTranslucency = (CSS.supports('backdrop-filter', 'blur(1px)') || CSS.supports('-webkit-backdrop-filter', 'blur(1px)')) && CSS.supports('color', 'color-mix(in srgb, red 50%, transparent)')

export const backdropOf = (element: HTMLElement) => {
  const style = getComputedStyle(element)

  return style.backdropFilter || style.getPropertyValue('-webkit-backdrop-filter') || 'none'
}

export const surfaceOf = (element: HTMLElement) => parseComputedColor(getComputedStyle(element).backgroundColor)

const blended = (surface: Rgba, behind: number) => `rgb(${[surface.r, surface.g, surface.b].map((channel) => Math.round(channel * surface.a + behind * (1 - surface.a))).join(', ')})`

export const worstContrast = (foreground: string, surface: Rgba) => Math.min(contrastRatio(foreground, blended(surface, 0)), contrastRatio(foreground, blended(surface, 255)))

export const rootVariable = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()
