import { enchaseStyle } from './enchase.ts'
import { shadcnStyle } from './shadcn.ts'

import type { StyleDefinition, StyleName } from './types.ts'

export const themeStyles: Record<StyleName, StyleDefinition> = { enchase: enchaseStyle, shadcn: shadcnStyle }

export const styleNames = Object.keys(themeStyles) as StyleName[]

export const isStyleName = (value: unknown): value is StyleName => typeof value === 'string' && Object.prototype.hasOwnProperty.call(themeStyles, value)

export const assertStyleName = (value: unknown): StyleName => {
  if (!isStyleName(value)) throw new Error(`Unknown style ${JSON.stringify(value)}: use ${styleNames.join(', ')}`)

  return value
}

export type { StyleDefinition, StyleModeDefinition, StyleName } from './types.ts'
