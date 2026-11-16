import { Card, Container, Grid } from 'enchase'

import SectionHeading from '../SectionHeading/index.tsx'
import { features } from './defaultData.tsx'
import styles from './styles.module.css'

const Features = () => (
  <section id="recursos" className={styles.section} aria-labelledby="recursos-title">
    <Container maxWidth="xl" className={styles.content}>
      <SectionHeading
        id="recursos-title"
        eyebrow="Recursos"
        title="O trabalho chato já vem feito"
        lead="Foco, teclado, contraste, tema escuro e direção da escrita são da biblioteca. O que é do seu produto continua sendo seu."
      />

      <Grid as="ul" columns={{ xs: 1, md: 2, lg: 3 }} gap="var(--enchase-space-lg)">
        {features.map(({ id, icon, title, text }) => (
          <Card key={id} as="li" variant="outlined" className={styles.feature}>
            <span className={styles.icon}>{icon}</span>
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.text}>{text}</p>
          </Card>
        ))}
      </Grid>
    </Container>
  </section>
)

export default Features
