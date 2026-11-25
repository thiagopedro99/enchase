import { Badge, ButtonLink, Container, Link } from 'enchase'
import { ChevronRightIcon } from 'enchase/icons'
import { useRef } from 'react'

import { docsUrl, repositoryUrl, routes } from '../../../../defaultData.ts'
import InstallCommand from '../InstallCommand/index.tsx'
import { version } from '../../defaultData.ts'
import BrandDial from '../BrandDial/index.tsx'
import styles from './styles.module.css'
import Stage from '../Stage/index.tsx'

import type { HeroProps } from './types.ts'
import type { PointerEvent } from 'react'

const Hero = ({ look, onLookChange }: HeroProps) => {
  const glow = useRef<HTMLSpanElement>(null)

  const follow = ({ currentTarget, clientX, clientY, pointerType }: PointerEvent<HTMLElement>) => {
    if (pointerType !== 'mouse' || !glow.current) return

    const { left, top } = currentTarget.getBoundingClientRect()

    glow.current.style.setProperty('--landing-glow-x', `${clientX - left}px`)
    glow.current.style.setProperty('--landing-glow-y', `${clientY - top}px`)
    glow.current.dataset.active = ''
  }

  const rest = () => {
    if (glow.current) delete glow.current.dataset.active
  }

  return (
    <section className={styles.hero} aria-labelledby="hero-title" onPointerMove={follow} onPointerLeave={rest}>
      <div className={styles.backdrop} aria-hidden="true">
        <span className={styles.aurora} />
        <span className={styles.dots} />
        <span ref={glow} className={styles.glow} />
      </div>

      <Container maxWidth="xl" className={styles.content}>
        <div className={styles.copy}>
          <Link href={routes.news} className={styles.announcement}>
            <Badge variant="primary" size="sm">
              Novo na {version}
            </Badge>
            <span>Board, o quadro Kanban experimental</span>
            <ChevronRightIcon size={16} />
          </Link>

          <h1 id="hero-title" className={styles.title}>
            Componentes React <span className={styles.accent}>lapidados</span> para o seu produto
          </h1>

          <p className={styles.lead}>48 componentes acessíveis, cinco estilos visuais e um tema inteiro por tokens. Sem CSS-in-JS e sem brigar com a cascata.</p>

          <div className={styles.actions}>
            <ButtonLink href={docsUrl} size="lg" native>
              Começar agora
            </ButtonLink>
            <ButtonLink href={repositoryUrl} target="_blank" variant="outline" size="lg">
              Ver no GitHub
            </ButtonLink>
          </div>

          <InstallCommand />
        </div>

        <BrandDial look={look} onLookChange={onLookChange} />

        <Stage />
      </Container>
    </section>
  )
}

export default Hero
