import { useEffect } from 'react'
import { Layout, useScrollSpy } from 'enchase'

import { brand, footerProps, navigationSections, sectionIds } from './defaultData.ts'
import Playground from './subcomponentes/Playground/index.tsx'
import Features from './subcomponentes/Features/index.tsx'
import Styling from './subcomponentes/Styling/index.tsx'
import Proof from './subcomponentes/Proof/index.tsx'
import Hero from './subcomponentes/Hero/index.tsx'
import Faq from './subcomponentes/Faq/index.tsx'
import Cta from './subcomponentes/Cta/index.tsx'
import styles from './styles.module.css'

import type { LandingProps } from './types.ts'

const Landing = ({ look, onLookChange }: LandingProps) => {
  const activeSectionId = useScrollSpy(sectionIds)

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
      <Hero />
      <Proof />
      <Playground look={look} onLookChange={onLookChange} />
      <Features />
      <Styling />
      <Faq />
      <Cta />
    </Layout>
  )
}

export default Landing
