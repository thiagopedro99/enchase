import CopyButton from '../CopyButton/index.tsx'
import { highlight } from './highlight.ts'
import styles from './styles.module.css'

import type { CodeBlockProps } from './types.ts'

const CodeBlock = ({ code, label, language, copy = false }: CodeBlockProps) => (
  <figure className={styles.block}>
    <figcaption className={styles.caption}>
      <span className={styles.dots} aria-hidden="true" />
      <span className={styles.label}>{label}</span>
      <span className={styles.language}>{language}</span>
      {copy && <CopyButton text={code} label={`Copiar: ${label}`} done="Código copiado" />}
    </figcaption>
    <pre className={styles.pre} tabIndex={0} aria-label={label}>
      <code>
        {highlight(code, language).map(({ text, kind }, index) =>
          kind ? (
            <span key={index} data-token={kind}>
              {text}
            </span>
          ) : (
            text
          )
        )}
      </code>
    </pre>
  </figure>
)

export default CodeBlock
