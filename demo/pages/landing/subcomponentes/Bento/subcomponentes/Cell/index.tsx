import { Card } from 'enchase'

import { defaultSpan } from './defaultData.ts'
import styles from './styles.module.css'

import type { CellProps } from './types.ts'

const Cell = ({ title, text, span = defaultSpan, children }: CellProps) => (
  <Card as="li" variant="outlined" padding="0" className={styles.cell} data-span={span}>
    <span className={styles.shine} data-shine="" aria-hidden="true" />
    <div className={styles.demo}>{children}</div>
    <div className={styles.copy}>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.text}>{text}</p>
    </div>
  </Card>
)

export default Cell
