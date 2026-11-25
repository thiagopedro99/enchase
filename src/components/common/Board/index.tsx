import { mergeProps, slot } from '@utils/mergeProps.ts'
import { VisuallyHidden } from '../VisuallyHidden/index.tsx'
import { BoardHandleIcon } from './icons.tsx'
import { Column } from './subcomponentes/Column/index.tsx'
import { useBoard } from './useBoard.ts'
import styles from './styles.module.css'

import type { BoardItem, BoardProps } from './types.ts'

export const Board = <Item extends BoardItem>({ columns, items, onMove, renderCard, getItemLabel, ariaLabel, ariaLabelledBy, sortable, readOnly, labels: labelOverrides, className, style, ref }: BoardProps<Item>) => {
  const board = useBoard({ columns, items, onMove, getItemLabel, sortable, readOnly, labels: labelOverrides })

  const root = mergeProps(
    {
      ...slot('board'),
      className: styles.board,
      role: 'group',
      'aria-label': ariaLabelledBy ? undefined : ariaLabel ?? board.labels.board,
      'aria-labelledby': ariaLabelledBy,
      'data-dragging': board.dragging ? '' : undefined
    },
    { className, style }
  )

  return (
    <div {...root} ref={ref}>
      <VisuallyHidden id={board.instructionsId}>{board.labels.boardInstructions}</VisuallyHidden>
      <VisuallyHidden aria-live="polite" aria-atomic="true">
        {board.liveRegionText}
      </VisuallyHidden>

      <div ref={board.trackRef} {...slot('board', 'track')} className={styles.track}>
        {board.columns.map((view) => (
          <Column key={view.column.id} view={view} renderCard={renderCard} getItemLabel={getItemLabel} board={board} />
        ))}
      </div>

      {board.draggingItem && (
        <div ref={board.copyRef} {...slot('board', 'drag-copy')} className={styles.copy} aria-hidden="true">
          <span className={styles.copyHandle}>
            <BoardHandleIcon size={16} />
          </span>
          <div {...slot('board', 'drag-copy-content')} className={styles.copyContent}>{renderCard(board.draggingItem)}</div>
          <span className={styles.copySpacer} />
        </div>
      )}
    </div>
  )
}

export default Board
