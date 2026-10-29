import { afterEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { useEffect } from 'react'

import { usePopoverControl } from '@components/common/Popover/popoverControl.ts'
import { Popover } from '@components/common/Popover/index.tsx'
import { renderInBrowser } from '../../../support/harness.tsx'
import { Menu } from '@components/common/Menu/index.tsx'
import { frames } from '../../../support/settle.ts'

import type { ReactElement } from 'react'

type Edge = 'above' | 'below'

const edges = ['above', 'below'] as const

const afterTops = { above: 100, below: 5000 }

const closer: { close: (() => void) | undefined } = { close: undefined }

const Closer = () => {
  const control = usePopoverControl()

  useEffect(() => {
    closer.close = control?.close
  }, [control])

  return <button type="button">First</button>
}

const popover = (
  <Popover
    content={
      <>
        <button type="button">First</button>
        <button type="button">Last</button>
      </>
    }
  >
    <button type="button">Open</button>
  </Popover>
)

const menu = (
  <Menu
    label="Actions"
    items={[
      { id: 'first', label: 'First' },
      { id: 'last', label: 'Last' }
    ]}
  >
    <button type="button">Open</button>
  </Menu>
)

const kinds = [
  { name: 'Popover', overlay: popover },
  { name: 'Menu', overlay: menu }
]

const scene = (overlay: ReactElement, after: Edge | null = null) => (
  <div style={{ position: 'relative', height: 6000 }}>
    <button type="button" style={{ position: 'fixed', top: 300, left: 20 }}>
      Elsewhere
    </button>
    <div style={{ position: 'absolute', top: 3000, left: 300 }}>{overlay}</div>
    {after && (
      <button type="button" style={{ position: 'absolute', top: afterTops[after], left: 300 }}>
        After
      </button>
    )}
  </div>
)

const trigger = () => page.getByRole('button', { name: 'Open' }).element() as HTMLElement

const control = (name: string) => page.getByRole('button', { name }).element() as HTMLElement

const content = () => document.body.querySelector<HTMLElement>('[data-slot="popover-content"]')

const inside = () => [...(content()?.querySelectorAll<HTMLElement>('button') ?? [])]

const opened = () => expect.poll(() => content()?.getAttribute('data-state')).toBe('open')

const closed = () => expect.poll(content).toBeNull()

const pageScroll = () => [window.scrollX, window.scrollY]

const openByKeyboard = async () => {
  window.scrollTo(0, 2800)
  trigger().focus({ preventScroll: true })
  await userEvent.keyboard('{Enter}')
  await opened()
  await frames(2)
}

const showOnly = async (edge: Edge, visible: number) => {
  const box = trigger().getBoundingClientRect()
  const top = box.top + window.scrollY

  window.scrollTo(0, edge === 'above' ? top + box.height - visible : top - window.innerHeight + visible)
  await frames(3)
}

const outsideViewport = (element: Element) => {
  const box = element.getBoundingClientRect()

  return Math.max(-box.top, box.bottom - window.innerHeight, -box.left, box.right - window.innerWidth, 0)
}

const distanceToEdge = (element: Element, edge: Edge) => Math.abs(edge === 'above' ? element.getBoundingClientRect().top : element.getBoundingClientRect().bottom - window.innerHeight)

const expectFocusAtTheEdge = (element: Element, edge: Edge) => {
  expect(document.activeElement).toBe(element)
  expect(outsideViewport(element)).toBeLessThanOrEqual(1)
  expect(distanceToEdge(element, edge)).toBeLessThanOrEqual(1)
}

afterEach(() => {
  closer.close = undefined
})

describe.each(kinds)('the $name when it gives the focus back to the page in a real browser', ({ overlay }) => {
  it.each(edges)('shows the trigger when Escape closes it and the trigger is out of the screen, %s the viewport', async (edge) => {
    renderInBrowser(scene(overlay))
    await openByKeyboard()
    await showOnly(edge, -200)

    expect(outsideViewport(trigger())).toBeGreaterThan(100)

    await userEvent.keyboard('{Escape}')
    await closed()

    expectFocusAtTheEdge(trigger(), edge)
    expect(window.scrollX).toBe(0)
  })

  it.each(edges)('shows the trigger when Shift+Tab sends the focus back to it, with the trigger cut by the edge %s the viewport', async (edge) => {
    renderInBrowser(scene(overlay))
    await openByKeyboard()
    await showOnly(edge, 6)

    expect(content()?.contains(document.activeElement)).toBe(true)
    expect(outsideViewport(trigger())).toBeGreaterThan(5)

    await userEvent.keyboard('{Shift>}{Tab}{/Shift}')

    expectFocusAtTheEdge(trigger(), edge)
    expect(window.scrollX).toBe(0)
  })

  it.each(edges)('shows the control that Tab reaches after the trigger, when it is far %s the viewport', async (edge) => {
    renderInBrowser(scene(overlay, edge))
    await openByKeyboard()
    inside().at(-1)?.focus({ preventScroll: true })

    expect(outsideViewport(control('After'))).toBeGreaterThan(1000)

    await userEvent.tab()
    await closed()

    expectFocusAtTheEdge(control('After'), edge)
    expect(window.scrollX).toBe(0)
  })

  it.each(edges)('keeps the focus on the trigger and shows it when Tab leaves the content and nothing comes after it, with the trigger cut by the edge %s the viewport', async (edge) => {
    renderInBrowser(scene(overlay))
    await openByKeyboard()
    inside().at(-1)?.focus({ preventScroll: true })
    await showOnly(edge, 6)

    expect(outsideViewport(trigger())).toBeGreaterThan(5)

    await userEvent.tab()
    await closed()

    expectFocusAtTheEdge(trigger(), edge)
    expect(window.scrollX).toBe(0)
  })

  it('does not scroll the page when it closes on a click outside, and leaves the focus where the click put it', async () => {
    renderInBrowser(scene(overlay))
    await openByKeyboard()
    await showOnly('above', 6)
    const before = pageScroll()

    await userEvent.click(control('Elsewhere'))
    await closed()
    await frames(3)

    expect(document.activeElement).toBe(control('Elsewhere'))
    expect(pageScroll()).toEqual(before)
  })
})

describe('the control of the Popover that closes it in a real browser', () => {
  it.each(edges)('shows the trigger when the content closes the popover and the trigger is out of the screen, %s the viewport', async (edge) => {
    renderInBrowser(
      scene(
        <Popover content={<Closer />}>
          <button type="button">Open</button>
        </Popover>
      )
    )
    await openByKeyboard()
    await showOnly(edge, -200)

    expect(closer.close).toBeDefined()
    expect(outsideViewport(trigger())).toBeGreaterThan(100)

    closer.close?.()
    await closed()

    expectFocusAtTheEdge(trigger(), edge)
  })
})

describe('the Menu that closes when an item is chosen in a real browser', () => {
  it.each(edges)('shows the trigger when Enter chooses an item and the trigger is cut by the edge %s the viewport', async (edge) => {
    renderInBrowser(scene(menu))
    await openByKeyboard()
    await showOnly(edge, 6)

    expect(outsideViewport(trigger())).toBeGreaterThan(5)

    await userEvent.keyboard('{Enter}')
    await closed()

    expectFocusAtTheEdge(trigger(), edge)
  })
})

describe('the focus that the Popover takes when it opens in a real browser', () => {
  it('does not scroll the body nor the page to the control that takes the focus, even if the control is below the visible part', async () => {
    renderInBrowser(
      scene(
        <Popover
          content={
            <>
              <div style={{ height: 900 }} />
              <button type="button">Deep</button>
            </>
          }
        >
          <button type="button">Open</button>
        </Popover>
      )
    )
    await openByKeyboard()
    const body = document.body.querySelector<HTMLElement>('[data-slot="popover-body"]') as HTMLElement

    expect(document.activeElement).toBe(control('Deep'))
    expect(body.scrollHeight).toBeGreaterThan(body.clientHeight)
    expect(body.scrollTop).toBe(0)
    expect(pageScroll()).toEqual([0, 2800])
    expect(control('Deep').getBoundingClientRect().top).toBeGreaterThanOrEqual(body.getBoundingClientRect().bottom)
  })
})
