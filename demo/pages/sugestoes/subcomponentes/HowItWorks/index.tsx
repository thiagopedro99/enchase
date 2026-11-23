import { Container, VisuallyHidden } from 'enchase'

import { steps } from '../../defaultData.ts'
import styles from './styles.module.css'

const HowItWorks = () => (
  <Container maxWidth="xl">
    <VisuallyHidden>
      <h2>Como funciona</h2>
    </VisuallyHidden>
    <ol className={styles.steps}>
      {steps.map(({ title, text }, index) => (
        <li key={title} className={styles.step}>
          <span className={styles.number} aria-hidden="true">
            {index + 1}
          </span>
          <span>
            <span className={styles.title}>{title}</span>
            <span className={styles.text}>{text}</span>
          </span>
        </li>
      ))}
    </ol>
  </Container>
)

export default HowItWorks
