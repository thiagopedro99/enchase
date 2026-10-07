import type { ButtonProps } from '@components/common/Button/types.ts'

export type ButtonMotionChoice = 'default' | 'off' | 'press' | 'lift'

export type ButtonMotionControls = {
  motionRecipe: ButtonMotionChoice
  motionDuration?: number
  motionScale?: number
  motionDistance?: number
}

export type ButtonStoryArgs = ButtonProps & ButtonMotionControls
