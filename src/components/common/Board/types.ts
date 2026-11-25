import type { CSSProperties, ReactNode, Ref } from 'react'

export type BoardColumn = {
  id: string
  title: ReactNode
  label?: string | undefined
}

export type BoardPosition = {
  columnId: string
  index: number
}

export type BoardMove<Item> = {
  item: Item
  from: BoardPosition
  to: BoardPosition
}

export type BoardItem = { id: string; columnId: string }

export interface BoardProps<Item extends BoardItem> {
  columns: BoardColumn[]
  items: Item[]
  onMove: (move: BoardMove<Item>) => void
  renderCard: (item: Item) => ReactNode
  getItemLabel: (item: Item) => string
  ariaLabel?: string | undefined
  ariaLabelledBy?: string | undefined
  sortable?: boolean | undefined
  readOnly?: boolean | undefined
  className?: string | undefined
  style?: CSSProperties | undefined
  ref?: Ref<HTMLDivElement> | undefined
}

export type BoardMoveSource = 'pointer' | 'keyboard'

export type BoardMoveState = {
  itemId: string
  from: BoardPosition
  to: BoardPosition
  via: BoardMoveSource
}
