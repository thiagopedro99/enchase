import { Alert, Button, ButtonLink } from 'enchase'

import { issuesUrl } from '../../../../defaultData.ts'
import styles from './styles.module.css'

import type { FailureProps } from './types.ts'

const Failure = ({ limited, onRetry }: FailureProps) => (
  <Alert variant="error" title="Não foi possível carregar as sugestões" className={styles.failure}>
    <p className={styles.text}>{limited ? 'O GitHub limitou as consultas vindas da sua rede por alguns minutos. As sugestões continuam lá.' : 'A consulta ao GitHub falhou. Confira a conexão e tente de novo.'}</p>
    <div className={styles.actions}>
      <Button variant="outline" size="sm" onClick={onRetry}>
        Tentar de novo
      </Button>
      <ButtonLink href={issuesUrl} target="_blank" variant="ghost" size="sm">
        Ver as issues no GitHub
      </ButtonLink>
    </div>
  </Alert>
)

export default Failure
