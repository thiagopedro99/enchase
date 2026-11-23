import { Layout, useScrollSpy } from 'enchase'
import { useEffect } from 'react'

import { navigationSections, sectionIds } from './defaultData.ts'
import Playground from './subcomponentes/Playground/index.tsx'
import { brand, footerProps } from '../../defaultData.ts'
import Marquee from './subcomponentes/Marquee/index.tsx'
import Bento from './subcomponentes/Bento/index.tsx'
import Steps from './subcomponentes/Steps/index.tsx'
import Hero from './subcomponentes/Hero/index.tsx'
import Faq from './subcomponentes/Faq/index.tsx'
import Cta from './subcomponentes/Cta/index.tsx'
import { revealFrom } from './reveal.ts'
import styles from './styles.module.css'

import type { LandingProps, LookChange } from './types.ts'

const Landing = ({ look, onLookChange }: LandingProps) => {
  const activeSectionId = useScrollSpy(sectionIds)

  const paint: LookChange = (next, origin) => revealFrom(origin, () => onLookChange(next))

  useEffect(() => {
    document.title = 'Enchase · Componentes React acessíveis'
  }, [])

  useEffect(() => {
    if (!look.compact) return undefined

    document.documentElement.dataset.density = 'compact'

    return () => {
      delete document.documentElement.dataset.density
    }
  }, [look.compact])

  return (
    <Layout className={styles.landing} navigation="navbar" translucent maxWidth="full" padding={false} brand={brand} navigationSections={navigationSections} activePageSectionId={activeSectionId} footerProps={footerProps}>
      <Hero look={look} onLookChange={paint} />
      <Marquee />
      <Bento look={look} onLookChange={paint} />
      <Playground look={look} onLookChange={onLookChange} />
      <Steps />
      <Faq />
      <Cta />
    </Layout>
  )
}

export default Landing
