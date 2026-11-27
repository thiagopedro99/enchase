import type { ReactNode } from 'react'
import type { BoardColumnView, UseBoardResult } from '../../useBoard.ts'
import type { BoardColumn, BoardItem } from '../../types.ts'

export type ColumnProps<Item extends BoardItem> = {
  view: BoardColumnView<Item>
  renderCard: (item: Item) => ReactNode
  getItemLabel: (item: Item) => string
  renderEmpty?: ((column: BoardColumn) => ReactNode) | undefined
  board: UseBoardResult<Item>
}

export type BoardCardProps<Item extends BoardItem> = {
  item: Item
  dimmed: boolean
  picked: boolean
  renderCard: (item: Item) => ReactNode
  getItemLabel: (item: Item) => string
  board: UseBoardResult<Item>
}
