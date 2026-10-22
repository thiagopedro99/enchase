const letterSpacing = /^(?:0|(-?(?:\d+(?:\.\d+)?|\.\d+))(em|rem|px))$/

const maxLetterSpacing = { em: 2, rem: 2, px: 32 }

export const isValidLineHeight = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 1 && value <= 4

export const isValidLetterSpacing = (value: unknown): value is string => {
  if (typeof value !== 'string') return false

  const match = letterSpacing.exec(value)

  if (!match) return false

  return match[1] === undefined || Math.abs(Number(match[1])) <= maxLetterSpacing[match[2] as keyof typeof maxLetterSpacing]
}

export const assertValidLineHeight = (name: string, value: unknown): number => {
  if (!isValidLineHeight(value)) throw new Error(`Invalid line height for "${name}": ${JSON.stringify(value)}`)

  return value
}

export const assertValidLetterSpacing = (name: string, value: unknown): string => {
  if (!isValidLetterSpacing(value)) throw new Error(`Invalid letter spacing for "${name}": ${JSON.stringify(value)}`)

  return value
}
