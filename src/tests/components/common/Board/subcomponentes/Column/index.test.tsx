import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Board } from '@components/common/Board/index.tsx'

import type { BoardColumn, BoardMove } from '@components/common/Board/types.ts'

type Item = { id: string; columnId: string; title: string }

const columns: BoardColumn[] = [
  { id: 'todo', title: 'A fazer' },
  { id: 'doing', title: 'Em andamento' }
]

const items: Item[] = [
  { id: '1', columnId: 'todo', title: 'Revisar PR' },
  { id: '2', columnId: 'todo', title: 'Escrever testes' }
]

const applyMove = (current: Item[], move: BoardMove<Item>): Item[] => {
  const grouped = new Map<string, Item[]>()
  for (const item of current.filter((candidate) => candidate.id !== move.item.id)) grouped.set(item.columnId, [...(grouped.get(item.columnId) ?? []), item])
  const target = grouped.get(move.to.columnId) ?? []
  target.splice(move.to.index, 0, { ...move.item, columnId: move.to.columnId })
  grouped.set(move.to.columnId, target)
  return [...grouped.values()].flat()
}

const TestBoard = () => {
  const [current, setCurrent] = useState(items)

  return <Board<Item> columns={columns} items={current} onMove={(move) => setCurrent((previous) => applyMove(previous, move))} renderCard={(item) => <p>{item.title}</p>} getItemLabel={(item) => item.title} />
}

describe('Board column', () => {
  it('names the column region from its title', () => {
    renderWithProviders(<TestBoard />)

    expect(screen.getByRole('region', { name: 'A fazer' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Em andamento' })).toBeInTheDocument()
  })

  it('shows the card count as a pill and as accessible text', () => {
    const { container } = renderWithProviders(<TestBoard />)
    const todo = container.querySelector('[data-slot="board-column"]') as HTMLElement

    expect(todo.querySelector('[data-slot="board-column-count"]')).toHaveTextContent('2')
    expect(todo.querySelector('[data-slot="board-column-count"]')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByText('2 cartões')).toBeInTheDocument()
  })

  it('marks the target column while a keyboard move is in progress', async () => {
    const user = userEvent.setup()
    renderWithProviders(<TestBoard />)

    const column = (name: string) => screen.getByRole('region', { name }).closest('[data-slot="board-column"]') as HTMLElement

    expect(column('Em andamento')).not.toHaveAttribute('data-target')

    screen.getByRole('button', { name: 'Mover Revisar PR' }).focus()
    await user.keyboard(' ')
    await user.keyboard('{ArrowRight}')

    expect(column('Em andamento')).toHaveAttribute('data-target')
  })
})
