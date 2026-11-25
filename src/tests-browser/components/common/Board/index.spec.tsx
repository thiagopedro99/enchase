import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { userEvent } from 'vitest/browser'

import { Board } from '@components/common/Board/index.tsx'
import UIProvider from '@components/uiProvider/index.tsx'
import { ptBR } from '@locales/ptBR.ts'
import { renderInBrowser } from '../../../support/harness.tsx'
import { part, parts } from '../../../support/hookProbes.ts'
import { letGoOfTheMouse, moveMouse, parkMouse, pressMouse, releaseMouse } from '../../../support/pointer.ts'
import { frames } from '../../../support/settle.ts'
import { setForcedColors } from '../../../support/media.ts'
import { unlessWebkit } from '../../../support/browserSkips.ts'

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

const TestBoard = ({ onMove, dir }: { onMove?: (move: BoardMove<Item>) => void; dir?: 'rtl' }) => {
  const [items, setItems] = useState(defaultItems)

  const board = (
    <Board<Item>
      columns={columns}
      items={items}
      onMove={(move) => {
        onMove?.(move)
        setItems((current) => applyMove(current, move))
      }}
      renderCard={(item) => <p>{item.title}</p>}
      getItemLabel={(item) => item.title}
    />
  )

  if (!dir) return board

  return (
    <div dir={dir}>
      <UIProvider locale={{ ...ptBR, dir }}>{board}</UIProvider>
    </div>
  )
}

const root = () => part('board')
const cards = () => parts('board-card')
const handle = (index: number) => parts('board-handle')[index]
const cardTitle = (index: number) => cards()[index].textContent

describe('Board in a real browser', () => {
  it('drags a card below another one within its own column', async () => {
    renderInBrowser(<TestBoard />)
    expect(cardTitle(0)).toBe('Revisar PR')
    expect(cardTitle(1)).toBe('Escrever testes')

    const target = cards()[1].getBoundingClientRect()

    await userEvent.dragAndDrop(handle(0), cards()[1], { sourcePosition: { x: 10, y: 10 }, targetPosition: { x: target.width / 2, y: target.height - 2 }, steps: 6 })
    await frames(2)

    expect(cardTitle(0)).toBe('Escrever testes')
    expect(cardTitle(1)).toBe('Revisar PR')
  })

  it('drags a card into another column at the right index, calling onMove once', async () => {
    const onMove = vi.fn()
    renderInBrowser(<TestBoard onMove={onMove} />)

    const doingColumn = part('board-column', 1)
    const columnBox = doingColumn.getBoundingClientRect()

    await userEvent.dragAndDrop(handle(0), doingColumn, { sourcePosition: { x: 10, y: 10 }, targetPosition: { x: columnBox.width / 2, y: 4 }, steps: 6 })
    await frames(2)

    expect(onMove).toHaveBeenCalledTimes(1)
    expect(onMove.mock.calls[0][0]).toMatchObject({ from: { columnId: 'todo', index: 0 }, to: { columnId: 'doing', index: 0 } })
    expect(part('board-column', 1).textContent).toContain('Revisar PR')
  })

  it('does not start a drag, and does not fire a click as one either, under the 5px threshold', async () => {
    const onMove = vi.fn()
    renderInBrowser(<TestBoard onMove={onMove} />)

    await userEvent.dragAndDrop(handle(0), handle(0), { sourcePosition: { x: 10, y: 10 }, targetPosition: { x: 12, y: 11 }, steps: 1 })
    await frames(2)

    expect(onMove).not.toHaveBeenCalled()
    expect(root().hasAttribute('data-dragging')).toBe(false)
    expect(cardTitle(0)).toBe('Revisar PR')
  })

  it('shows data-dragging and a floating copy while dragging, and clears both on drop', async () => {
    renderInBrowser(<TestBoard />)

    await pressMouse('[data-slot="board-handle"]')
    await moveMouse(200, 160, 6)
    await frames(2)

    expect(root().hasAttribute('data-dragging')).toBe(true)
    expect(document.querySelector('[data-slot="board-drag-copy"]')).toBeTruthy()

    await releaseMouse()
    await frames(2)

    expect(root().hasAttribute('data-dragging')).toBe(false)
    expect(document.querySelector('[data-slot="board-drag-copy"]')).toBeFalsy()
  })

  it('cancels the drag on Escape, discarding the move', async () => {
    const onMove = vi.fn()
    renderInBrowser(<TestBoard onMove={onMove} />)

    await pressMouse('[data-slot="board-handle"]')
    await moveMouse(200, 160, 6)
    await frames(2)
    expect(root().hasAttribute('data-dragging')).toBe(true)

    await userEvent.keyboard('{Escape}')
    await letGoOfTheMouse()
    await parkMouse()
    await frames(2)

    expect(onMove).not.toHaveBeenCalled()
    expect(root().hasAttribute('data-dragging')).toBe(false)
    expect(cardTitle(0)).toBe('Revisar PR')
  })

  const forcedColors = unlessWebkit('forcedColors') ? it : it.skip

  forcedColors('keeps the picked handle distinguishable in forced colors', async () => {
    renderInBrowser(<TestBoard />)

    handle(0).focus()
    await userEvent.keyboard(' ')
    const before = getComputedStyle(handle(0)).backgroundColor

    await setForcedColors('active')
    await frames(2)

    expect(getComputedStyle(handle(0)).backgroundColor).not.toBe(before)
  })

  it('reverses the arrow keys for a column swap in RTL', async () => {
    const onMove = vi.fn()
    renderInBrowser(<TestBoard onMove={onMove} dir="rtl" />)

    handle(0).focus()
    await userEvent.keyboard(' ')
    await userEvent.keyboard('{ArrowLeft}')
    await userEvent.keyboard(' ')

    expect(onMove).toHaveBeenCalledTimes(1)
    expect(onMove.mock.calls[0][0]).toMatchObject({ to: { columnId: 'doing' } })
  })
})
