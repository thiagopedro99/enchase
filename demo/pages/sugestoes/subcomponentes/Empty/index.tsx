import { Button, ButtonLink } from 'enchase'

import { suggestUrl } from '../../../../defaultData.ts'
import styles from './styles.module.css'

import type { EmptyProps } from './types.ts'

const Empty = ({ onSuggest }: EmptyProps) => (
  <div className={styles.empty}>
    <h3 className={styles.title}>Ainda não há sugestões</h3>
    <p className={styles.text}>Seja a primeira pessoa a sugerir. O card nasce aqui, em análise, e anda pelas colunas até ser lançado.</p>
    {onSuggest ? (
      <Button size="sm" onClick={onSuggest}>
        Fazer a primeira sugestão
      </Button>
    ) : (
      <ButtonLink href={suggestUrl} target="_blank" size="sm">
        Fazer a primeira sugestão
      </ButtonLink>
    )}
  </div>
)

export default Empty
