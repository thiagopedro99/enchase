import { Container, VisuallyHidden } from 'enchase'

import { ThumbsUpIcon } from '../../../../components/icons.tsx'
import { steps } from '../../defaultData.ts'
import styles from './styles.module.css'

const HowItWorks = () => (
  <Container maxWidth="xl">
    <VisuallyHidden>
      <h2>Como funciona</h2>
    </VisuallyHidden>
    <ol className={styles.steps}>
      {steps.map(({ title, text, thumb }, index) => (
        <li key={title} className={styles.step}>
          <span className={styles.number} aria-hidden="true">
            {index + 1}
          </span>
          <span>
            <span className={styles.title}>
              {title}
              {thumb && (
                <>
                  <ThumbsUpIcon size={16} className={styles.icon} />
                  <VisuallyHidden>um joinha</VisuallyHidden>
                </>
              )}
            </span>
            <span className={styles.text}>{text}</span>
          </span>
        </li>
      ))}
    </ol>
  </Container>
)

export default HowItWorks
