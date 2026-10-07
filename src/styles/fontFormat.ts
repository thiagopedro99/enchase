const maxFontFamilyLength = 200

const maxFontFamilyItems = 8

const nameCharacters = '[\\p{L}\\p{N} _.-]+'

const quotedName = new RegExp(`^(?:'${nameCharacters}'|"${nameCharacters}")$`, 'u')

const unquotedName = /^-?[A-Za-z][A-Za-z0-9_-]*(?: [A-Za-z0-9_-]+)*$/

const fontSize = /^(\d+(?:\.\d+)?|\.\d+)(rem|em|px)$/

const maxFontSize = { rem: 100, em: 100, px: 1600 }

const isFontFamilyItem = (item: string) => quotedName.test(item) || unquotedName.test(item)

export const isValidFontFamily = (value: unknown): value is string => {
  if (typeof value !== 'string' || value.length === 0 || value.length > maxFontFamilyLength) return false

  const items = value.split(',').map((item) => item.trim())

  return items.length <= maxFontFamilyItems && items.every(isFontFamilyItem)
}

export const isValidFontSize = (value: unknown): value is string => {
  if (typeof value !== 'string') return false

  const match = fontSize.exec(value)

  if (!match) return false

  const amount = Number(match[1])

  return amount > 0 && amount <= maxFontSize[match[2] as keyof typeof maxFontSize]
}

export const isValidFontWeight = (value: unknown): value is number => typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 1000

export const assertValidFontFamily = (name: string, value: unknown): string => {
  if (!isValidFontFamily(value)) throw new Error(`Invalid font family for "${name}": ${JSON.stringify(value)}`)

  return value
}

export const assertValidFontSize = (name: string, value: unknown): string => {
  if (!isValidFontSize(value)) throw new Error(`Invalid font size for "${name}": ${JSON.stringify(value)}`)

  return value
}

export const assertValidFontWeight = (name: string, value: unknown): number => {
  if (!isValidFontWeight(value)) throw new Error(`Invalid font weight for "${name}": ${JSON.stringify(value)}`)

  return value
}
