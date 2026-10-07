import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

import { MultiCodeBlockWrapper, CodeSection, SectionHeader, SectionTitle, CopyButton, CodeContent, TokenSpan } from './styles.ts'
import { VisuallyHidden } from '../VisuallyHidden/index.tsx'
import { tokenize } from './highlighter.ts'

import type { MultiCodeBlockProps } from './types.ts'



export const MultiCodeBlock = ({ blocks, language = 'tsx' }: MultiCodeBlockProps) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleCopy = async (code: string, index: number) => {
    await navigator.clipboard.writeText(code)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <MultiCodeBlockWrapper>
      {blocks.map((block, index) => {
        const tokens = tokenize(block.code, language)
        const isCopied = copiedIndex === index

        return (
          <CodeSection key={index}>
            <SectionHeader>
              <SectionTitle>{block.title}</SectionTitle>
              <CopyButton
                type="button"
                onClick={() => handleCopy(block.code, index)}
                title={isCopied ? 'Copiado!' : 'Copiar código'}
              >
                {isCopied ? (
                  <>
                    <Check size={16} />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    <span>Copiar</span>
                  </>
                )}
              </CopyButton>
              <VisuallyHidden role="status">{isCopied ? 'Copiado!' : ''}</VisuallyHidden>
            </SectionHeader>
            
            <CodeContent tabIndex={0} role="region" aria-label={block.title}>
              <pre>
                <code>
                  {tokens.map((token, tokenIndex) => (
                    <TokenSpan key={tokenIndex} $type={token.type}>
                      {token.content}
                    </TokenSpan>
                  ))}
                </code>
              </pre>
            </CodeContent>
          </CodeSection>
        )
      })}
    </MultiCodeBlockWrapper>
  )
}

export default MultiCodeBlock