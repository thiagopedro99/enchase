import { Skeleton, VisuallyHidden } from 'enchase'

import styles from './styles.module.css'

const placeholders = [0, 1, 2, 3]

const Loading = () => (
  <div className={styles.loading} role="status">
    <VisuallyHidden>Carregando as sugestões</VisuallyHidden>
    {placeholders.map((index) => (
      <Skeleton key={index} variant="rectangular" height="9.5rem" />
    ))}
  </div>
)

export default Loading
