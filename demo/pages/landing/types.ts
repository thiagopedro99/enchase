import type { ShapePreset } from 'enchase/theme'

export type LookStyle = 'enchase' | 'shadcn' | 'workbench'

export type LookShape = ShapePreset | 'auto'

export interface Look {
  style: LookStyle
  brand: string
  shape: LookShape
  compact: boolean
}

export interface LandingProps {
  look: Look
  onLookChange: (look: Look) => void
}
