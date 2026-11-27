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
      <Modal open onClose={onClose} title="Quadro">
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

describe('Board column description and menu labels', () => {
  const described: BoardColumn[] = [
    { id: 'todo', title: 'A fazer', description: 'Ainda sem dono' },
    { id: 'doing', title: <strong>Em andamento</strong>, label: 'Em andamento', description: <em>Com alguém trabalhando</em> },
    { id: 'done', title: <span>Concluído</span> }
  ]

  it('draws the description under the title and describes the column with it', () => {
    renderWithProviders(<TestBoard boardColumns={described} />)
    const column = screen.getByRole('region', { name: 'Em andamento' })
    const description = column.querySelector('[data-slot="board-column-description"]') as HTMLElement

    expect(description).toHaveTextContent('Com alguém trabalhando')
    expect(column).toHaveAttribute('aria-describedby', description.id)
    expect(column.querySelector('[data-slot="board-column-header"]')?.nextElementSibling).toBe(description)
    expect(column.querySelector('[data-slot="board-column-title"]')).not.toHaveTextContent('Com alguém')
  })

  it('adds no description part and no aria-describedby to a column without one', () => {
    renderWithProviders(<TestBoard />)
    const column = screen.getByRole('region', { name: 'A fazer' })

    expect(column.querySelector('[data-slot="board-column-description"]')).toBeNull()
    expect(column).not.toHaveAttribute('aria-describedby')
  })

  it('names the columns of the menu by their label, or by a text title, and never by the description', async () => {
    const user = userEvent.setup()
    renderWithProviders(<TestBoard boardColumns={described} />)

    await user.click(menuButton('Revisar PR'))
    const items = screen.getAllByRole('menuitem').map((item) => item.textContent)

    expect(items.slice(0, 3)).toEqual(['A fazer', 'Em andamento', 'Concluído'])
    expect(screen.getByRole('menu')).not.toHaveTextContent('Ainda sem dono')
    expect(screen.getByRole('menu')).not.toHaveTextContent('Com alguém trabalhando')
    expect(screen.getByRole('menuitem', { name: 'Em andamento' }).querySelector('strong')).toBeNull()
  })
})

describe('Board menu without sorting', () => {
  it('does not list the column the card is in', async () => {
    const user = userEvent.setup()
    const onMove = vi.fn()
    renderWithProviders(<TestBoard sortable={false} onMove={onMove} />)

    await user.click(menuButton('Revisar PR'))

    expect(screen.getAllByRole('menuitem').map((item) => item.textContent)).toEqual(['Em andamento', 'Concluído'])

    await user.click(screen.getByRole('menuitem', { name: 'Concluído' }))

    expect(onMove).toHaveBeenCalledTimes(1)
    expect(onMove.mock.calls[0][0].to).toEqual({ columnId: 'done', index: 0 })
  })

  it('still lists the current column, checked and disabled, when the cards can be sorted', async () => {
    const user = userEvent.setup()
    renderWithProviders(<TestBoard />)

    await user.click(menuButton('Revisar PR'))

    expect(screen.getByRole('menuitem', { name: 'A fazer' })).toHaveAttribute('aria-disabled', 'true')
  })

  it('has no menu button when there is nowhere to move to', () => {
    renderWithProviders(<TestBoard sortable={false} boardColumns={[columns[0]]} items={[defaultItems[0]]} />)

    expect(screen.queryByRole('button', { name: 'Mover Revisar PR para' })).not.toBeInTheDocument()
    expect(document.querySelector('[data-slot="board-menu-button"]')).toBeNull()
  })
})

describe('Board native drag', () => {
  it('cancels the native drag of a link or an image inside a card, and leaves the click alone', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn((event: { preventDefault: () => void }) => event.preventDefault())
    renderWithProviders(
      <Board<Item>
        columns={columns}
        items={defaultItems}
        onMove={vi.fn()}
        getItemLabel={(item) => item.title}
        renderCard={(item) => (
          <a href="/detalhe" onClick={onClick}>
            <img alt="" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" />
            {item.title}
          </a>
        )}
      />
    )
    const link = screen.getByRole('link', { name: 'Revisar PR' })

    for (const target of [link, link.querySelector('img') as HTMLElement]) {
      const drag = new Event('dragstart', { bubbles: true, cancelable: true })

      target.dispatchEvent(drag)

      expect(drag.defaultPrevented).toBe(true)
    }

    await user.click(link)

    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

describe('Board empty column content', () => {
  it('keeps the default text without renderEmpty', () => {
    renderWithProviders(<TestBoard />)
    const empty = screen.getByRole('region', { name: 'Concluído' }).querySelector('[data-slot="board-empty"]') as HTMLElement

    expect(empty.tagName).toBe('P')
    expect(empty.textContent).not.toBe('')
  })

  it('renders what renderEmpty returns for the column, in place of the default text', () => {
    const renderEmpty = vi.fn((column: BoardColumn) => <button type="button">Sugerir em {column.label ?? String(column.title)}</button>)
    renderWithProviders(<Board<Item> columns={columns} items={defaultItems} onMove={vi.fn()} getItemLabel={(item) => item.title} renderCard={(item) => <p>{item.title}</p>} renderEmpty={renderEmpty} />)
    const region = screen.getByRole('region', { name: 'Concluído' })
    const empty = region.querySelector('[data-slot="board-empty"]') as HTMLElement

    expect(empty.tagName).toBe('DIV')
    expect(within(empty).getByRole('button', { name: 'Sugerir em Concluído' })).toBeInTheDocument()
    expect(renderEmpty).toHaveBeenCalledTimes(1)
    expect(renderEmpty).toHaveBeenCalledWith(columns[2])
    expect(screen.getByRole('region', { name: 'A fazer' }).querySelector('[data-slot="board-empty"]')).toBeNull()
  })

  it('has no axe violations with descriptions and a custom empty content', async () => {
    const { container } = renderWithProviders(
      <Board<Item>
        columns={[{ id: 'todo', title: 'A fazer', description: 'Ainda sem dono' }, { id: 'done', title: 'Concluído', description: 'Entregue' }]}
        items={defaultItems.slice(0, 1)}
        onMove={vi.fn()}
        getItemLabel={(item) => item.title}
        renderCard={(item) => <p>{item.title}</p>}
        renderEmpty={() => <button type="button">Sugerir</button>}
      />
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})
