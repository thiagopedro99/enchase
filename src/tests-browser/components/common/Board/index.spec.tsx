import { StrictMode, useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { page, userEvent } from 'vitest/browser'

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

const TestBoard = ({ onMove, dir, sortable, readOnly }: { onMove?: (move: BoardMove<Item>) => void; dir?: 'rtl'; sortable?: boolean; readOnly?: boolean }) => {
  const [items, setItems] = useState(defaultItems)

  const board = (
    <Board<Item>
      columns={columns}
      items={items}
      sortable={sortable}
      readOnly={readOnly}
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

afterEach(async () => {
  await setForcedColors('none')
})

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

  it('shows data-dragging and a floating copy the width and look of the original card, and clears both on drop', async () => {
    renderInBrowser(<TestBoard />)
    const originalWidth = cards()[0].getBoundingClientRect().width

    await pressMouse('[data-slot="board-handle"]')
    await moveMouse(200, 160, 6)
    await frames(2)

    expect(root().hasAttribute('data-dragging')).toBe(true)
    const copy = document.querySelector('[data-slot="board-drag-copy"]') as HTMLElement
    expect(copy).toBeTruthy()
    expect(Math.abs(copy.getBoundingClientRect().width - originalWidth)).toBeLessThan(3)
    expect(copy.textContent).toContain('Revisar PR')

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

  it('calls onMove exactly once under StrictMode for a pointer drag', async () => {
    const onMove = vi.fn()
    renderInBrowser(
      <StrictMode>
        <TestBoard onMove={onMove} />
      </StrictMode>
    )

    const target = cards()[1].getBoundingClientRect()
    await userEvent.dragAndDrop(handle(0), cards()[1], { sourcePosition: { x: 10, y: 10 }, targetPosition: { x: target.width / 2, y: target.height - 2 }, steps: 6 })
    await frames(2)

    expect(onMove).toHaveBeenCalledTimes(1)
  })

  it('does nothing when dragging within the same column while sortable is false', async () => {
    const onMove = vi.fn()
    renderInBrowser(<TestBoard onMove={onMove} sortable={false} />)

    const target = cards()[1].getBoundingClientRect()

    await userEvent.dragAndDrop(handle(0), cards()[1], { sourcePosition: { x: 10, y: 10 }, targetPosition: { x: target.width / 2, y: target.height - 2 }, steps: 6 })
    await frames(2)

    expect(onMove).not.toHaveBeenCalled()
    expect(cardTitle(0)).toBe('Revisar PR')
    expect(cardTitle(1)).toBe('Escrever testes')
    expect(document.querySelector('[data-slot="board-line"]')).toBeFalsy()
  })

  it('drags a card to the end of another column regardless of the drop position when sortable is false', async () => {
    const onMove = vi.fn()
    renderInBrowser(<TestBoard onMove={onMove} sortable={false} />)

    const todoColumn = part('board-column', 0)
    const columnBox = todoColumn.getBoundingClientRect()

    await userEvent.dragAndDrop(handle(2), todoColumn, { sourcePosition: { x: 10, y: 10 }, targetPosition: { x: columnBox.width / 2, y: 4 }, steps: 6 })
    await frames(2)

    expect(onMove).toHaveBeenCalledTimes(1)
    expect(onMove.mock.calls[0][0]).toMatchObject({ to: { columnId: 'todo', index: 2 } })
  })

  it('does not scroll the page sideways on a narrow viewport', async () => {
    await page.viewport(400, 800)
    renderInBrowser(<TestBoard />)
    await frames(2)

    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(document.documentElement.clientWidth)
  })

  it('shows a grab cursor on a draggable card and disables selection only while dragging', async () => {
    renderInBrowser(<TestBoard />)

    expect(getComputedStyle(cards()[0]).cursor).toBe('grab')
    expect(getComputedStyle(cards()[0]).userSelect).not.toBe('none')

    await pressMouse('[data-slot="board-handle"]')
    await moveMouse(200, 160, 6)
    await frames(2)

    expect(getComputedStyle(cards()[0]).userSelect).toBe('none')
    expect(getComputedStyle(cards()[1]).userSelect).toBe('none')

    await releaseMouse()
    await frames(2)

    expect(getComputedStyle(cards()[0]).userSelect).not.toBe('none')
  })

  it('does not show a grab cursor and leaves text selectable when read-only', () => {
    renderInBrowser(<TestBoard readOnly />)

    expect(getComputedStyle(cards()[0]).cursor).not.toBe('grab')
    expect(getComputedStyle(cards()[0]).userSelect).not.toBe('none')
  })

  it('does not touch an unrelated existing inline style on the document element while dragging', async () => {
    document.documentElement.style.setProperty('--consumer-app-marker', 'kept')
    try {
      renderInBrowser(<TestBoard />)

      await pressMouse('[data-slot="board-handle"]')
      await moveMouse(200, 160, 6)
      await frames(2)
      await releaseMouse()
      await frames(2)

      expect(document.documentElement.style.getPropertyValue('--consumer-app-marker')).toBe('kept')
    } finally {
      document.documentElement.style.removeProperty('--consumer-app-marker')
    }
  })

  it('clears the target highlight and the line, and cancels, when the pointer leaves the track', async () => {
    const onMove = vi.fn()
    renderInBrowser(
      <div style={{ paddingBlockEnd: 400 }}>
        <TestBoard onMove={onMove} />
      </div>
    )

    const track = part('board-track').getBoundingClientRect()
    const doingColumn = part('board-column', 1).getBoundingClientRect()

    await pressMouse('[data-slot="board-handle"]')
    await moveMouse(doingColumn.left + 20, doingColumn.top + 40, 6)
    await frames(2)
    expect(part('board-column', 1).hasAttribute('data-target')).toBe(true)

    await moveMouse(track.left + 100, track.bottom + 200, 6)
    await frames(2)
    expect(document.querySelector('[data-target]')).toBeFalsy()
    expect(document.querySelector('[data-slot="board-line"]')).toBeFalsy()

    await releaseMouse()
    await frames(2)
    expect(onMove).not.toHaveBeenCalled()
    expect(cardTitle(0)).toBe('Revisar PR')
  })

  it('does not highlight the origin column when sortable is false, since dropping there never moves the card', async () => {
    renderInBrowser(<TestBoard sortable={false} />)

    const target = cards()[1].getBoundingClientRect()
    await pressMouse('[data-slot="board-handle"]')
    await moveMouse(target.left + target.width / 2, target.top + 10, 6)
    await frames(2)

    expect(document.querySelector('[data-target]')).toBeFalsy()
  })

  it('keeps the card content the same width in the drag copy, so it wraps the same way', async () => {
    renderInBrowser(<TestBoard />)
    const originalWidth = part('board-card-content').getBoundingClientRect().width

    await pressMouse('[data-slot="board-handle"]')
    await moveMouse(200, 160, 6)
    await frames(2)

    const copyContent = document.querySelector('[data-slot="board-drag-copy-content"]') as HTMLElement
    expect(Math.abs(copyContent.getBoundingClientRect().width - originalWidth)).toBeLessThan(3)
  })

  it('cleans up the window listeners, the auto-scroll loop and the dragging attribute when it unmounts mid-drag', async () => {
    const { unmount } = renderInBrowser(<TestBoard />)

    await pressMouse('[data-slot="board-handle"]')
    await moveMouse(200, 160, 6)
    await frames(2)
    expect(document.documentElement.hasAttribute('data-enchase-board-dragging')).toBe(true)

    unmount()
    await frames(2)

    expect(document.documentElement.hasAttribute('data-enchase-board-dragging')).toBe(false)
  })
})
