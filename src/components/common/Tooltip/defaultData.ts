import type { TooltipPosition } from './types.ts'

export const closeDelay = 120

export const bubbleGap = 8

export const placeBubble = (rect: DOMRect, position: TooltipPosition) => {
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
