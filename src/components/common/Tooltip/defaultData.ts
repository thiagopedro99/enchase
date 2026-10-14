import { baseTuning, presetScale } from '@motion/defaultData.ts'

import type { MotionOverride, MotionSettings } from '@motion/types.ts'
import type { Direction } from '@locales/types.ts'
import type { TooltipAnchor, TooltipAnimation, TooltipBox, TooltipPlacement, TooltipPosition } from './types.ts'

export const defaultPosition: TooltipPosition = 'top'

export const openDelay = 0

export const closeDelay = 120

export const bubbleGap = 8

export const viewportMargin = 8

export const exitSafetyMs = 50

export const opposite: Record<TooltipPlacement, TooltipPlacement> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left'
}

export const resolvePlacement = (position: TooltipPosition, dir: Direction): TooltipPlacement => {
  if (position === 'start') return dir === 'rtl' ? 'right' : 'left'
  if (position === 'end') return dir === 'rtl' ? 'left' : 'right'

  return position
}

export const placeBubble = (rect: DOMRect, position: TooltipPlacement): TooltipAnchor => {
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  const placements = {
    top: { top: rect.top - bubbleGap, left: centerX },
    bottom: { top: rect.bottom + bubbleGap, left: centerX },
    left: { top: centerY, left: rect.left - bubbleGap },
    right: { top: centerY, left: rect.right + bubbleGap }
  }

  return placements[position]
}

export const bubbleBox = (anchor: TooltipAnchor, size: { width: number; height: number }, placement: TooltipPlacement): TooltipBox => {
  if (placement === 'top') return { left: anchor.left - size.width / 2, right: anchor.left + size.width / 2, top: anchor.top - size.height, bottom: anchor.top }
  if (placement === 'bottom') return { left: anchor.left - size.width / 2, right: anchor.left + size.width / 2, top: anchor.top, bottom: anchor.top + size.height }
  if (placement === 'left') return { left: anchor.left - size.width, right: anchor.left, top: anchor.top - size.height / 2, bottom: anchor.top + size.height / 2 }

  return { left: anchor.left, right: anchor.left + size.width, top: anchor.top - size.height / 2, bottom: anchor.top + size.height / 2 }
}

export const overflowsMainAxis = (bubble: TooltipBox, placement: TooltipPlacement, viewport: { width: number; height: number }) => {
  if (placement === 'top') return bubble.top < viewportMargin
  if (placement === 'bottom') return bubble.bottom > viewport.height - viewportMargin
  if (placement === 'left') return bubble.left < viewportMargin

  return bubble.right > viewport.width - viewportMargin
}

export const crossAxisShift = (bubble: TooltipBox, placement: TooltipPlacement, viewport: { width: number; height: number }) => {
  const horizontal = placement === 'top' || placement === 'bottom'
  const start = horizontal ? bubble.left : bubble.top
  const end = horizontal ? bubble.right : bubble.bottom
  const limit = horizontal ? viewport.width : viewport.height

  if (start < viewportMargin) return viewportMargin - start
  if (end > limit - viewportMargin) return limit - viewportMargin - end

  return 0
}

export const resolveAnimation = (override: MotionOverride | undefined, settings: MotionSettings): TooltipAnimation => {
  const off = override === false || settings.mode === 'never' || settings.preset === 'off'
  const recipe = override ? (override.recipe ?? 'fade') : 'fade'
  const base = baseTuning[recipe]
  const preset = presetScale[settings.preset]
  const custom = { ...settings.recipes[recipe], ...(override ? override.tuning : undefined) }
  const pops = recipe === 'pop'

  return {
    off,
    duration: custom.duration ?? base.duration * preset.duration,
    scale: pops ? (custom.scale ?? 1 - (1 - base.scale) * preset.distance) : 1
  }
}
