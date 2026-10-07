interface Token {
  type: string
  content: string
}

export const tokenize = (code: string, language: string): Token[] => {
  const tokens: Token[] = []
  
  if (language === 'tsx' || language === 'jsx' || language === 'typescript' || language === 'javascript') {
    const patterns = [
      { type: 'comment', regex: /\/\/.*$/gm },
      { type: 'comment', regex: /\/\*[\s\S]*?\*\//g },
      { type: 'string', regex: /"(?:[^"\\]|\\.)*"/g },
      { type: 'string', regex: /'(?:[^'\\]|\\.)*'/g },
      { type: 'string', regex: /`(?:[^`\\]|\\.)*`/g },
      { type: 'keyword', regex: /\b(import|export|from|default|as)\b/g },
      { type: 'keyword', regex: /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|try|catch|throw|new|typeof|instanceof|this|super|class|extends|interface|type|enum|async|await|void|null|undefined|true|false)\b/g },
      { type: 'react', regex: /\b(useState|useEffect|useCallback|useMemo|useRef|useContext|React|ReactNode|FC|Props)\b/g },
      { type: 'tag', regex: /<\/?[A-Z][a-zA-Z0-9]*\b/g },
      { type: 'tag', regex: /<\/?[a-z][a-zA-Z0-9-]*\b/g },
      { type: 'property', regex: /\b[a-zA-Z_$][a-zA-Z0-9_$]*(?=\s*=)/g },
      { type: 'number', regex: /\b\d+\.?\d*\b/g },
      { type: 'function', regex: /\b[a-zA-Z_$][a-zA-Z0-9_$]*(?=\s*\()/g },
    ]

    const matches: Array<{ start: number; end: number; type: string; content: string }> = []

    patterns.forEach(pattern => {
      let match
      const regex = new RegExp(pattern.regex.source, pattern.regex.flags)
      
      while ((match = regex.exec(code)) !== null) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          type: pattern.type,
          content: match[0]
        })
      }
    })

    matches.sort((a, b) => a.start - b.start)

    const cleanMatches: typeof matches = []
    let lastEnd = 0
    
    matches.forEach(match => {
      if (match.start >= lastEnd) {
        cleanMatches.push(match)
        lastEnd = match.end
      }
    })

    let currentPos = 0
    cleanMatches.forEach(match => {
      if (match.start > currentPos) {
        tokens.push({
          type: 'text',
          content: code.slice(currentPos, match.start)
        })
      }
      
      tokens.push({
        type: match.type,
        content: match.content
      })
      
      currentPos = match.end
    })

    if (currentPos < code.length) {
      tokens.push({
        type: 'text',
        content: code.slice(currentPos)
      })
    }
  } else {
    tokens.push({ type: 'text', content: code })
  }

  return tokens
}
