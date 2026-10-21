import { dimensionsOf, isRtl, viewportRect } from './viewport.ts'
import { coordsFor, overflowOf } from './geometry.ts'
import { isVertical, resolvePlacement, split } from './placement.ts'
import { pickPlacement } from './pickPlacement.ts'
import { arrowPosition } from './arrow.ts'
import { isHidden } from './clipping.ts'

import type { Overflow, Placement, PositionOptions, PositionResult, Side, VirtualElement } from './types.ts'

const maxAttempts = 2

const shifted = (value: number, low: number, high: number) => Math.max(value + low, Math.min(value, value - high))

export const computePosition = (reference: Element | VirtualElement, floating: HTMLElement, options: PositionOptions = {}, attempt = 0): PositionResult => {
  const { placement: input = 'bottom', offset = 0, padding = 0 } = options
  const rtl = isRtl(floating)
  const rect = reference.getBoundingClientRect()
  const size = dimensionsOf(floating)
  const bounds = viewportRect()
  const measure = (placement: Placement): Overflow => {
    const { x, y } = coordsFor(placement, rect, size, offset, rtl)

    return overflowOf(x, y, size, bounds, padding)
  }
  const placement = pickPlacement(resolvePlacement(input, rtl), rect, size, measure, rtl)
  const [side] = split(placement)
  const coords = coordsFor(placement, rect, size, offset, rtl)
  const overflow = overflowOf(coords.x, coords.y, size, bounds, padding)
  const axis = isVertical(side) ? 'x' : 'y'
  const [low, high]: [Side, Side] = axis === 'x' ? ['left', 'right'] : ['top', 'bottom']
  const position = { ...coords, [axis]: shifted(coords[axis], overflow[low], overflow[high]) }
  const clipWidth = size.width - overflow.left - overflow.right
  const clipHeight = size.height - overflow.top - overflow.bottom
  const result: PositionResult = {
    x: position.x,
    y: position.y,
    placement,
    availableWidth: axis === 'x' ? clipWidth : Math.min(size.width - overflow[side], clipWidth),
    availableHeight: axis === 'y' ? clipHeight : Math.min(size.height - overflow[side], clipHeight),
    referenceHidden: isHidden(reference, rect),
    arrow: arrowPosition(options.arrow, placement, rect, position, size, floating)
  }
  if (!options.apply) return result

  options.apply(result)
  const next = dimensionsOf(floating)
  if (attempt >= maxAttempts || (next.width === size.width && next.height === size.height)) return result

  return computePosition(reference, floating, options, attempt + 1)
}
