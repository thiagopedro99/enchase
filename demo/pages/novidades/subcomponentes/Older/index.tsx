import { ButtonLink, Card } from 'enchase'

import { changelogUrl } from '../../../../defaultData.ts'
import { oldestVersion } from '../../defaultData.ts'
import styles from './styles.module.css'

const Older = () => (
  <Card variant="outlined" className={styles.older}>
    <div>
      <h2 className={styles.title}>Versões anteriores à {oldestVersion}</h2>
      <p className={styles.text}>O histórico completo, da 0.1 em diante, está no changelog técnico.</p>
    </div>
    <ButtonLink href={changelogUrl} target="_blank" variant="outline">
      Abrir o changelog
    </ButtonLink>
  </Card>
)

export default Older
