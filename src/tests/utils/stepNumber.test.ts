import { describe, expect, it } from 'vitest'

import { clampNumber, decimalPlaces, stepNumber } from '@utils/stepNumber.ts'

describe('decimalPlaces', () => {
  it('counts the digits after the decimal point', () => {
    expect(decimalPlaces(1)).toBe(0)
    expect(decimalPlaces(0.1)).toBe(1)
    expect(decimalPlaces(1.25)).toBe(2)
    expect(decimalPlaces(123456789.123)).toBe(3)
    expect(decimalPlaces(-0.005)).toBe(3)
  })

  it('reads numbers that JavaScript writes with an exponent', () => {
    expect(decimalPlaces(1e-7)).toBe(7)
    expect(decimalPlaces(1.5e-7)).toBe(8)
    expect(decimalPlaces(1e21)).toBe(0)
  })
})

describe('clampNumber', () => {
  it('keeps a number inside the limits that exist', () => {
    expect(clampNumber(5, 0, 10)).toBe(5)
    expect(clampNumber(-5, 0, 10)).toBe(0)
    expect(clampNumber(15, 0, 10)).toBe(10)
    expect(clampNumber(15, 0)).toBe(15)
    expect(clampNumber(-15, undefined, 10)).toBe(-15)
    expect(clampNumber(7)).toBe(7)
  })
})

describe('stepNumber', () => {
  it('moves one step up or down', () => {
    expect(stepNumber(0, 1, 1)).toBe(1)
    expect(stepNumber(1, -1, 1)).toBe(0)
    expect(stepNumber(0, -1, 1)).toBe(-1)
    expect(stepNumber(-1, 1, 1)).toBe(0)
  })

  it('does not collect floating point error', () => {
    expect(stepNumber(0.1 + 0.2, 1, 0.1)).toBe(0.4)
    expect(stepNumber(0.3, -1, 0.1)).toBe(0.2)
    expect(stepNumber(1.1, 1, 0.1)).toBe(1.2)
    expect(stepNumber(0.07, 1, 0.01)).toBe(0.08)
    expect(stepNumber(1.005, 1, 0.01)).toBe(1.01)
    expect(stepNumber(1e-7, 1, 1e-7)).toBe(2e-7)
  })

  it('lands on the next point of the grid when the value is between two', () => {
    expect(stepNumber(3, 1, 5, 0)).toBe(5)
    expect(stepNumber(3, -1, 5, 0)).toBe(0)
    expect(stepNumber(5, 1, 5, 0)).toBe(10)
    expect(stepNumber(7, 1, 5, 2)).toBe(12)
    expect(stepNumber(7, -1, 5, 2)).toBe(2)
    expect(stepNumber(8, -1, 5, 2)).toBe(7)
    expect(stepNumber(-3, 1, 5)).toBe(0)
    expect(stepNumber(-3, -1, 5)).toBe(-5)
  })

  it('stops at the limits', () => {
    expect(stepNumber(9, 1, 5, 0, 10)).toBe(10)
    expect(stepNumber(10, 1, 1, 0, 10)).toBe(10)
    expect(stepNumber(0, -1, 1, 0, 10)).toBe(0)
    expect(stepNumber(2, -1, 5, 1, 10)).toBe(1)
  })

  it('never returns a negative zero', () => {
    expect(Object.is(stepNumber(1, -1, 1), 0)).toBe(true)
    expect(Object.is(stepNumber(-0.5, 1, 0.5), 0)).toBe(true)
  })

  it('always lands on a point of the grid, never goes backwards and respects the limits', () => {
    const steps = [1, 0.5, 0.1, 0.25, 2, 5, 10, 0.01]
    const minimums = [undefined, 0, -3, 1.5]
    const starts = [-7.3, -1, -0.1, 0, 0.05, 0.3, 1, 2.5, 4.99, 12, 99.9]

    for (const step of steps) {
      for (const min of minimums) {
        for (const max of [undefined, 20]) {
          for (const start of starts) {
            const up = stepNumber(start, 1, step, min, max)
            const down = stepNumber(start, -1, step, min, max)
            const base = min ?? 0

            expect(up, `${start} up by ${step}`).toBeGreaterThanOrEqual(Math.min(start, max ?? Infinity))
            expect(down, `${start} down by ${step}`).toBeLessThanOrEqual(Math.max(start, min ?? -Infinity))
            if (min !== undefined) expect(down).toBeGreaterThanOrEqual(min)
            if (max !== undefined) expect(up).toBeLessThanOrEqual(max)
            if (max === undefined) expect(Math.abs((up - base) / step - Math.round((up - base) / step))).toBeLessThan(1e-6)
            if (min === undefined) expect(Math.abs((down - base) / step - Math.round((down - base) / step))).toBeLessThan(1e-6)
          }
        }
      }
    }
  })
})
