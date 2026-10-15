import { alignmentSides } from './geometry.ts'
import { candidatesOf, split } from './placement.ts'

import type { Overflow, Placement, Rect } from './types.ts'

type Attempt = {
  placement: Placement
  overflows: number[]
}

const total = (attempt: Attempt) => attempt.overflows.reduce((sum, value) => sum + Math.max(value, 0), 0)

export const pickPlacement = (initial: Placement, reference: Rect, size: Rect, measure: (placement: Placement) => Overflow, rtl: boolean) => {
  const attempts: Attempt[] = candidatesOf(initial).map((placement) => {
    const overflow = measure(placement)
    const [first, second] = alignmentSides(placement, reference, size, rtl)

    return { placement, overflows: [overflow[split(placement)[0]], overflow[first], overflow[second]] }
  })
  const fits = attempts.find((attempt) => attempt.overflows.every((value) => value <= 0))
  if (fits) return fits.placement

  const mainFits = attempts.filter((attempt) => attempt.overflows[0] <= 0).sort((a, b) => a.overflows[1] - b.overflows[1])[0]
  if (mainFits) return mainFits.placement

  return [...attempts].sort((a, b) => total(a) - total(b))[0].placement
}
