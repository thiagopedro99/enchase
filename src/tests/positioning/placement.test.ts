import { describe, expect, it } from 'vitest'

import { candidatesOf, flipAlign, flipSide, resolvePlacement } from '../../positioning/placement.ts'
import { coordsFor, overflowOf } from '../../positioning/geometry.ts'
import { pickPlacement } from '../../positioning/pickPlacement.ts'

describe('placement helpers', () => {
  it('flips the side and the alignment independently', () => {
    expect(flipSide('top-start')).toBe('bottom-start')
    expect(flipAlign('top-start')).toBe('top-end')
    expect(flipSide('left')).toBe('right')
    expect(flipAlign('left')).toBe('left')
  })

  it('tries only the opposite side for a centered placement and four for an aligned one', () => {
    expect(candidatesOf('top')).toEqual(['top', 'bottom'])
    expect(candidatesOf('top-start')).toEqual(['top-start', 'top-end', 'bottom-start', 'bottom-end'])
  })

  it('resolves the logical sides with the direction', () => {
    expect(resolvePlacement('start', false)).toBe('left')
    expect(resolvePlacement('start', true)).toBe('right')
    expect(resolvePlacement('end-start', false)).toBe('right-start')
    expect(resolvePlacement('bottom-end', true)).toBe('bottom-end')
  })
})

describe('placement geometry', () => {
  const reference = { x: 100, y: 100, width: 40, height: 20 }
  const size = { x: 0, y: 0, width: 80, height: 50 }

  it('centers on the reference and honors the offset', () => {
    expect(coordsFor('bottom', reference, size, 8, false)).toEqual({ x: 80, y: 128 })
    expect(coordsFor('top', reference, size, 8, false)).toEqual({ x: 80, y: 42 })
    expect(coordsFor('right', reference, size, 8, false)).toEqual({ x: 148, y: 85 })
  })

  it('aligns to the start and to the end, mirroring on the inline axis in right to left', () => {
    expect(coordsFor('bottom-start', reference, size, 0, false).x).toBe(100)
    expect(coordsFor('bottom-start', reference, size, 0, true).x).toBe(60)
    expect(coordsFor('bottom-end', reference, size, 0, false).x).toBe(60)
  })

  it('measures how far the box goes past each edge of the bounds', () => {
    expect(overflowOf(-10, 5, size, { x: 0, y: 0, width: 300, height: 200 }, 0)).toEqual({ top: -5, left: 10, bottom: -145, right: -230 })
  })

  it('keeps the placement that fits, and otherwise the one with the least overflow', () => {
    const bounds = { x: 0, y: 0, width: 300, height: 200 }
    const near = { x: 100, y: 10, width: 40, height: 20 }
    const measure = (placement: Parameters<typeof coordsFor>[0]) => {
      const { x, y } = coordsFor(placement, near, size, 0, false)

      return overflowOf(x, y, size, bounds, 0)
    }

    expect(pickPlacement('top', near, size, measure, false)).toBe('bottom')
    expect(pickPlacement('bottom', near, size, measure, false)).toBe('bottom')
  })
})
