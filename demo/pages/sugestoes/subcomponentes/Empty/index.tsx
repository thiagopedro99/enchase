import { Button, ButtonLink } from 'enchase'

import { suggestUrl } from '../../../../defaultData.ts'
import { statuses } from '../../defaultData.ts'
import StatusDot from '../StatusDot/index.tsx'
import styles from './styles.module.css'

const Empty = ({ onSuggest }: { onSuggest?: (() => void) | undefined }) => (
  <div className={styles.empty}>
    <div className={styles.message}>
      <h3 className={styles.title}>Ainda não há sugestões</h3>
      <p className={styles.text}>Seja a primeira pessoa a sugerir um componente ou uma melhoria. O card aparece aqui assim que a issue for aberta.</p>
      {onSuggest ? (
        <Button onClick={onSuggest}>Fazer a primeira sugestão</Button>
      ) : (
        <ButtonLink href={suggestUrl} target="_blank">
          Fazer a primeira sugestão
        </ButtonLink>
      )}
    </div>

    <ul className={styles.statuses} aria-label="Por onde cada sugestão passa">
      {statuses.map(({ value, label, text }) => (
        <li key={value} className={styles.status}>
          <span className={styles.label}>
            <StatusDot status={value} />
            {label}
          </span>
          <span className={styles.statusText}>{text}</span>
        </li>
      ))}
    </ul>
  </div>
)

export default Empty
