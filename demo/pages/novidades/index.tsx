import { Badge, ButtonLink, Container, useScrollSpy } from 'enchase'
import { useMemo, useState } from 'react'

import { anchorOf, currentVersion, releases } from './defaultData.ts'
import VersionIndex from './subcomponentes/VersionIndex/index.tsx'
import { changelogUrl, packageUrl } from '../../defaultData.ts'
import PageHeader from '../../components/PageHeader/index.tsx'
import SitePage from '../../components/SitePage/index.tsx'
import Release from './subcomponentes/Release/index.tsx'
import Older from './subcomponentes/Older/index.tsx'
import styles from './styles.module.css'

const Novidades = () => {
  const [onlyBehavior, setOnlyBehavior] = useState(false)
  const shown = useMemo(() => releases.filter(({ behavior }) => !onlyBehavior || behavior), [onlyBehavior])
  const ids = useMemo(() => shown.map(({ version }) => anchorOf(version)), [shown])
  const activeId = useScrollSpy(ids) ?? ids[0]

  return (
    <SitePage title="Novidades">
      <section aria-labelledby="novidades-title">
        <PageHeader id="novidades-title" eyebrow="Novidades" title="O que mudou em cada versão" lead="Um resumo de cada versão para quem usa a biblioteca: o que há de novo, o que muda de comportamento e como migrar. O registro técnico, commit a commit, continua no GitHub.">
          <span className={styles.current}>
            Versão atual
            <Badge variant="primary">{currentVersion}</Badge>
          </span>
          <ButtonLink href={changelogUrl} target="_blank" variant="outline">
            Changelog técnico
          </ButtonLink>
          <ButtonLink href={packageUrl} target="_blank" variant="ghost">
            npm
          </ButtonLink>
        </PageHeader>

        <Container maxWidth="xl" className={styles.grid}>
          <VersionIndex releases={shown} activeId={activeId} onlyBehavior={onlyBehavior} onOnlyBehaviorChange={setOnlyBehavior} />

          <div className={styles.releases}>
            {shown.map((release) => (
              <Release key={release.version} release={release} />
            ))}
            <Older />
          </div>
        </Container>
      </section>
    </SitePage>
  )
}

export default Novidades
