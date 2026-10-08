import { hexColor } from './colorFormat.ts'

type Rgba = { r: number; g: number; b: number; a: number }

const rgbColor = /^rgba?\(\s*(\d+(?:\.\d+)?)[\s,]+(\d+(?:\.\d+)?)[\s,]+(\d+(?:\.\d+)?)(?:\s*[\s,/]\s*(\d+(?:\.\d+)?%?))?\s*\)$/i

const parseAlpha = (value: string | undefined) => {
  if (value === undefined) return 1

  return value.endsWith('%') ? Number(value.slice(0, -1)) / 100 : Number(value)
}

const parseColor = (value: string): Rgba | null => {
  const hex = hexColor.exec(value)?.[1]

  if (hex) {
    const full = hex.length <= 4 ? [...hex].map((digit) => digit + digit).join('') : hex
    const alpha = full.length === 8 ? parseInt(full.slice(6, 8), 16) / 255 : 1

    return { r: parseInt(full.slice(0, 2), 16), g: parseInt(full.slice(2, 4), 16), b: parseInt(full.slice(4, 6), 16), a: alpha }
  }

  const rgb = rgbColor.exec(value)

  if (!rgb) return null

  const color = { r: Number(rgb[1]), g: Number(rgb[2]), b: Number(rgb[3]), a: parseAlpha(rgb[4]) }

  return color.r <= 255 && color.g <= 255 && color.b <= 255 && color.a <= 1 ? color : null
}

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
