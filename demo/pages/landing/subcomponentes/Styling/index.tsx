import { Button, Container, Link } from 'enchase'
import { CheckIcon } from 'enchase/icons'

import { points, styleCode, usageCode } from './defaultData.ts'
import SectionHeading from '../SectionHeading/index.tsx'
import { stylingGuideUrl } from '../../defaultData.ts'
import CodeBlock from '../CodeBlock/index.tsx'
import styles from './styles.module.css'

const Styling = () => (
  <section id="estilizacao" className={styles.section} aria-labelledby="estilizacao-title">
    <Container maxWidth="xl" className={styles.grid}>
      <div className={styles.copy}>
        <SectionHeading
          id="estilizacao-title"
          align="start"
          eyebrow="Estilização"
          title="Escreva CSS normal. Ele vence."
          lead="Sem !important e sem decorar a ordem dos imports. Cada regra da biblioteca pesa mais que um nome de elemento e menos que uma classe sua."
        />

        <ul className={styles.points}>
          {points.map((point) => (
            <li key={point} className={styles.point}>
              <CheckIcon size={20} className={styles.check} />
              <span>{point}</span>
            </li>
          ))}
        </ul>

        <Link href={stylingGuideUrl} target="_blank">
          Ler o guia de estilização
        </Link>
      </div>

      <div className={styles.example}>
        <CodeBlock label="A sua folha de estilo" language="css" code={styleCode} />
        <CodeBlock label="O seu componente" language="tsx" code={usageCode} />

        <div className={styles.result}>
          <p className={styles.resultLabel}>O resultado, nesta página</p>
          <div className={styles.buttons}>
            <Button>Padrão</Button>
            <Button className={styles.save}>Com a sua classe</Button>
          </div>
        </div>
      </div>
    </Container>
  </section>
)

export default Styling
