import { baseTokens } from '../tokens/index.ts'

import type { BaseTokens } from '../tokens/types.ts'

export type ShapePreset = 'pill' | 'soft' | 'square'

export type RadiusTokens = BaseTokens['borderRadius']

export type RadiusOverrides = Partial<Omit<RadiusTokens, 'none'>>

export const shapePresets: Record<ShapePreset, RadiusTokens> = {
  pill: baseTokens.borderRadius,
  soft: { none: '0', xs: '0.25rem', sm: '0.375rem', md: '0.625rem', lg: '0.875rem', xl: '1rem', '2xl': '1.25rem', control: '0.75rem', button: '0.75rem', full: '9999px' },
  square: { none: '0', xs: '0', sm: '0.125rem', md: '0.25rem', lg: '0.25rem', xl: '0.375rem', '2xl': '0.5rem', control: '0.25rem', button: '0.25rem', full: '9999px' }
}

const radius = /^(?:0|(\d+(?:\.\d+)?|\.\d+)(rem|em|px|%))$/

const maxRadius = { rem: 1000, em: 1000, px: 10000, '%': 100 }

export const isShapePreset = (value: unknown): value is ShapePreset => typeof value === 'string' && Object.prototype.hasOwnProperty.call(shapePresets, value)

export const isValidRadius = (value: unknown): value is string => {
  if (typeof value !== 'string') return false

  const match = radius.exec(value)

  if (!match) return false

  return match[1] === undefined || Number(match[1]) <= maxRadius[match[2] as keyof typeof maxRadius]
}

export const assertShapePreset = (value: unknown): ShapePreset => {
  if (!isShapePreset(value)) throw new Error(`Unknown shape ${JSON.stringify(value)}: use ${Object.keys(shapePresets).join(', ')}`)

  return value
}

export const assertValidRadius = (name: string, value: unknown): string => {
  if (!isValidRadius(value)) throw new Error(`Invalid radius for "${name}": ${JSON.stringify(value)}`)

  return value
}
