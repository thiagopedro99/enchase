import type { CodeLanguage, CodeToken } from './types.ts'

const patterns: Record<CodeLanguage, [RegExp, string[]]> = {
  tsx: [/('[^'\n]*'|"[^"\n]*")|\b(import|from|export|const|return|default)\b|(<\/?)([A-Za-z][\w.]*)|\b([a-zA-Z][\w-]*)(?==)|([{}()[\];,=>/]+)/g, ['string', 'keyword', 'punctuation', 'tag', 'attribute', 'punctuation']],
  css: [/(--[\w-]+)|^([.#]?[\w.:-]+)(?=\s*\{)|\b([a-z-]+)(?=\s*:)|([{}();:,]+)/gm, ['variable', 'tag', 'attribute', 'punctuation']],
  bash: [/^(\$)|(--[\w-]+)|\b(npm|npx)\b/gm, ['punctuation', 'attribute', 'keyword']]
}

export const highlight = (code: string, language: CodeLanguage): CodeToken[] => {
  const [pattern, kinds] = patterns[language]
  const tokens: CodeToken[] = []
  let cursor = 0

  for (const match of code.matchAll(pattern)) {
    const start = match.index
    let offset = start

    if (start > cursor) tokens.push({ text: code.slice(cursor, start) })

    match.slice(1).forEach((group, index) => {
      if (group === undefined) return

      tokens.push({ text: group, kind: kinds[index] })
      offset += group.length
    })

    cursor = offset
  }

  if (cursor < code.length) tokens.push({ text: code.slice(cursor) })

  return tokens
}
