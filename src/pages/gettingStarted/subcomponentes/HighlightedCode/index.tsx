import { tokenize } from '@components/common/MultiCodeBlock/highlighter.ts'
import { CodeBlock, TokenSpan } from './styles.ts'

import type { HighlightedCodeProps } from './types.ts'

export const HighlightedCode = ({ code, language = 'tsx' }: HighlightedCodeProps) => {
  const tokens = tokenize(code, language)

  return (
    <CodeBlock tabIndex={0}>
      <code>
        {tokens.map((token, index) => (
          <TokenSpan key={index} $type={token.type}>
            {token.content}
          </TokenSpan>
        ))}
      </code>
    </CodeBlock>
  )
}

export default HighlightedCode
