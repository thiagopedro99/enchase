import { ButtonLink, Container } from 'enchase'

import { docsUrl, repositoryUrl } from '../../defaultData.ts'
import InstallCommand from '../InstallCommand/index.tsx'
import Reveal from '../Reveal/index.tsx'
import styles from './styles.module.css'

const Cta = () => (
  <section className={styles.section} aria-labelledby="cta-title">
    <Container maxWidth="xl">
      <Reveal>
        <div className={styles.panel}>
          <span className={styles.backdrop} aria-hidden="true" />
          <h2 id="cta-title" className={styles.title}>
            Instale e monte a primeira tela hoje
          </h2>
          <p className={styles.lead}>Um comando, dois imports e os componentes já respondem ao seu tema.</p>
          <InstallCommand />
          <div className={styles.actions}>
            <ButtonLink href={docsUrl} size="lg" native>
              Abrir a documentação
            </ButtonLink>
            <ButtonLink href={repositoryUrl} target="_blank" variant="outline" size="lg">
              Código no GitHub
            </ButtonLink>
          </div>
        </div>
      </Reveal>
    </Container>
  </section>
)

export default Cta
