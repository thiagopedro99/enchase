import { Fragment, useId } from 'react'

import { CheckIcon } from '../../../Icon/icons/CheckIcon.tsx'
import { BoardHandleIcon, BoardMenuIcon } from '../../icons.tsx'
import { VisuallyHidden } from '../../../VisuallyHidden/index.tsx'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import { Button } from '../../../Button/index.tsx'
import { Menu } from '../../../Menu/index.tsx'
import { slot } from '@utils/mergeProps.ts'
import styles from './styles.module.css'

import type { MenuEntry } from '../../../Menu/types.ts'
import type { BoardItem } from '../../types.ts'
import type { BoardCardProps, ColumnProps } from './types.ts'

const BoardCard = <Item extends BoardItem>({ item, dimmed, picked, renderCard, getItemLabel, board }: BoardCardProps<Item>) => {
  const { labels } = useUIConfig()
  const label = getItemLabel(item)
  const readOnly = board.readOnly

  const menuEntries: MenuEntry[] = readOnly
    ? []
    : board.getMenuItems(item.id).map((entry) => {
        if (entry.kind === 'separator') return { id: entry.id, separator: true }
        if (entry.kind === 'move') return { id: entry.id, label: entry.label, disabled: entry.disabled, onSelect: entry.onSelect }
        return { id: entry.id, label: entry.title, disabled: entry.current, icon: entry.current ? <CheckIcon size={16} /> : undefined, onSelect: entry.onSelect }
      })

  return (
    <li {...slot('board', 'card')} className={styles.card} data-dimmed={dimmed ? '' : undefined} data-picked={picked ? '' : undefined} data-read-only={readOnly ? '' : undefined} {...board.getCardProps(item.id)}>
      {!readOnly && (
        <button {...slot('board', 'handle')} className={styles.handle} aria-label={labels.boardMoveCard?.(label) ?? ''} {...board.getHandleProps(item.id)}>
          <BoardHandleIcon size={16} />
        </button>
      )}

      <div {...slot('board', 'card-content')} className={styles.content}>
        {renderCard(item)}
      </div>

      {!readOnly && (
        <span {...slot('board', 'menu-button')} className={styles.menuButton}>
          <Menu items={menuEntries} label={labels.boardMoveCardTo?.(label) ?? ''}>
            <Button variant="ghost" size="sm" iconOnly aria-label={labels.boardMoveCardTo?.(label) ?? ''} {...board.getMenuButtonProps(item.id)}>
              <BoardMenuIcon size={16} />
            </Button>
          </Menu>
        </span>
      )}
    </li>
  )
}

export const Column = <Item extends BoardItem>({ view, renderCard, getItemLabel, board }: ColumnProps<Item>) => {
  const { labels } = useUIConfig()
  const titleId = useId()
  const empty = view.cards.length === 0
  const readOnly = board.readOnly

  return (
    <div {...slot('board', 'column')} className={styles.column} role="region" aria-labelledby={titleId} data-target={view.isDropTarget ? '' : undefined}>
      <div {...slot('board', 'column-header')} className={styles.header}>
        <h3 id={titleId} {...slot('board', 'column-title')} className={styles.title}>
          {view.column.title}
        </h3>
        <span {...slot('board', 'column-count')} className={styles.count} aria-hidden="true">
          {view.cards.length}
        </span>
        <VisuallyHidden>{labels.boardCardCount?.(view.cards.length) ?? ''}</VisuallyHidden>
      </div>

      <ul ref={board.getColumnListRef(view.column.id)} {...slot('board', 'column-list')} className={styles.list}>
        {view.cards.map((card, index) => (
          <Fragment key={card.item.id}>
            {view.linePosition === index && <li aria-hidden="true" {...slot('board', 'line')} className={styles.line} />}
            <BoardCard item={card.item} dimmed={card.dimmed} picked={card.picked} renderCard={renderCard} getItemLabel={getItemLabel} board={board} />
          </Fragment>
        ))}
        {view.linePosition === view.cards.length && <li aria-hidden="true" {...slot('board', 'line')} className={styles.line} />}
      </ul>

      {empty && (
        <p {...slot('board', 'empty')} className={styles.empty}>
          {readOnly ? labels.boardEmptyColumnReadOnly : labels.boardEmptyColumn}
        </p>
      )}
    </div>
  )
}

export default Column
