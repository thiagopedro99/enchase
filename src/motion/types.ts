import type { HTMLMotionProps } from 'motion/react'

export type MotionMode = 'auto' | 'never'

export type MotionPreset = 'off' | 'subtle' | 'standard' | 'expressive'

export type RecipeName = 'fade' | 'pop' | 'slide' | 'press' | 'lift' | 'resize' | 'spin' | 'shimmer'

export type SlideFrom = 'top' | 'bottom' | 'left' | 'right'

export type RecipeTuning = {
  duration?: number
  distance?: number
  scale?: number
}

export type MotionSettings = {
  mode: MotionMode
  preset: MotionPreset
  recipes: Partial<Record<RecipeName, RecipeTuning>>
}

export type MotionOverride =
  | false
  | {
      recipe?: RecipeName
      from?: SlideFrom
      tuning?: RecipeTuning
    }

export type RecipeProps = Pick<HTMLMotionProps<'div'>, 'initial' | 'animate' | 'exit' | 'transition' | 'whileHover' | 'whileTap'>

export type ResolveRecipeInput = {
  name: RecipeName
  settings: MotionSettings
  prefersReduced: boolean
  from?: SlideFrom
  tuning?: RecipeTuning
  disabled?: boolean
}

export type BaseTuning = Required<RecipeTuning>

export type PresetScale = {
  duration: number
  distance: number
}
