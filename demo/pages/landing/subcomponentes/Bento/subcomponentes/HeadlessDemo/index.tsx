import CodeBlock from '../../../../../../components/CodeBlock/index.tsx'
import { ejectCode, hookCode } from './defaultData.ts'
import styles from './styles.module.css'

const HeadlessDemo = () => (
  <div className={styles.demo}>
    <CodeBlock label="O seu markup, o nosso comportamento" language="tsx" code={hookCode} />
    <CodeBlock label="Ou leve o código" language="bash" code={ejectCode} />
  </div>
)

export default HeadlessDemo
