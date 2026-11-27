import { useState } from 'react'
import { Button, UIProvider } from 'enchase'
import { en } from 'enchase/locales'
import { Board } from 'enchase/experimental/board'
import { applyMove, defaultCards, defaultColumns, defaultReadOnly, defaultSortable, manyCards } from './defaultData.ts'

import type { BoardCard } from './defaultData.ts'
import type { BoardColumn } from 'enchase/experimental/board'
import type { Meta, StoryObj } from '@storybook/react-vite'

const BoardDemo = ({ columns = defaultColumns, initialItems, sortable, readOnly }: { columns?: BoardColumn[]; initialItems: BoardCard[]; sortable?: boolean; readOnly?: boolean }) => {
  const [items, setItems] = useState(initialItems)

  return (
    <Board<BoardCard>
      columns={columns}
      items={items}
      sortable={sortable}
      readOnly={readOnly}
      onMove={(move) => setItems((current) => applyMove(current, move))}
      getItemLabel={(card) => card.title}
      renderCard={(card) => <p style={{ margin: 0 }}>{card.title}</p>}
    />
  )
}

const meta = {
  title: 'Components/Board',
  component: Board<BoardCard>,
  args: {
    columns: defaultColumns,
    items: defaultCards,
    onMove: () => undefined,
    renderCard: (card) => <p style={{ margin: 0 }}>{card.title}</p>,
    getItemLabel: (card) => card.title,
    sortable: defaultSortable,
    readOnly: defaultReadOnly
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          "A Kanban board, controlled: it never reorders `items` on its own, and calls `onMove` exactly once per move, when a card is dropped in its new position, never while it is only being dragged over one. Treat that call as the moment to persist the move and update `items` to match; if `items` doesn't change, the card goes back to where it was. Each card's handle picks it up with Space or Enter, the arrow keys move it, Home and End jump to the ends of the column, Space or Enter drops it and Esc cancels. A per-card menu, 'Move {card} to', does the same with no dragging at all, the WCAG 2.2 2.5.7 alternative every drag-and-drop interface needs. It is experimental: `enchase/experimental/board`, outside the stable API."
      }
    }
  },
  argTypes: {
    columns: {
      control: false,
      description:
        'Columns of the board, in the order they appear: { id, title, label?, description? }. The description is drawn under the title and describes the column to assistive technology. The move-to menu and the announcements name a column by its label, or by its title when the title is text: give a label to a column whose title is not plain text.'
    },
    items: { control: false, description: 'Cards, in a single flat list. The order of the cards of a column is the order they appear in this list.' },
    onMove: { control: false, description: "Called once per move, when the card is dropped (by pointer, keyboard or the move-to menu), and only when the final position differs from the initial one." },
    renderCard: { control: false, description: 'Content of a card.' },
    getItemLabel: { control: false, description: 'Human-readable label of a card, used in the handle, the move-to menu and the announcements.' },
    renderEmpty: { control: false, description: 'Content of a column with no cards, in place of the default text. It receives the column.' },
    sortable: {
      control: 'boolean',
      description: 'Allows reordering inside a column. Without it, a move only swaps columns, the card always lands at the end of the target one, and the move-to menu leaves out the column the card is in.',
      table: { defaultValue: { summary: String(defaultSortable) } }
    },
    readOnly: {
      control: 'boolean',
      description: 'Turns off the handle, the dragging and the move-to menu, and leaves the board a plain, readable list.',
      table: { defaultValue: { summary: String(defaultReadOnly) } }
    }
  }
} satisfies Meta<typeof Board<BoardCard>>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => <BoardDemo initialItems={defaultCards} sortable={args.sortable} readOnly={args.readOnly} />
}

export const ColumnSwapOnly: Story = {
  args: { sortable: false },
  parameters: { controls: { disable: true } },
  render: () => <BoardDemo initialItems={defaultCards} sortable={false} />
}

const descriptions = ['Not started yet', 'Someone is working on it', 'Waiting for a second pair of eyes', 'Shipped in a release']

const describedColumns: BoardColumn[] = defaultColumns.map((column, index) => ({ ...column, description: descriptions[index] }))

const EmptyDemo = () => {
  const [items, setItems] = useState(defaultCards.filter((card) => card.columnId === defaultColumns[0].id))

  return (
    <Board<BoardCard>
      columns={describedColumns}
      items={items}
      onMove={(move) => setItems((current) => applyMove(current, move))}
      getItemLabel={(card) => card.title}
      renderCard={(card) => <p style={{ margin: 0 }}>{card.title}</p>}
      renderEmpty={(column) => (
        <Button variant="ghost" size="sm">
          Add a card to {column.label ?? String(column.title)}
        </Button>
      )}
    />
  )
}

export const WithDescriptions: Story = {
  parameters: { controls: { disable: true }, docs: { description: { story: 'Each column has a description under its title. The move-to menu lists the columns by name, without the description.' } } },
  render: () => <BoardDemo columns={describedColumns} initialItems={defaultCards} />
}

export const CustomEmptyColumn: Story = {
  parameters: { controls: { disable: true }, docs: { description: { story: '`renderEmpty` draws the content of a column with no cards, here a button, in place of the default text.' } } },
  render: () => <EmptyDemo />
}

export const ReadOnly: Story = {
  args: { readOnly: true },
  parameters: { controls: { disable: true } },
  render: () => <BoardDemo initialItems={defaultCards} readOnly />
}

export const ManyCards: Story = {
  parameters: { controls: { disable: true } },
  render: () => <BoardDemo columns={[defaultColumns[0]]} initialItems={manyCards} />
}

export const RightToLeft: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div dir="rtl">
      <UIProvider locale={{ ...en, dir: 'rtl' }}>
        <BoardDemo initialItems={defaultCards} />
      </UIProvider>
    </div>
  )
}
