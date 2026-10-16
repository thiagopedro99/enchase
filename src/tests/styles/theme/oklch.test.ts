import { describe, expect, it } from 'vitest'

import { oklchToHex, rgbToHex, rgbToOklch } from '@styles/theme/oklch.ts'
import { parseColor } from '@styles/theme/rgb.ts'

const rgbOf = (hex: string) => parseColor(hex) as { r: number; g: number; b: number; a: number }

const steps = [0, 51, 102, 153, 204, 255]

const samples = steps.flatMap((r) => steps.flatMap((g) => steps.map((b) => ({ r, g, b }))))

describe('rgbToOklch', () => {
  it('reads white and black as the ends of the lightness scale with no chroma', () => {
    expect(rgbToOklch({ r: 255, g: 255, b: 255 })).toMatchObject({ lightness: expect.closeTo(1, 4), chroma: expect.closeTo(0, 4) })
    expect(rgbToOklch({ r: 0, g: 0, b: 0 })).toMatchObject({ lightness: expect.closeTo(0, 4), chroma: expect.closeTo(0, 4) })
  })

  it('matches reference values of the OKLCH color space', () => {
    const indigo = rgbToOklch(rgbOf('#4F46E5'))
    const red = rgbToOklch(rgbOf('#FF0000'))

    expect(indigo.lightness).toBeCloseTo(0.511, 2)
    expect(indigo.chroma).toBeCloseTo(0.23, 2)
    expect(indigo.hue).toBeCloseTo(277, 0)
    expect(red.lightness).toBeCloseTo(0.628, 2)
    expect(red.chroma).toBeCloseTo(0.258, 2)
    expect(red.hue).toBeCloseTo(29.2, 0)
  })

  it('keeps the hue in the 0 to 360 range', () => {
    const hues = samples.map((sample) => rgbToOklch(sample).hue)

    expect(hues.every((hue) => hue >= 0 && hue < 360)).toBe(true)
  })
})

describe('oklchToHex', () => {
  it('returns the same color after a round trip, within one step per channel', () => {
    const failures = samples.filter((sample) => {
      const back = rgbOf(oklchToHex(rgbToOklch(sample)))

      return Math.max(Math.abs(back.r - sample.r), Math.abs(back.g - sample.g), Math.abs(back.b - sample.b)) > 1
    })

    expect(failures).toEqual([])
  })

  it('formats an upper case six digit hex', () => {
    expect(oklchToHex({ lightness: 0.5, chroma: 0.1, hue: 200 })).toMatch(/^#[0-9A-F]{6}$/)
  })

  it('clamps lightness to the ends and ignores chroma there', () => {
    expect(oklchToHex({ lightness: 1, chroma: 0.2, hue: 20 })).toBe('#FFFFFF')
    expect(oklchToHex({ lightness: 0, chroma: 0.2, hue: 20 })).toBe('#000000')
    expect(oklchToHex({ lightness: 1.4, chroma: 0, hue: 0 })).toBe('#FFFFFF')
    expect(oklchToHex({ lightness: -0.2, chroma: 0, hue: 0 })).toBe('#000000')
  })

  it('brings a color outside the sRGB gamut inside by lowering only the chroma', () => {
    const wanted = { lightness: 0.9, chroma: 0.4, hue: 150 }
    const fitted = rgbToOklch(rgbOf(oklchToHex(wanted)))

    expect(fitted.chroma).toBeLessThan(wanted.chroma)
    expect(fitted.lightness).toBeCloseTo(wanted.lightness, 1)
    expect(fitted.hue).toBeCloseTo(wanted.hue, -1)
  })

  it('leaves a color that is already inside the gamut as it is', () => {
    expect(oklchToHex(rgbToOklch(rgbOf('#4F46E5')))).toBe('#4F46E5')
  })
})

describe('rgbToHex', () => {
  it('formats upper case and rounds the channels', () => {
    expect(rgbToHex({ r: 79, g: 70, b: 229 })).toBe('#4F46E5')
    expect(rgbToHex({ r: 0.4, g: 254.6, b: 16 })).toBe('#00FF10')
  })
})
