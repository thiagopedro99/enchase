import { defaultAlign } from './defaultData.ts'
import styles from './styles.module.css'

import type { SectionHeadingProps } from './types.ts'

const SectionHeading = ({ id, eyebrow, title, lead, align = defaultAlign }: SectionHeadingProps) => (
  <div className={styles.heading} data-align={align}>
    <p className={styles.eyebrow}>{eyebrow}</p>
    <h2 id={id} className={styles.title}>
      {title}
    </h2>
    {lead && <p className={styles.lead}>{lead}</p>}
  </div>
)

export default SectionHeading
