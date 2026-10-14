import { baseTuning, presetScale } from '@motion/defaultData.ts'
import { defaultRecipe } from './defaultData.ts'

import type { MotionOverride, MotionSettings } from '@motion/types.ts'
import type { CSSProperties } from 'react'

export type ButtonMotion = 'press' | 'lift' | 'off'

type ButtonMotionResult = {
  motion: ButtonMotion
  style: CSSProperties | undefined
}

const off: ButtonMotionResult = { motion: 'off', style: undefined }

export const resolveButtonMotion = (settings: MotionSettings, override?: MotionOverride): ButtonMotionResult => {
  if (override === false || settings.mode === 'never' || settings.preset === 'off') return off

  const requested = override ? (override.recipe ?? defaultRecipe) : defaultRecipe
  if (requested !== 'press' && requested !== 'lift') return off

  const base = baseTuning[requested]
  const scaled = settings.preset !== 'standard'
  const scale = presetScale[settings.preset]
  const custom = { ...settings.recipes[requested], ...(override ? override.tuning : undefined) }
  const duration = custom.duration ?? (scaled ? base.duration * scale.duration : undefined)
  const pressScale = custom.scale ?? (scaled ? 1 - (1 - base.scale) * scale.distance : undefined)
  const lift = custom.distance ?? (scaled ? base.distance * scale.distance : undefined)
  const vars: Record<string, string> = {}

  if (duration !== undefined) vars['--enchase-button-duration'] = `${Math.round(duration * 1000)}ms`
  if (requested === 'press' && pressScale !== undefined) vars['--enchase-button-scale'] = String(pressScale)
  if (requested === 'lift' && lift !== undefined) vars['--enchase-button-lift'] = `${lift}px`

  return { motion: requested, style: Object.keys(vars).length > 0 ? (vars as CSSProperties) : undefined }
}
