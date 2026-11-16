export const points = [
  'A sua classe vence o estilo de repouso, antes ou depois do CSS da biblioteca.',
  'Uma classe que nomeia o estado, como .save:hover, vence o hover da biblioteca.',
  'Um seletor só de elemento, como button, nunca desmonta um componente.'
]

export const styleCode = `.save {
  border-radius: var(--enchase-radius-sm);
  background: var(--enchase-color-inverse-surface);
  color: var(--enchase-color-inverse-on-surface);
}

.save:hover {
  background: var(--enchase-color-primary);
  color: var(--enchase-color-on-primary);
}`

export const usageCode = `import { Button } from 'enchase'
import styles from './styles.module.css'

<Button className={styles.save}>Salvar</Button>`
