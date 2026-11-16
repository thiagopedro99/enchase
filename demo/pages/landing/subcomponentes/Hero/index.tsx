import { Badge, ButtonLink, Container, Link } from 'enchase'

import { docsUrl, repositoryUrl, version } from '../../defaultData.ts'
import InstallCommand from '../InstallCommand/index.tsx'
import HeroPreview from '../HeroPreview/index.tsx'
import { stack } from './defaultData.ts'
import styles from './styles.module.css'

const Hero = () => (
  <section className={styles.hero} aria-labelledby="hero-title">
    <Container maxWidth="xl" className={styles.grid}>
      <div className={styles.copy}>
        <Link href="#estilizacao" className={styles.announcement}>
          <Badge variant="primary" size="sm">
            Novo na {version}
          </Badge>
          <span>A sua classe vence o CSS da biblioteca</span>
        </Link>

        <h1 id="hero-title" className={styles.title}>
          Componentes React acessíveis, com <span className={styles.accent}>a cara do seu produto</span>
        </h1>

        <p className={styles.lead}>
          48 componentes testados em Chromium, Firefox e WebKit, três estilos visuais prontos e um tema inteiro por tokens. Sem CSS-in-JS e sem brigar com a cascata.
        </p>

        <div className={styles.actions}>
          <ButtonLink href={docsUrl} size="lg" native>
            Começar agora
          </ButtonLink>
          <ButtonLink href={repositoryUrl} target="_blank" variant="outline" size="lg">
            Ver no GitHub
          </ButtonLink>
        </div>

        <InstallCommand />

        <ul className={styles.stack}>
          {stack.map((item) => (
            <li key={item} className={styles.stackItem}>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <HeroPreview />
    </Container>
  </section>
)

export default Hero
