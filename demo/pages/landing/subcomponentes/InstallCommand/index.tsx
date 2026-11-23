import CopyButton from '../../../../components/CopyButton/index.tsx'
import { installCommand } from '../../defaultData.ts'
import styles from './styles.module.css'

const InstallCommand = () => (
  <div className={styles.command}>
    <span className={styles.prompt} aria-hidden="true">
      $
    </span>
    <code className={styles.text}>{installCommand}</code>
    <CopyButton text={installCommand} label="Copiar comando" done="Comando copiado" />
  </div>
)

export default InstallCommand
