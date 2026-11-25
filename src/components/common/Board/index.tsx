import { mergeProps, slot } from '@utils/mergeProps.ts'
import { VisuallyHidden } from '../VisuallyHidden/index.tsx'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import { Column } from './subcomponentes/Column/index.tsx'
import { useBoard } from './useBoard.ts'
import styles from './styles.module.css'

import type { BoardItem, BoardProps } from './types.ts'

export const Board = <Item extends BoardItem>({ columns, items, onMove, renderCard, getItemLabel, ariaLabel, ariaLabelledBy, sortable, readOnly, className, style, ref }: BoardProps<Item>) => {
  const { labels } = useUIConfig()
  const board = useBoard({ columns, items, onMove, getItemLabel, sortable, readOnly })

  const root = mergeProps(
    {
      ...slot('board'),
      className: styles.board,
      role: 'group',
      'aria-label': ariaLabelledBy ? undefined : ariaLabel ?? labels.board,
      'aria-labelledby': ariaLabelledBy,
      'data-dragging': board.dragging ? '' : undefined
    },
    { className, style }
  )

  return (
    <div {...root} ref={ref}>
      <VisuallyHidden id={board.instructionsId}>{board.instructionsText}</VisuallyHidden>
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
          {renderCard(board.draggingItem)}
        </div>
      )}
    </div>
  )
}

export default Board
