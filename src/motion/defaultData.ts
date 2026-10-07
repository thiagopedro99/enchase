import type { BaseTuning, MotionPreset, MotionSettings, RecipeName, PresetScale } from './types.ts'

export const defaultEase: [number, number, number, number] = [0.4, 0, 0.2, 1]

export const presetScale: Record<MotionPreset, PresetScale> = {
  off: { duration: 0, distance: 0 },
  subtle: { duration: 0.75, distance: 0.5 },
  standard: { duration: 1, distance: 1 },
  expressive: { duration: 1.4, distance: 1.6 }
}

export const baseTuning: Record<RecipeName, BaseTuning> = {
  fade: { duration: 0.15, distance: 0, scale: 1 },
  pop: { duration: 0.2, distance: 12, scale: 0.96 },
  slide: { duration: 0.25, distance: 32, scale: 1 },
  press: { duration: 0.12, distance: 0, scale: 0.97 },
  lift: { duration: 0.15, distance: 2, scale: 1 },
  resize: { duration: 0.25, distance: 0, scale: 1 },
  spin: { duration: 0.8, distance: 0, scale: 1 },
  shimmer: { duration: 1.5, distance: 0, scale: 1 }
}

export const loopRecipes: RecipeName[] = ['spin', 'shimmer']

export const pulseDuration = 1.6

export const shimmerTravel = 468

export const defaultMotionSettings: MotionSettings = {
  mode: 'auto',
  preset: 'standard',
  recipes: {}
}
