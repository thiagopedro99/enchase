const maxLength = 400

const unsafeCharacters = /[;{}<>\\]/

const comment = /\/\*|\*\//

const quoted = /(["'])(?:(?!\1)[^\\])*\1/g

const forbiddenCalls = /\b(?:url|image|image-set|expression)\s*\(|@import|javascript:/i

const hasControlCharacter = (value: string) => {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index)

    if (code < 32 || code === 127) return true
  }

  return false
}

const balanced = (value: string) => {
  let depth = 0

  for (const character of value) {
    if (character === '(') depth += 1
    if (character === ')') depth -= 1
    if (depth < 0) return false
  }

  return depth === 0
}

export const isSafeCssValue = (value: unknown): value is string => {
  if (typeof value !== 'string' || value.trim() === '' || value.length > maxLength || hasControlCharacter(value)) return false

  const outsideQuotes = value.replace(quoted, '""')

  if (/["']/.test(outsideQuotes.replace(/""/g, ''))) return false

  return !unsafeCharacters.test(outsideQuotes) && !comment.test(outsideQuotes) && !forbiddenCalls.test(outsideQuotes) && balanced(outsideQuotes)
}

export const assertSafeCssValue = (name: string, value: unknown): string => {
  if (!isSafeCssValue(value)) throw new Error(`Invalid CSS value for "${name}": ${JSON.stringify(value)}`)

  return value
}
