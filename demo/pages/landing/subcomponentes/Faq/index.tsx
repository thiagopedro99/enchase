import { Accordion, Container } from 'enchase'

import SectionHeading from '../SectionHeading/index.tsx'
import { defaultOpen, questions } from './defaultData.tsx'
import styles from './styles.module.css'

const Faq = () => (
  <section id="faq" className={styles.section} aria-labelledby="faq-title">
    <Container maxWidth="md" className={styles.content}>
      <SectionHeading id="faq-title" eyebrow="Perguntas" title="Antes de instalar" />
      <Accordion items={questions} defaultValue={defaultOpen} className={styles.list} />
    </Container>
  </section>
)

export default Faq
