import { isVertical, opposite, split } from './placement.ts'

import type { Overflow, Placement, Rect, Side } from './types.ts'

export const coordsFor = (placement: Placement, reference: Rect, size: Rect, gap: number, rtl: boolean) => {
  const [side, align] = split(placement)
  const vertical = isVertical(side)
  const centerX = reference.x + reference.width / 2 - size.width / 2
  const centerY = reference.y + reference.height / 2 - size.height / 2
  const coords = {
    top: { x: centerX, y: reference.y - size.height - gap },
    bottom: { x: centerX, y: reference.y + reference.height + gap },
    left: { x: reference.x - size.width - gap, y: centerY },
    right: { x: reference.x + reference.width + gap, y: centerY }
  }[side]
  const axis = vertical ? 'x' : 'y'
  const half = vertical ? reference.width / 2 - size.width / 2 : reference.height / 2 - size.height / 2
  const direction = (align === 'start' ? -1 : align === 'end' ? 1 : 0) * (rtl && vertical ? -1 : 1)

  return { ...coords, [axis]: coords[axis] + half * direction }
}

export const overflowOf = (x: number, y: number, size: Rect, bounds: Rect, padding: number): Overflow => ({
  top: bounds.y - y + padding,
  left: bounds.x - x + padding,
  bottom: y + size.height - (bounds.y + bounds.height) + padding,
  right: x + size.width - (bounds.x + bounds.width) + padding
})

export const alignmentSides = (placement: Placement, reference: Rect, size: Rect, rtl: boolean): [Side, Side] => {
  const [side, align] = split(placement)
  const horizontal = isVertical(side)
  const start: Side = horizontal ? (align === (rtl ? 'end' : 'start') ? 'right' : 'left') : align === 'start' ? 'bottom' : 'top'
  const wider = horizontal ? reference.width > size.width : reference.height > size.height
  const main = wider ? opposite[start] : start

  return [main, opposite[main]]
}
