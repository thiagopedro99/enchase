import { isVertical, split } from './placement.ts'

import type { ArrowOptions, ArrowPosition, Placement, Rect } from './types.ts'

export const arrowPosition = (options: ArrowOptions | undefined, placement: Placement, reference: Rect, coords: { x: number; y: number }, size: Rect, floating: HTMLElement): ArrowPosition | undefined => {
  if (!options) return undefined

  const { element, padding = 0 } = options
  const vertical = isVertical(split(placement)[0])
  const length = vertical ? element.offsetWidth : element.offsetHeight
  const border = vertical ? floating.clientLeft : floating.clientTop
  const available = (vertical ? size.width : size.height) - length - padding
  const center = vertical ? reference.x + reference.width / 2 - coords.x : reference.y + reference.height / 2 - coords.y
  const offset = Math.max(padding, Math.min(center - length / 2, Math.max(padding, available))) - border

  return vertical ? { x: offset } : { y: offset }
}
