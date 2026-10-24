export type MotionMode = 'auto' | 'never'

export type MotionPreset = 'off' | 'subtle' | 'standard' | 'expressive'

export type RecipeName = 'fade' | 'pop' | 'slide' | 'press' | 'lift' | 'resize' | 'spin' | 'shimmer'

export type SlideFrom = 'top' | 'bottom' | 'left' | 'right'

export type SpringName = 'gentle' | 'snappy' | 'bouncy'

export type RecipeTuning = {
  duration?: number | undefined
  distance?: number | undefined
  scale?: number | undefined
}

export type MotionSettings = {
  mode: MotionMode
  preset: MotionPreset
  recipes: Partial<Record<RecipeName, RecipeTuning>>
}

export type MotionOverride =
  | false
  | {
      recipe?: RecipeName | undefined
      from?: SlideFrom | undefined
      tuning?: RecipeTuning | undefined
    }

export type BaseTuning = Required<RecipeTuning>

export type PresetScale = {
  duration: number
  distance: number
}
