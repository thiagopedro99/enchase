import { Button, Container, Link } from 'enchase'

import SectionHeading from '../SectionHeading/index.tsx'
import { stylingGuideUrl } from '../../defaultData.ts'
import CodeBlock from '../CodeBlock/index.tsx'
import Reveal from '../Reveal/index.tsx'
import { steps } from './defaultData.ts'
import styles from './styles.module.css'

const Steps = () => (
  <section id="codigo" className={styles.section} aria-labelledby="codigo-title">
    <Container maxWidth="xl" className={styles.grid}>
      <div className={styles.aside}>
        <SectionHeading id="codigo-title" align="start" eyebrow="Código" title="Da instalação ao primeiro botão em três passos" lead="Sem gerador, sem configuração de build e sem plugin. É React, um arquivo de CSS e o seu tema." />
        <Link href={stylingGuideUrl} target="_blank">
          Ler o guia de estilização
        </Link>
      </div>

      <ol className={styles.steps}>
        {steps.map(({ id, title, text, blocks }, index) => (
          <li key={id} className={styles.step}>
            <Reveal className={styles.body}>
              <span className={styles.number} aria-hidden="true">
                {index + 1}
              </span>
              <h3 className={styles.title}>{title}</h3>
              <p className={styles.text}>{text}</p>
              {blocks.map(({ label, language, code }) => (
                <CodeBlock key={label} label={label} language={language} code={code} copy />
              ))}
              {id === 'use' && (
                <div className={styles.result}>
                  <span className={styles.resultLabel}>O resultado, nesta página</span>
                  <Button className={styles.salvar}>Salvar</Button>
                </div>
              )}
            </Reveal>
          </li>
        ))}
      </ol>
    </Container>
  </section>
)

export default Steps
