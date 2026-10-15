import { baseTuning, presetScale } from '@motion/defaultData.ts'

import type { MotionOverride, MotionSettings } from '@motion/types.ts'
import type { CSSProperties } from 'react'

export type CardMotion = 'lift' | 'off'

type CardMotionResult = {
  motion: CardMotion
  style: CSSProperties | undefined
}

const off: CardMotionResult = { motion: 'off', style: undefined }

export const resolveCardMotion = (settings: MotionSettings, override?: MotionOverride): CardMotionResult => {
  if (override === false || settings.mode === 'never' || settings.preset === 'off') return off

  const requested = override && override.recipe ? override.recipe : 'lift'
  if (requested !== 'lift') return off

  const scaled = settings.preset !== 'standard'
  const custom = { ...settings.recipes.lift, ...(override ? override.tuning : undefined) }
  const duration = custom.duration ?? (scaled ? baseTuning.lift.duration * presetScale[settings.preset].duration : undefined)
  const distance = custom.distance ?? (scaled ? baseTuning.lift.distance * presetScale[settings.preset].distance : undefined)
  const vars: Record<string, string> = {}

  if (duration !== undefined) vars['--enchase-card-duration'] = `${Math.round(duration * 1000)}ms`
  if (distance !== undefined) vars['--enchase-card-distance'] = `${distance}px`

  return { motion: 'lift', style: Object.keys(vars).length > 0 ? (vars as CSSProperties) : undefined }
}
