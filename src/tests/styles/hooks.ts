export type HookUse = { name: string; fallback: string }

export const hookUses = (css: string): HookUse[] =>
  [...css.matchAll(/var\((--enchase-[a-z0-9-]+),/g)].map((match) => {
    const start = (match.index ?? 0) + match[0].length
    let depth = 1
    let end = start

    while (end < css.length && depth > 0) {
      if (css[end] === '(') depth += 1
      if (css[end] === ')') depth -= 1
      end += 1
    }

    return { name: match[1], fallback: css.slice(start, end - 1).trim() }
  })

export const withoutVariables = (value: string): string => {
  let result = ''
  let index = 0

  while (index < value.length) {
    if (!value.startsWith('var(', index)) {
      result += value[index]
      index += 1
      continue
    }

    let depth = 0

    index += 'var'.length

    do {
      if (value[index] === '(') depth += 1
      if (value[index] === ')') depth -= 1
      index += 1
    } while (index < value.length && depth > 0)
  }

  return result
}
