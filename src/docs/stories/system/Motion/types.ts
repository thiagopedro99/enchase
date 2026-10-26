export type MotionPreset = 'off' | 'subtle' | 'standard' | 'expressive'

export type MotionMode = 'auto' | 'never'

export type MotionStoryArgs = {
  preset: MotionPreset
  mode: MotionMode
  baseDuration: number
  distance: number
  gentleDuration: number
  snappyDuration: number
  snappyBounce: number
  bouncyDuration: number
  bouncyBounce: number
}

export type VariableRow = {
  component: string
  variables: string
}
