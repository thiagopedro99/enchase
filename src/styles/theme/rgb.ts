import { hexColor } from './color.ts'

export type Rgba = { r: number; g: number; b: number; a: number }

const rgbColor = /^rgba?\(\s*(\d+(?:\.\d+)?)[\s,]+(\d+(?:\.\d+)?)[\s,]+(\d+(?:\.\d+)?)(?:\s*[\s,/]\s*(\d+(?:\.\d+)?%?))?\s*\)$/i

const parseAlpha = (value: string | undefined) => {
  if (value === undefined) return 1

  return value.endsWith('%') ? Number(value.slice(0, -1)) / 100 : Number(value)
}

export const parseColor = (value: string): Rgba | null => {
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
