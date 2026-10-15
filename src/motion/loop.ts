import { baseTuning, presetScale } from './defaultData.ts'

import type { CSSProperties } from 'react'
import type { MotionOverride, MotionSettings } from './types.ts'

export type LoopRecipe = 'spin' | 'shimmer'

export type LoopMotion = {
  motion: 'on' | 'off'
  style: CSSProperties | undefined
}

export const loopDurationVariable: Record<LoopRecipe, string> = {
  spin: '--enchase-loading-duration',
  shimmer: '--enchase-skeleton-duration'
}

const off: LoopMotion = { motion: 'off', style: undefined }

export const resolveLoopMotion = (name: LoopRecipe, settings: MotionSettings, override?: MotionOverride): LoopMotion => {
  if (override === false || settings.mode === 'never' || settings.preset === 'off') return off

  const requested = override && override.recipe ? override.recipe : name
  if (requested !== name) return off

  const scaled = settings.preset !== 'standard'
  const custom = { ...settings.recipes[name], ...(override ? override.tuning : undefined) }
  const duration = custom.duration ?? (scaled ? baseTuning[name].duration * presetScale[settings.preset].duration : undefined)

  if (duration === undefined) return { motion: 'on', style: undefined }

  return { motion: 'on', style: { [loopDurationVariable[name]]: `${Math.round(duration * 1000)}ms` } as CSSProperties }
}
