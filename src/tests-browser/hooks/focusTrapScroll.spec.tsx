import { describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'

import { Sidebar } from '@components/common/Sidebar/index.tsx'
import { Drawer } from '@components/common/Drawer/index.tsx'
import { Modal } from '@components/common/Modal/index.tsx'
import { renderInBrowser } from '../support/harness.tsx'
import { waitForSettled } from '../support/settle.ts'
import { part } from '../support/hookProbes.ts'

import type { SidebarSection } from '@components/common/Sidebar/types.ts'
import type { ReactElement } from 'react'

type Overlay = { name: string; panel: string; body: string; ui: ReactElement }

const noop = () => undefined

const fields = Array.from({ length: 24 }, (_, index) => <input key={index} aria-label={`Field ${index + 1}`} style={{ display: 'block', blockSize: 40, marginBlockEnd: 16 }} />)

const sections: SidebarSection[] = [
  {
    id: 'links',
    title: 'Links',
    items: Array.from({ length: 33 }, (_, index) => ({ id: `link-${index + 1}`, label: `Link ${index + 1}`, icon: <span />, href: `/link-${index + 1}` }))
  }
]

const overlays: Overlay[] = [
  {
    name: 'Drawer',
    panel: 'drawer-panel',
    body: 'drawer-body',
    ui: (
      <Drawer open onClose={noop} title="Filters" footer={<button type="button">Apply</button>}>
        {fields}
      </Drawer>
    )
  },
  {
    name: 'Modal',
    panel: 'modal-panel',
    body: 'modal-body',
    ui: (
      <Modal isOpen onClose={noop} title="Terms" footer={<button type="button">Accept</button>}>
        {fields}
      </Modal>
    )
  },
  { name: 'modal Sidebar', panel: 'sidebar-panel', body: 'sidebar-nav', ui: <Sidebar variant="modal" open onClose={noop} sections={sections} /> }
]

const pageScroll = () => [document.scrollingElement?.scrollLeft, document.scrollingElement?.scrollTop]

const nameOf = (element: Element | null) => element?.getAttribute('aria-label') ?? element?.textContent?.trim() ?? 'nothing'

const isInside = (box: DOMRect, area: DOMRect) => box.top >= area.top - 1 && box.bottom <= area.bottom + 1 && box.left >= area.left - 1 && box.right <= area.right + 1

const forward = () => userEvent.tab()

const backward = () => userEvent.keyboard('{Shift>}{Tab}{/Shift}')

const openOverShiftedPage = async ({ panel, ui }: Overlay) => {
  renderInBrowser(
    <>
      <main style={{ blockSize: 3000, inlineSize: 3000 }}>
        <button type="button">Behind</button>
      </main>
      {ui}
    </>
  )
  await expect.poll(() => part(panel)?.getAttribute('data-state')).toBe('open')
  await waitForSettled(() => part(panel))
  window.scrollTo(200, 300)
}

const problemsOf = ({ panel, body }: Overlay, pageBefore: (number | undefined)[]) => {
  const active = document.activeElement
  const area = (part(body).contains(active) ? part(body) : part(panel)).getBoundingClientRect()

  return [
    !part(panel).contains(active) && 'the focus left the panel',
    active && !isInside(active.getBoundingClientRect(), area) && 'is not fully inside the visible area',
    pageScroll().join() !== pageBefore.join() && `scrolled the page behind to ${pageScroll().join()}`
  ]
    .filter((problem) => typeof problem === 'string')
    .map((problem) => `${nameOf(active)} ${problem}`)
}

const walkAround = async (overlay: Overlay, press: () => Promise<void>) => {
  await openOverShiftedPage(overlay)

  const body = part(overlay.body)
  const stops = part(overlay.panel).querySelectorAll('input, button, a[href], [tabindex="0"]').length
  const first = document.activeElement
  const before = pageScroll()
  const problems: string[] = []

  expect(before).toEqual([200, 300])
  expect(body.scrollHeight).toBeGreaterThan(body.clientHeight)

  for (let step = 1; step <= stops; step += 1) {
    await press()
    problems.push(...problemsOf(overlay, before).map((problem) => `${step}: ${problem}`))
  }

  expect(problems).toEqual([])
  expect(document.activeElement).toBe(first)
}

describe('the focus trap scrolling in a real browser', () => {
  it.each(overlays)('keeps the control Tab reaches in view in the $name, also when it wraps from the last to the first', (overlay) => walkAround(overlay, forward))

  it.each(overlays)('keeps the control Shift+Tab reaches in view in the $name, also when it wraps from the first to the last', (overlay) => walkAround(overlay, backward))
})
