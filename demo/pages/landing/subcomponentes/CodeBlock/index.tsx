import styles from './styles.module.css'

import type { CodeBlockProps } from './types.ts'

const CodeBlock = ({ code, label, language }: CodeBlockProps) => (
  <figure className={styles.block}>
    <figcaption className={styles.caption}>
      <span>{label}</span>
      {language && <span className={styles.language}>{language}</span>}
    </figcaption>
    <pre className={styles.pre} tabIndex={0} aria-label={label}>
      <code>{code}</code>
    </pre>
  </figure>
)

export default CodeBlock
