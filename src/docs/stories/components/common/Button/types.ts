import type { ButtonProps } from 'enchase'

export type ButtonMotionChoice = 'default' | 'off' | 'press' | 'lift'

export type ButtonMotionControls = {
  motionRecipe: ButtonMotionChoice
  motionDuration?: number
  motionScale?: number
  motionDistance?: number
}

export type ButtonStoryArgs = ButtonProps & ButtonMotionControls
