import { Tabs, useBreakpoint } from 'enchase'

import SuggestionList from '../SuggestionList/index.tsx'
import StatusDot from '../StatusDot/index.tsx'
import styles from './styles.module.css'

import type { BoardProps } from './types.ts'

const Board = ({ columns }: BoardProps) => {
  const { up } = useBreakpoint()

  if (up('xxl')) {
    return (
      <div className={styles.lanes}>
        {columns.map(({ value, label, text, items }) => (
          <section key={value} className={styles.lane} aria-labelledby={`lane-${value}`}>
            <header className={styles.header}>
              <h3 id={`lane-${value}`} className={styles.title}>
                <StatusDot status={value} />
                {label}
                <span className={styles.count}>{items.length}</span>
              </h3>
              <p className={styles.text}>{text}</p>
            </header>
            <SuggestionList items={items} />
          </section>
        ))}
      </div>
    )
  }

  return (
    <Tabs
      ariaLabel="Andamento das sugestões"
      items={columns.map(({ value, label, text, items }) => ({
        value,
        label: (
          <span className={styles.tab}>
            <StatusDot status={value} />
            {label}
            <span className={styles.count}>{items.length}</span>
          </span>
        ),
        content: (
          <div className={styles.panel}>
            <p className={styles.text}>{text}</p>
            <SuggestionList items={items} />
          </div>
        )
      }))}
    />
  )
}

export default Board
