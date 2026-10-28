const decimalsOf = (value: number) => {
  const [mantissa, exponent] = String(value).split('e')
  const fraction = mantissa.split('.')[1]?.length ?? 0

  return Math.max(0, fraction - Number(exponent ?? 0))
}

export const lastStep = (min: number, max: number, step: number) => min + Math.floor((max - min) / step + 1e-9) * step

export const snap = (value: number, min: number, max: number, step: number) => {
  const finite = Number.isFinite(value) ? value : min
  const stepped = min + Math.round((finite - min) / step) * step
  const clamped = Math.min(Math.max(stepped, min), lastStep(min, max, step))

  return Number(clamped.toFixed(Math.max(decimalsOf(step), decimalsOf(min))))
}

export const percentOf = (value: number, min: number, max: number) => (max > min ? ((Math.min(Math.max(value, min), max) - min) / (max - min)) * 100 : 0)
