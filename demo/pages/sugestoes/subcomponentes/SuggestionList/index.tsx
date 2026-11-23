import SuggestionCard from '../SuggestionCard/index.tsx'
import styles from './styles.module.css'

import type { SuggestionListProps } from './types.ts'

const SuggestionList = ({ items }: SuggestionListProps) =>
  items.length === 0 ? (
    <p className={styles.empty}>Nenhuma sugestão aqui.</p>
  ) : (
    <ul className={styles.cards}>
      {items.map((item) => (
        <SuggestionCard key={item.id} suggestion={item} />
      ))}
    </ul>
  )

export default SuggestionList
