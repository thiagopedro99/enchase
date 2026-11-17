import { Button } from 'enchase'

import CodeBlock from '../../../CodeBlock/index.tsx'
import styles from './styles.module.css'
import { code } from './defaultData.ts'

const CascadeDemo = () => (
  <div className={styles.demo}>
    <CodeBlock label="A sua folha de estilo" language="css" code={code} />
    <div className={styles.buttons}>
      <Button>Padrão</Button>
      <span className={styles.arrow} aria-hidden="true">
        →
      </span>
      <Button className={styles.salvar}>Com a sua classe</Button>
    </div>
  </div>
)

export default CascadeDemo
