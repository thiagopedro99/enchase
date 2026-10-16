import { parseColor } from './rgb.ts'

import type { Rgba } from './rgb.ts'

const blend = (foreground: Rgba, background: Rgba): Rgba => ({
  r: foreground.r * foreground.a + background.r * (1 - foreground.a),
  g: foreground.g * foreground.a + background.g * (1 - foreground.a),
  b: foreground.b * foreground.a + background.b * (1 - foreground.a),
  a: 1
})

const luminance = ({ r, g, b }: Rgba) => {
  const [red, green, blue] = [r, g, b].map((channel) => {
    const value = channel / 255

    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}

export const canMeasureContrast = (value: string) => parseColor(value) !== null

export const contrastRatio = (foreground: string, background: string) => {
  const parsedBase = parseColor(background)
  const parsedText = parseColor(foreground)

  if (!parsedBase || !parsedText) return Number.NaN

  const text = blend(parsedText, parsedBase)
  const [lighter, darker] = [luminance(text), luminance(parsedBase)].sort((a, b) => b - a)

  return (lighter + 0.05) / (darker + 0.05)
}
