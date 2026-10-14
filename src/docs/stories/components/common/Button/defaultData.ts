import type { MotionOverride, RecipeTuning } from 'enchase'

import type { ButtonMotionChoice, ButtonMotionControls } from './types.ts'

export const defaultVariant = 'primary'

export const defaultSize = 'md'

export const defaultFullWidth = false

export const defaultDisabled = false

export const defaultRecipe = 'press'

export const motionLabels: Record<ButtonMotionChoice, string> = {
  default: 'Padrão (press)',
  off: 'Desligada',
  press: 'press',
  lift: 'lift'
}

export const toAnimation = ({ motionRecipe, motionDuration, motionScale, motionDistance }: ButtonMotionControls): MotionOverride | undefined => {
  if (motionRecipe === 'default') return undefined
  if (motionRecipe === 'off') return false

  const tuning: RecipeTuning = {
    ...(motionDuration !== undefined && { duration: motionDuration }),
    ...(motionRecipe === 'press' && motionScale !== undefined && { scale: motionScale }),
    ...(motionRecipe === 'lift' && motionDistance !== undefined && { distance: motionDistance })
  }

  return Object.keys(tuning).length > 0 ? { recipe: motionRecipe, tuning } : { recipe: motionRecipe }
}
