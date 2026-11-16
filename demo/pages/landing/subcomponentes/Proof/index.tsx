import { Container } from 'enchase'

import { facts } from './defaultData.ts'
import styles from './styles.module.css'

const Proof = () => (
  <section className={styles.proof} aria-label="A biblioteca em números">
    <Container maxWidth="xl">
      <dl className={styles.list}>
        {facts.map(({ value, label }) => (
          <div key={label} className={styles.fact}>
            <dt className={styles.label}>{label}</dt>
            <dd className={styles.value}>{value}</dd>
          </div>
        ))}
      </dl>
    </Container>
  </section>
)

export default Proof
