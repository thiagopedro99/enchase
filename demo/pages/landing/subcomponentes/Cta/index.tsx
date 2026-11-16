import { ButtonLink, Container } from 'enchase'

import { docsUrl, repositoryUrl } from '../../defaultData.ts'
import InstallCommand from '../InstallCommand/index.tsx'
import styles from './styles.module.css'

const Cta = () => (
  <section className={styles.section} aria-labelledby="cta-title">
    <Container maxWidth="xl">
      <div className={styles.panel}>
        <h2 id="cta-title" className={styles.title}>
          Instale e monte a primeira tela hoje
        </h2>
        <p className={styles.lead}>Um comando, dois imports e os componentes já respondem ao seu tema.</p>
        <InstallCommand />
        <div className={styles.actions}>
          <ButtonLink href={docsUrl} size="lg" native>
            Abrir a documentação
          </ButtonLink>
          <ButtonLink href={repositoryUrl} target="_blank" variant="ghost" size="lg">
            Código no GitHub
          </ButtonLink>
        </div>
      </div>
    </Container>
  </section>
)

export default Cta
