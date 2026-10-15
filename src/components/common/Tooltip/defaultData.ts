import { baseTuning, presetScale } from '@motion/defaultData.ts'

import type { MotionOverride, MotionSettings } from '@motion/types.ts'
import type { TooltipAnimation, TooltipPosition } from './types.ts'

export const defaultPosition: TooltipPosition = 'top'

export const openDelay = 100

export const groupWindowMs = 300

export const tooltipGroup = { open: 0, closedAt: Number.NEGATIVE_INFINITY }

export const resetTooltipGroup = () => {
  tooltipGroup.open = 0
  tooltipGroup.closedAt = Number.NEGATIVE_INFINITY
}

export const joinsGroup = (now: number) => tooltipGroup.open > 0 || now - tooltipGroup.closedAt < groupWindowMs

export const closeDelay = 120

export const bubbleOffset = 8

export const viewportPadding = 8

export const resolveAnimation = (override: MotionOverride | undefined, settings: MotionSettings): TooltipAnimation => {
  const off = override === false || settings.mode === 'never' || settings.preset === 'off'
  const recipe = override ? (override.recipe ?? 'fade') : 'fade'
  const base = baseTuning[recipe]
  const preset = presetScale[settings.preset]
  const custom = { ...settings.recipes[recipe], ...(override ? override.tuning : undefined) }
  const pops = recipe === 'pop'

  return {
    off,
    pop: pops,
    duration: custom.duration ?? base.duration * preset.duration,
    scale: pops ? (custom.scale ?? 1 - (1 - base.scale) * preset.distance) : 1
  }
}
