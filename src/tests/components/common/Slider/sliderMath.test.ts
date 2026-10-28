import { describe, expect, it } from 'vitest'

import { lastStep, percentOf, snap } from '@components/common/Slider/sliderMath.ts'

describe('snap', () => {
  it.each([
    [0.30000000000000004, 0, 1, 0.1, 0.3],
    [0.1 + 0.2, 0, 1, 0.1, 0.3],
    [7, 0, 10, 3, 6],
    [9.9, 0, 10, 3, 9],
    [10, 0, 10, 3, 9],
    [14, 10, 20, 4, 14],
    [18.5, 10, 20, 4, 18],
    [-5, 0, 100, 1, 0],
    [250, 0, 100, 1, 100],
    [2.675, 0, 5, 0.005, 2.675],
    [0.0000003, 0, 1, 0.0000001, 0.0000003],
    [33.3, 0, 100, 0.5, 33.5],
    [Number.NaN, 4, 9, 1, 4],
    [Number.POSITIVE_INFINITY, 4, 9, 1, 4]
  ])('puts %s on the nearest step of %s to %s every %s: %s', (value, min, max, step, expected) => {
    expect(snap(value, min, max, step)).toBe(expected)
  })

  it('keeps the offset of the minimum when it is not on the step of zero', () => {
    expect(snap(12, 1, 30, 5)).toBe(11)
    expect(snap(14, 1, 30, 5)).toBe(16)
  })
})

describe('lastStep', () => {
  it.each([
    [0, 100, 1, 100],
    [0, 10, 3, 9],
    [10, 20, 4, 18],
    [0, 0.3, 0.1, 0.30000000000000004],
    [5, 5, 1, 5]
  ])('is the last step that fits from %s to %s every %s', (min, max, step, expected) => {
    expect(lastStep(min, max, step)).toBeCloseTo(expected, 10)
  })
})

describe('percentOf', () => {
  it.each([
    [50, 0, 100, 50],
    [30, 10, 50, 50],
    [-4, 0, 10, 0],
    [14, 0, 10, 100],
    [5, 5, 5, 0]
  ])('puts %s between %s and %s at %s percent', (value, min, max, expected) => {
    expect(percentOf(value, min, max)).toBe(expected)
  })
})
