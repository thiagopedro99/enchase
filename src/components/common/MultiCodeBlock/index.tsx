import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

import { VisuallyHidden } from '../VisuallyHidden/index.tsx'
import { tokenize } from './highlighter.ts'
import styles from './styles.module.css'

import type { MultiCodeBlockProps } from './types.ts'

export const MultiCodeBlock = ({ blocks, language = 'tsx' }: MultiCodeBlockProps) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleCopy = async (code: string, index: number) => {
    await navigator.clipboard.writeText(code)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className={styles.wrapper}>
      {blocks.map((block, index) => {
        const tokens = tokenize(block.code, language)
        const isCopied = copiedIndex === index

        return (
          <div key={index} className={styles.section}>
            <div className={styles.header}>
              <span className={styles.title}>{block.title}</span>
              <button type="button" className={styles.copyButton} onClick={() => handleCopy(block.code, index)} title={isCopied ? 'Copiado!' : 'Copiar código'}>
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
              </button>
              <VisuallyHidden role="status">{isCopied ? 'Copiado!' : ''}</VisuallyHidden>
            </div>

            <div className={styles.content} tabIndex={0} role="region" aria-label={block.title}>
              <pre>
                <code>
                  {tokens.map((token, tokenIndex) => (
                    <span key={tokenIndex} className={styles.token} data-type={token.type}>
                      {token.content}
                    </span>
                  ))}
                </code>
              </pre>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default MultiCodeBlock
