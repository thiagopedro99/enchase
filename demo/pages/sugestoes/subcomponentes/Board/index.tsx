import { Board as Kanban } from 'enchase/experimental/board'
import { useMemo } from 'react'

import SuggestionCard from '../SuggestionCard/index.tsx'
import StatusDot from '../StatusDot/index.tsx'
import styles from './styles.module.css'

import type { BoardCard, BoardProps } from './types.ts'
import type { Status } from '../../types.ts'

const Board = ({ columns, canMove, onMove }: BoardProps) => {
  const lanes = useMemo(
    () =>
      columns.map(({ value, label, text }) => ({
        id: value,
        label,
        title: (
          <span className={styles.name}>
            <StatusDot status={value} />
            {label}
          </span>
        ),
        description: text
      })),
    [columns]
  )
  const cards = useMemo<BoardCard[]>(() => columns.flatMap(({ value, items }) => items.map((suggestion) => ({ id: String(suggestion.id), columnId: value, suggestion }))), [columns])

  return (
    <Kanban
      ariaLabel="Andamento das sugestões"
      className={styles.board}
      columns={lanes}
      items={cards}
      sortable={false}
      readOnly={!canMove}
      getItemLabel={({ suggestion }) => suggestion.title}
      renderCard={({ suggestion }) => <SuggestionCard suggestion={suggestion} />}
      onMove={({ item, to }) => onMove(item.suggestion, to.columnId as Status)}
    />
  )
}

export default Board
