import { createRef, StrictMode, useState } from 'react'
import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import userEvent from '@testing-library/user-event'
import { screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from '@tests/axe.ts'

import { Board } from '@components/common/Board/index.tsx'
import { Modal } from '@components/common/Modal/index.tsx'

import type { BoardColumn, BoardMove } from '@components/common/Board/types.ts'

type Item = { id: string; columnId: string; title: string }

const columns: BoardColumn[] = [
  { id: 'todo', title: 'A fazer' },
  { id: 'doing', title: 'Em andamento' },
  { id: 'done', title: 'Concluído' }
]

const defaultItems: Item[] = [
  { id: '1', columnId: 'todo', title: 'Revisar PR' },
  { id: '2', columnId: 'todo', title: 'Escrever testes' },
  { id: '3', columnId: 'doing', title: 'Corrigir bug' }
]

const applyMove = (items: Item[], move: BoardMove<Item>): Item[] => {
  const grouped = new Map<string, Item[]>()
  for (const item of items.filter((candidate) => candidate.id !== move.item.id)) grouped.set(item.columnId, [...(grouped.get(item.columnId) ?? []), item])
  const target = grouped.get(move.to.columnId) ?? []
  target.splice(move.to.index, 0, { ...move.item, columnId: move.to.columnId })
  grouped.set(move.to.columnId, target)
  return [...grouped.values()].flat()
}

const TestBoard = ({
  onMove,
  sortable,
  readOnly,
  boardColumns = columns,
  items: initialItems = defaultItems
}: {
  onMove?: (move: BoardMove<Item>) => void
  sortable?: boolean
  readOnly?: boolean
  boardColumns?: BoardColumn[]
  items?: Item[]
}) => {
  const Controlled = () => {
    const [items, setItems] = useState(initialItems)

    return (
      <Board<Item>
        columns={boardColumns}
        items={items}
        sortable={sortable}
        readOnly={readOnly}
        onMove={(move) => {
          onMove?.(move)
          setItems((current: Item[]) => applyMove(current, move))
        }}
        renderCard={(item) => <p>{item.title}</p>}
        getItemLabel={(item) => item.title}
      />
    )
  }

  return <Controlled />
}

const handle = (title: string) => screen.getByRole('button', { name: `Mover ${title}` })

const menuButton = (title: string) => screen.getByRole('button', { name: `Mover ${title} para` })

describe('Board', () => {
  it('renders every column with its cards in items order', () => {
    renderWithProviders(<TestBoard />)

    expect(screen.getByRole('region', { name: 'A fazer' })).toBeInTheDocument()
    expect(screen.getByText('Revisar PR')).toBeInTheDocument()
    expect(screen.getByText('Escrever testes')).toBeInTheDocument()
    expect(screen.getByText('Corrigir bug')).toBeInTheDocument()
  })

  it('shows an empty-column placeholder, in a different text when read-only', () => {
    const { unmount } = renderWithProviders(<TestBoard boardColumns={columns} items={[]} />)

    expect(screen.getAllByText('Solte um cartão aqui')).toHaveLength(3)
    unmount()

    renderWithProviders(<TestBoard boardColumns={columns} items={[]} readOnly />)
    expect(screen.getAllByText('Nenhum cartão')).toHaveLength(3)
  })

  it('names the handle and the move-to menu button from the card label', () => {
    renderWithProviders(<TestBoard />)

    expect(handle('Revisar PR')).toBeInTheDocument()
    expect(menuButton('Revisar PR')).toBeInTheDocument()
  })

  it('moves a card within its column with the keyboard and announces each step', async () => {
    const user = userEvent.setup()
    const onMove = vi.fn()
    renderWithProviders(<TestBoard onMove={onMove} />)

    handle('Revisar PR').focus()
    await user.keyboard(' ')
    await user.keyboard('{ArrowDown}')
    await user.keyboard(' ')

    expect(onMove).toHaveBeenCalledTimes(1)
    expect(onMove.mock.calls[0][0]).toMatchObject({ from: { columnId: 'todo', index: 0 }, to: { columnId: 'todo', index: 1 } })
    expect(handle('Revisar PR')).toHaveFocus()
  })

  it('moves a card to another column with the keyboard, keeps focus on its handle, and calls onMove once', async () => {
    const user = userEvent.setup()
    const onMove = vi.fn()
    renderWithProviders(<TestBoard onMove={onMove} />)

    handle('Revisar PR').focus()
    await user.keyboard(' ')
    await user.keyboard('{ArrowRight}')
    await user.keyboard(' ')

    expect(onMove).toHaveBeenCalledTimes(1)
    expect(onMove.mock.calls[0][0]).toMatchObject({ from: { columnId: 'todo', index: 0 }, to: { columnId: 'doing', index: 0 } })
    expect(handle('Revisar PR')).toHaveFocus()
    expect(screen.getByRole('region', { name: 'Em andamento' })).toContainElement(screen.getByText('Revisar PR'))
  })

  it('calls onMove exactly once per drop, and not at all when the position does not change', async () => {
    const user = userEvent.setup()
    const onMove = vi.fn()
    renderWithProviders(<TestBoard onMove={onMove} />)

    handle('Revisar PR').focus()
    await user.keyboard(' ')
    await user.keyboard(' ')

    expect(onMove).not.toHaveBeenCalled()
  })

  it('discards the move on Escape without calling onMove', async () => {
    const user = userEvent.setup()
    const onMove = vi.fn()
    renderWithProviders(<TestBoard onMove={onMove} />)

    handle('Revisar PR').focus()
    await user.keyboard(' ')
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{Escape}')

    expect(onMove).not.toHaveBeenCalled()
    expect(handle('Revisar PR')).toHaveFocus()
    expect(screen.getByRole('region', { name: 'A fazer' })).toContainElement(screen.getByText('Revisar PR'))
  })

  it('discards the move when the handle loses focus while picked up', async () => {
    const user = userEvent.setup()
    const onMove = vi.fn()
    renderWithProviders(<TestBoard onMove={onMove} />)

    handle('Revisar PR').focus()
    await user.keyboard(' ')
    await user.keyboard('{ArrowDown}')
    handle('Revisar PR').blur()

    expect(onMove).not.toHaveBeenCalled()
  })

  it('moves a card to another column through the move-to menu, keeping focus on its menu button', async () => {
    const user = userEvent.setup()
    const onMove = vi.fn()
    renderWithProviders(<TestBoard onMove={onMove} />)

    await user.click(menuButton('Revisar PR'))
    await user.click(screen.getByRole('menuitem', { name: 'Concluído' }))

    expect(onMove).toHaveBeenCalledTimes(1)
    expect(onMove.mock.calls[0][0]).toMatchObject({ from: { columnId: 'todo', index: 0 }, to: { columnId: 'done', index: 0 } })
    expect(menuButton('Revisar PR')).toHaveFocus()
  })

  it('disables and check-marks the current column in the move-to menu', async () => {
    const user = userEvent.setup()
    renderWithProviders(<TestBoard />)

    await user.click(menuButton('Revisar PR'))

    expect(screen.getByRole('menuitem', { name: 'A fazer' })).toHaveAttribute('aria-disabled', 'true')
    expect(screen.getByRole('menuitem', { name: 'Em andamento' })).not.toHaveAttribute('aria-disabled')
  })

  it('moves a card up and down one position through the menu, disabled at the edges', async () => {
    const user = userEvent.setup()
    const onMove = vi.fn()
    renderWithProviders(<TestBoard onMove={onMove} />)

    await user.click(menuButton('Revisar PR'))
    expect(screen.getByRole('menuitem', { name: 'Subir uma posição' })).toHaveAttribute('aria-disabled', 'true')
    await user.click(screen.getByRole('menuitem', { name: 'Descer uma posição' }))

    expect(onMove.mock.calls[0][0]).toMatchObject({ from: { columnId: 'todo', index: 0 }, to: { columnId: 'todo', index: 1 } })
  })

  it('hides the move-up and move-down menu items when sortable is false', async () => {
    const user = userEvent.setup()
    renderWithProviders(<TestBoard sortable={false} />)

    await user.click(menuButton('Revisar PR'))

    expect(screen.queryByRole('menuitem', { name: 'Subir uma posição' })).not.toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: 'Descer uma posição' })).not.toBeInTheDocument()
  })

  it('only allows column swap when sortable is false, moving the card to the end of the target column', async () => {
    const user = userEvent.setup()
    const onMove = vi.fn()
    renderWithProviders(<TestBoard onMove={onMove} sortable={false} />)

    handle('Escrever testes').focus()
    await user.keyboard(' ')
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{Home}')
    await user.keyboard('{End}')
    await user.keyboard(' ')

    expect(onMove).not.toHaveBeenCalled()

    await user.keyboard(' ')
    await user.keyboard('{ArrowRight}')
    await user.keyboard(' ')

    expect(onMove).toHaveBeenCalledTimes(1)
    expect(onMove.mock.calls[0][0]).toMatchObject({ to: { columnId: 'doing', index: 1 } })
  })

  it('renders no handle or move-to menu, and announces nothing interactive, when read-only', () => {
    renderWithProviders(<TestBoard readOnly />)

    expect(screen.queryByRole('button', { name: /^Mover/ })).not.toBeInTheDocument()
    expect(screen.getByText('Revisar PR')).toBeInTheDocument()
  })

  it('uses the column label, not the title node, in announcements when the title is not plain text', async () => {
    const user = userEvent.setup()
    const onMove = vi.fn()
    const nodeColumns: BoardColumn[] = [
      { id: 'todo', title: <strong>A fazer</strong>, label: 'A fazer' },
      { id: 'doing', title: <strong>Em andamento</strong>, label: 'Em andamento' }
    ]
    renderWithProviders(<TestBoard boardColumns={nodeColumns} onMove={onMove} />)

    handle('Revisar PR').focus()
    await user.keyboard(' ')

    expect(screen.getByText(/pego, posição 1 de 2 em A fazer\./)).toBeInTheDocument()
  })

  it('names the board group from the labels by default', () => {
    const { container } = renderWithProviders(<TestBoard />)

    expect(container.querySelector('[data-slot="board"]')).toHaveAttribute('aria-label', 'Quadro')
  })

  it('marks the root and the main parts with a data-slot', () => {
    const { container } = renderWithProviders(<TestBoard />)

    for (const part of ['board', 'board-track', 'board-column', 'board-column-header', 'board-column-title', 'board-column-count', 'board-column-list', 'board-card', 'board-card-content', 'board-handle', 'board-menu-button']) {
      expect(container.querySelector(`[data-slot="${part}"]`), part).toBeInTheDocument()
    }
  })

  it('forwards the ref to the root', () => {
    const ref = createRef<HTMLDivElement>()
    const { container } = renderWithProviders(<Board columns={columns} items={defaultItems} onMove={() => undefined} renderCard={(item: Item) => <p>{item.title}</p>} getItemLabel={(item: Item) => item.title} ref={ref} />)

    expect(ref.current).toBe(container.querySelector('[data-slot="board"]'))
  })

  it('has no axe violations, default, read-only or without reordering', async () => {
    const { container, unmount } = renderWithProviders(<TestBoard />)
    expect(await axe(container)).toHaveNoViolations()
    unmount()

    const readOnlyRender = renderWithProviders(<TestBoard readOnly />)
    expect(await axe(readOnlyRender.container)).toHaveNoViolations()
    readOnlyRender.unmount()

    const fixedRender = renderWithProviders(<TestBoard sortable={false} />)
    expect(await axe(fixedRender.container)).toHaveNoViolations()
  })

  it('calls onMove exactly once under StrictMode, for a keyboard move and a menu move', async () => {
    const user = userEvent.setup()
    const onMove = vi.fn()
    renderWithProviders(
      <StrictMode>
        <TestBoard onMove={onMove} />
      </StrictMode>
    )

    handle('Revisar PR').focus()
    await user.keyboard(' ')
    await user.keyboard('{ArrowDown}')
    await user.keyboard(' ')
    expect(onMove).toHaveBeenCalledTimes(1)

    onMove.mockClear()
    await user.click(menuButton('Corrigir bug'))
    await user.click(screen.getByRole('menuitem', { name: 'Concluído' }))
    expect(onMove).toHaveBeenCalledTimes(1)
  })

  it('lets the keyboard reach the end of a column the card is not native to', async () => {
    const user = userEvent.setup()
    const customItems: Item[] = [
      { id: '1', columnId: 'todo', title: 'One' },
      { id: '2', columnId: 'doing', title: 'Two' },
      { id: '3', columnId: 'doing', title: 'Three' }
    ]
    renderWithProviders(<TestBoard items={customItems} />)

    handle('One').focus()
    await user.keyboard(' ')
    await user.keyboard('{ArrowRight}')
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{ArrowDown}')
    await user.keyboard(' ')

    const doing = screen.getByRole('region', { name: 'Em andamento' })
    const titles = within(doing).getAllByText(/^(One|Two|Three)$/).map((node) => node.textContent)
    expect(titles).toEqual(['Two', 'Three', 'One'])
  })

  it('puts the card at the end of the target column through the menu when sortable is false', async () => {
    const user = userEvent.setup()
    const onMove = vi.fn()
    renderWithProviders(<TestBoard onMove={onMove} sortable={false} />)

    await user.click(menuButton('Corrigir bug'))
    await user.click(screen.getByRole('menuitem', { name: 'A fazer' }))

    expect(onMove.mock.calls[0][0]).toMatchObject({ to: { columnId: 'todo', index: 2 } })
  })

  it('returns focus to the handle after Escape reverts a cross-column move', async () => {
    const user = userEvent.setup()
    const onMove = vi.fn()
    renderWithProviders(<TestBoard onMove={onMove} />)

    handle('Revisar PR').focus()
    await user.keyboard(' ')
    await user.keyboard('{ArrowRight}')
    await user.keyboard('{Escape}')

    expect(onMove).not.toHaveBeenCalled()
    expect(handle('Revisar PR')).toHaveFocus()
    expect(screen.getByRole('region', { name: 'A fazer' })).toContainElement(screen.getByText('Revisar PR'))
  })

  it('overrides individual board texts through the labels prop, keeping the rest from the locale', () => {
    renderWithProviders(
      <Board<Item>
        columns={columns}
        items={defaultItems}
        onMove={() => undefined}
        renderCard={(item) => <p>{item.title}</p>}
        getItemLabel={(item) => item.title}
        labels={{ board: 'Quadro de tarefas' }}
      />
    )

    expect(screen.getByRole('group', { name: 'Quadro de tarefas' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mover Revisar PR' })).toBeInTheDocument()
  })

  it('does not give the column title a heading role', () => {
    renderWithProviders(<TestBoard />)

    expect(screen.queryAllByRole('heading')).toHaveLength(0)
    expect(screen.getByRole('region', { name: 'A fazer' })).toBeInTheDocument()
  })

  it('describes the handle with instructions that mention how to pick up the card', () => {
    renderWithProviders(<TestBoard />)

    const described = handle('Revisar PR').getAttribute('aria-describedby')
    expect(document.getElementById(described as string)).toHaveTextContent('Espaço pega o cartão. Com ele pego, as setas movem, espaço solta e Esc cancela.')
  })

  it('does not close an ancestor Modal when Escape cancels a move', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onMove = vi.fn()
    renderWithProviders(
      <Modal isOpen onClose={onClose} title="Quadro">
        <TestBoard onMove={onMove} />
      </Modal>
    )

    handle('Revisar PR').focus()
    await user.keyboard(' ')
    await user.keyboard('{Escape}')

    expect(onMove).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })
})
