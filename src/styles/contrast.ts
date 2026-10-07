type Rgba = { r: number; g: number; b: number; a: number }

const parseColor = (value: string): Rgba => {
  const hex = value.replace('#', '')
  if (/^[0-9a-f]{6,8}$/i.test(hex)) {
    const alpha = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1

    return { r: parseInt(hex.slice(0, 2), 16), g: parseInt(hex.slice(2, 4), 16), b: parseInt(hex.slice(4, 6), 16), a: alpha }
  }

  const [r, g, b, a = '1'] = value.match(/[\d.]+/g) ?? []

  return { r: Number(r), g: Number(g), b: Number(b), a: Number(a) }
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

export const contrastRatio = (foreground: string, background: string) => {
  const base = parseColor(background)
  const text = blend(parseColor(foreground), base)
  const [lighter, darker] = [luminance(text), luminance(base)].sort((a, b) => b - a)

  return (lighter + 0.05) / (darker + 0.05)
}
