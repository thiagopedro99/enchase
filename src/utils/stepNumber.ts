export const decimalPlaces = (value: number) => {
  const [mantissa, exponent = '0'] = String(value).toLowerCase().split('e')
  const fraction = mantissa.split('.')[1]?.length ?? 0

  return Math.max(fraction - Number(exponent), 0)
}

export const clampNumber = (value: number, min?: number, max?: number) => Math.min(Math.max(value, min ?? Number.NEGATIVE_INFINITY), max ?? Number.POSITIVE_INFINITY)

const roundTo = (value: number, places: number) => Number(value.toFixed(Math.min(places, 100)))

export const stepNumber = (value: number, direction: 1 | -1, step: number, min?: number, max?: number) => {
  const base = min ?? 0
  const places = Math.max(decimalPlaces(step), decimalPlaces(base), decimalPlaces(value))
  const ratio = roundTo((value - base) / step, 8)
  const onGrid = Number.isInteger(ratio)
  const index = direction > 0 ? (onGrid ? ratio + 1 : Math.ceil(ratio)) : onGrid ? ratio - 1 : Math.floor(ratio)

  return clampNumber(roundTo(base + index * step, places), min, max) + 0
}
