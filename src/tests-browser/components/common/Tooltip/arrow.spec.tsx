import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { Tooltip } from '@components/common/Tooltip/index.tsx'
import { resetTooltipGroup } from '@components/common/Tooltip/defaultData.ts'
import UIProvider from '@components/uiProvider/index.tsx'
import { ptBR } from '@locales/ptBR.ts'
import { renderInBrowser } from '../../../support/harness.tsx'
import { onRoot } from '../../../support/hookProbes.ts'

import type { ReactNode } from 'react'

const bubble = () => document.body.querySelector<HTMLElement>('[data-slot="tooltip-bubble"]')

const arrow = () => document.body.querySelector<HTMLElement>('[data-slot="tooltip-arrow"]')

const trigger = () => page.getByRole('button', { name: 'Alvo' }).element() as HTMLElement

const centerOf = (rect: DOMRect) => ({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })

const reveal = async () => {
  await userEvent.hover(page.getByRole('button', { name: 'Alvo' }))
  await expect.poll(() => bubble()?.getAttribute('data-state')).toBe('open')
  await expect.poll(arrow).toBeTruthy()
}

const centered = (children: ReactNode) => <div style={{ position: 'absolute', top: 300, left: 560 }}>{children}</div>

const facing = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' } as const

beforeEach(resetTooltipGroup)

afterEach(() => {
  document.documentElement.removeAttribute('style')
})

describe('the arrow of the Tooltip in a real browser', () => {
  it('is not drawn unless it is told to', async () => {
    renderInBrowser(
      centered(
        <Tooltip text="Dica" openDelay={0}>
          <button>Alvo</button>
        </Tooltip>
      )
    )
    await userEvent.hover(page.getByRole('button', { name: 'Alvo' }))
    await expect.poll(bubble).toBeTruthy()

    expect(arrow()).toBeNull()
  })

  it.each(['top', 'bottom', 'left', 'right'] as const)('sits on the edge of the bubble that faces the trigger, pointing at the middle of it, when the bubble is at the %s', async (position) => {
    renderInBrowser(
      centered(
        <Tooltip text="Uma dica um pouco maior" position={position} arrow openDelay={0}>
          <button>Alvo</button>
        </Tooltip>
      )
    )
    await reveal()
    const [box, point, reference] = [(bubble() as HTMLElement).getBoundingClientRect(), centerOf((arrow() as HTMLElement).getBoundingClientRect()), centerOf(trigger().getBoundingClientRect())]
    const edge = { top: box.bottom, bottom: box.top, left: box.right, right: box.left }[position]

    expect(bubble()).toHaveAttribute('data-position', position)
    expect(facing[position]).toBeDefined()
    expect(Math.abs((position === 'top' || position === 'bottom' ? point.y : point.x) - edge)).toBeLessThanOrEqual(1)
    expect(Math.abs(position === 'top' || position === 'bottom' ? point.x - reference.x : point.y - reference.y)).toBeLessThanOrEqual(1)
  })

  it('points out of the bubble by about the half of its diagonal, and stays clear of the trigger', async () => {
    renderInBrowser(
      centered(
        <Tooltip text="Dica" position="top" arrow openDelay={0}>
          <button>Alvo</button>
        </Tooltip>
      )
    )
    await reveal()
    const tip = (arrow() as HTMLElement).getBoundingClientRect()

    expect(Math.round(tip.width)).toBe(11)
    expect(tip.bottom).toBeLessThanOrEqual(trigger().getBoundingClientRect().top)
    expect(Math.round(tip.bottom - (bubble() as HTMLElement).getBoundingClientRect().bottom)).toBe(6)
  })

  it('keeps pointing at the middle of a trigger of a fixed size, inside the bubble, when the bubble moves along the trigger near the edge of the screen', async () => {
    renderInBrowser(
      <div style={{ position: 'absolute', top: 300, left: 2 }}>
        <Tooltip text="A dica longa o bastante para empurrar a bolha" position="top" arrow openDelay={0}>
          <button style={{ inlineSize: 80, blockSize: 32, padding: 0 }}>Alvo</button>
        </Tooltip>
      </div>
    )
    await reveal()
    const [box, point, reference] = [(bubble() as HTMLElement).getBoundingClientRect(), centerOf((arrow() as HTMLElement).getBoundingClientRect()), centerOf(trigger().getBoundingClientRect())]

    expect(Math.round(box.left)).toBe(8)
    expect(point.x).toBeGreaterThanOrEqual(box.left + 6 + 4 - 0.5)
    expect(point.x).toBeLessThanOrEqual(box.right - 6 - 4 + 0.5)
    expect(Math.abs(point.x - reference.x)).toBeLessThanOrEqual(1)
  })

  it('moves to the other edge when the bubble flips under the trigger for lack of room', async () => {
    renderInBrowser(
      <div style={{ position: 'absolute', top: 2, left: 560 }}>
        <Tooltip text="Dica" position="top" arrow openDelay={0}>
          <button>Alvo</button>
        </Tooltip>
      </div>
    )
    await reveal()
    const [box, point] = [(bubble() as HTMLElement).getBoundingClientRect(), centerOf((arrow() as HTMLElement).getBoundingClientRect())]

    expect(bubble()).toHaveAttribute('data-position', 'bottom')
    expect(Math.abs(point.y - box.top)).toBeLessThanOrEqual(1)
  })

  it.each([
    ['start', 'right'],
    ['end', 'left']
  ] as const)('follows the direction of the text: %s is the %s side when the text runs from right to left', async (position, side) => {
    renderInBrowser(
      <div dir="rtl" style={{ position: 'absolute', top: 300, left: 560 }}>
        <UIProvider locale={{ ...ptBR, dir: 'rtl' }}>
          <Tooltip text="Dica" position={position} arrow openDelay={0}>
            <button>Alvo</button>
          </Tooltip>
        </UIProvider>
      </div>
    )
    await reveal()
    const [box, point] = [(bubble() as HTMLElement).getBoundingClientRect(), centerOf((arrow() as HTMLElement).getBoundingClientRect())]

    expect(bubble()).toHaveAttribute('data-position', side)
    expect(Math.abs(point.x - (side === 'right' ? box.left : box.right))).toBeLessThanOrEqual(1)
  })

  it('takes its size from the hook, and the color from the bubble, even when the bubble has its own', async () => {
    onRoot({ '--enchase-tooltip-arrow-size': '16px' })
    renderInBrowser(
      centered(
        <Tooltip text="Dica" arrow openDelay={0} bubbleStyle={{ background: 'rgb(10, 20, 30)' }}>
          <button>Alvo</button>
        </Tooltip>
      )
    )
    await reveal()

    expect((arrow() as HTMLElement).offsetWidth).toBe(16)
    expect(getComputedStyle(arrow() as HTMLElement).backgroundColor).toBe('rgb(10, 20, 30)')
    expect(getComputedStyle(bubble() as HTMLElement).backgroundColor).toBe('rgb(10, 20, 30)')
  })

  it('does not take the pointer or the focus, and is hidden along with the bubble', async () => {
    renderInBrowser(
      centered(
        <Tooltip text="Dica" arrow openDelay={0}>
          <button>Alvo</button>
        </Tooltip>
      )
    )
    await reveal()

    expect(getComputedStyle(arrow() as HTMLElement).pointerEvents).toBe('none')
    expect((arrow() as HTMLElement).getAttribute('aria-hidden')).toBe('true')
    expect(bubble()).toHaveAttribute('aria-hidden', 'true')
  })
})
