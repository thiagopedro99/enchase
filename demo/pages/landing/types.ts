import type { ShapePreset } from 'enchase/theme'
import type { RevealOrigin } from './reveal.ts'

export type LookStyle = 'enchase' | 'shadcn' | 'workbench'

export type LookShape = ShapePreset | 'auto'

export interface Look {
  style: LookStyle
  brand: string
  shape: LookShape
  compact: boolean
}

export type LookChange = (look: Look, origin?: RevealOrigin) => void

export interface LandingProps {
  look: Look
  onLookChange: (look: Look) => void
}
