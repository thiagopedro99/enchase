import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { Checkbox } from '@components/common/Checkbox/index.tsx'
import { Modal } from '@components/common/Modal/index.tsx'
import { Tooltip } from '@components/common/Tooltip/index.tsx'
import { resetTooltipGroup } from '@components/common/Tooltip/defaultData.ts'
import { useToast } from '@components/toast/index.ts'
import { renderInBrowser } from './harness.tsx'
import { setReducedMotion } from './media.ts'


const sample = (read: () => number, ms: number) =>
  new Promise<number[]>((resolve) => {
    const values: number[] = []
    const start = performance.now()
    const tick = () => {
      values.push(read())
      if (performance.now() - start < ms) requestAnimationFrame(tick)
      else resolve(values)
    }
    tick()
  })

const scaleOf = (element: HTMLElement) => {
  const transform = getComputedStyle(element).transform

  return transform === 'none' ? 1 : new DOMMatrixReadOnly(transform).a
}

const translateXOf = (element: HTMLElement) => {
  const transform = getComputedStyle(element).transform

  return transform === 'none' ? 0 : new DOMMatrixReadOnly(transform).e
}

const panel = () => document.querySelector<HTMLElement>('[data-slot="modal-panel"]')
const bubbles = () => [...document.querySelectorAll<HTMLElement>('[data-slot="tooltip-bubble"]')]

const ModalPage = ({ bouncy }: { bouncy?: boolean }) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)}>Abrir</button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Título" style={bouncy ? ({ '--enchase-modal-ease': 'var(--enchase-motion-spring-bouncy)' } as never) : undefined}>
        <p>Corpo</p>
      </Modal>
    </>
  )
}

const ToastPage = () => {
  const toast = useToast()

  return <button onClick={() => toast.success('Salvo')}>Avisar</button>
}

beforeEach(resetTooltipGroup)

afterEach(async () => {
  await setReducedMotion('no-preference')
})

describe('springs in a real browser', () => {
  it('scales the modal in with the gentle spring, a linear() easing, and finishes at full size', async () => {
    renderInBrowser(<ModalPage />, 'auto')
    await userEvent.click(page.getByRole('button', { name: 'Abrir' }))
    await expect.element(page.getByRole('dialog')).toBeVisible()
    const element = panel() as HTMLElement
    const values = await sample(() => scaleOf(element), 700)

    expect(getComputedStyle(element).transitionTimingFunction).toContain('linear(')
    expect(values[values.length - 1]).toBeCloseTo(1, 3)
    expect(Math.max(...values)).toBeLessThanOrEqual(1.002)
  })

  it('lets a bouncier spring overshoot the final scale', async () => {
    renderInBrowser(<ModalPage bouncy />, 'auto')
    await userEvent.click(page.getByRole('button', { name: 'Abrir' }))
    await expect.element(page.getByRole('dialog')).toBeVisible()
    const values = await sample(() => scaleOf(panel() as HTMLElement), 900)

    expect(Math.max(...values)).toBeGreaterThan(1.001)
    expect(values[values.length - 1]).toBeCloseTo(1, 3)
  })

  it('slides the toast in with the snappy spring and overshoots its resting place', async () => {
    renderInBrowser(<ToastPage />, 'auto')
    await userEvent.click(page.getByRole('button', { name: 'Avisar' }))
    await expect.poll(() => document.querySelector('[data-slot="toast"]')).toBeTruthy()
    const element = document.querySelector<HTMLElement>('[data-slot="toast"]') as HTMLElement
    const values = await sample(() => translateXOf(element), 700)

    expect(getComputedStyle(element).transitionTimingFunction).toContain('linear(')
    expect(Math.min(...values)).toBeLessThan(-0.05)
    expect(values[values.length - 1]).toBeCloseTo(0, 1)
  })

  it('opens a second tooltip at once without any transition while the first is still open', async () => {
    renderInBrowser(
      <>
        <Tooltip text="Primeiro" openDelay={150}>
          <button>Um</button>
        </Tooltip>
        <Tooltip text="Segundo" openDelay={150}>
          <button>Dois</button>
        </Tooltip>
      </>,
      'auto'
    )
    await userEvent.hover(page.getByRole('button', { name: 'Um' }))
    await expect.poll(() => bubbles().length).toBe(1)
    await expect.poll(() => bubbles()[0]?.getAttribute('data-state')).toBe('open')
    await userEvent.hover(page.getByRole('button', { name: 'Dois' }))
    await expect.poll(() => bubbles().some((bubble) => bubble.textContent === 'Segundo')).toBe(true)
    const second = bubbles().find((bubble) => bubble.textContent === 'Segundo') as HTMLElement

    expect(second.getAttribute('data-animation')).toBe('off')
    expect(getComputedStyle(second).transitionDuration).toBe('0s')
    await expect.poll(() => getComputedStyle(second).opacity).toBe('1')
  })

  it('keeps the animation and the delay for a tooltip that opens alone', async () => {
    renderInBrowser(
      <Tooltip text="Sozinho" openDelay={700}>
        <button>Alvo</button>
      </Tooltip>,
      'auto'
    )
    await userEvent.hover(page.getByRole('button', { name: 'Alvo' }))
    expect(bubbles()).toHaveLength(0)
    await expect.poll(() => bubbles().length).toBe(1)

    expect(bubbles()[0].getAttribute('data-animation')).not.toBe('off')
    expect(parseFloat(getComputedStyle(bubbles()[0]).transitionDuration)).toBeGreaterThan(0)
  })

  it('fades and scales the checkbox mark in, and only fades under reduced motion', async () => {
    renderInBrowser(<Checkbox label="Aceito" />, 'auto')
    const mark = () => document.querySelector<HTMLElement>('[data-slot="checkbox-box"] span') as HTMLElement

    expect(getComputedStyle(mark()).opacity).toBe('0')
    await userEvent.click(page.getByText('Aceito'))
    await expect.poll(() => getComputedStyle(mark()).opacity).toBe('1')
    expect(scaleOf(mark())).toBe(1)
    expect(parseFloat(getComputedStyle(mark()).transitionDuration)).toBeGreaterThan(0)

    await setReducedMotion('reduce')
    await userEvent.click(page.getByText('Aceito'))

    expect(getComputedStyle(mark()).transform).toBe('none')
  })
})
