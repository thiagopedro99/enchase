export type Rgba = { r: number; g: number; b: number; a: number }

const numeric = '(-?[\\d.]+(?:e-?\\d+)?)(%?)'

const srgbColor = new RegExp(`^color\\(srgb ${numeric} ${numeric} ${numeric}(?: / ${numeric})?\\)$`)

const rgbColor = new RegExp(`^rgba?\\(${numeric}[, ]+${numeric}[, ]+${numeric}(?:[,/ ]+${numeric})?\\)$`)

const unit = (value: string, percent: string) => (percent ? parseFloat(value) / 100 : parseFloat(value))

export const parseComputedColor = (value: string): Rgba => {
  const srgb = srgbColor.exec(value)

  if (srgb) return { r: Math.round(unit(srgb[1], srgb[2]) * 255), g: Math.round(unit(srgb[3], srgb[4]) * 255), b: Math.round(unit(srgb[5], srgb[6]) * 255), a: srgb[7] === undefined ? 1 : unit(srgb[7], srgb[8]) }

  const rgb = rgbColor.exec(value)

  if (rgb) return { r: parseFloat(rgb[1]), g: parseFloat(rgb[3]), b: parseFloat(rgb[5]), a: rgb[7] === undefined ? 1 : unit(rgb[7], rgb[8]) }

  throw new Error(`cannot read the color "${value}"`)
}
