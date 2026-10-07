const maxColorLength = 100

const hexColor = /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/

const colorFunction = /^(rgb|rgba|hsl|hsla|oklch|oklab)\(([^()]*)\)$/i

const numericToken = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?(?:%|deg|rad|grad|turn)?$/i

const isColorArgument = (token: string) => token.toLowerCase() === 'none' || numericToken.test(token)

export const isValidColor = (value: unknown): value is string => {
  if (typeof value !== 'string' || value.length === 0 || value.length > maxColorLength) return false
  if (value === 'transparent') return true
  if (hexColor.test(value)) return true

  const match = colorFunction.exec(value)

  if (!match) return false

  const tokens = match[2].trim().split(/[\s,/]+/)

  return (tokens.length === 3 || tokens.length === 4) && tokens.every(isColorArgument)
}

export const assertValidColor = (name: string, value: unknown): string => {
  if (!isValidColor(value)) throw new Error(`Invalid color for "${name}": ${JSON.stringify(value)}`)

  return value
}
