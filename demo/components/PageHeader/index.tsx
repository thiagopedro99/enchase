import { Container } from 'enchase'

import styles from './styles.module.css'

import type { PageHeaderProps } from './types.ts'

const PageHeader = ({ id, eyebrow, title, lead, children }: PageHeaderProps) => (
  <header className={styles.header}>
    <span className={styles.dots} aria-hidden="true" />
    <Container maxWidth="xl" className={styles.content}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h1 id={id} className={styles.title}>
        {title}
      </h1>
      <p className={styles.lead}>{lead}</p>
      {children && <div className={styles.actions}>{children}</div>}
    </Container>
  </header>
)

export default PageHeader
