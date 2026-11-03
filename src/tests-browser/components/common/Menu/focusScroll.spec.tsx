import { afterEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { Button } from '@components/common/Button/index.tsx'
import { Menu } from '@components/common/Menu/index.tsx'
import { frames, waitForSettled } from '../../../support/settle.ts'
import { renderInBrowser } from '../../../support/harness.tsx'
import { onRoot, part, parts } from '../../../support/hookProbes.ts'

const entries = Array.from({ length: 30 }, (_, index) => ({ id: `item-${index + 1}`, label: `Item ${index + 1}` }))

const body = () => part('popover-body')

const popup = () => document.body.querySelector<HTMLElement>('[data-slot="popover-content"]')

const item = (position: number) => parts('menu-item')[position - 1]

const opened = () => expect.poll(() => popup()?.getAttribute('data-state')).toBe('open')

const focusedOn = (position: number) => expect(document.activeElement).toBe(item(position))

const openOnShortScreen = async (key: '{Enter}' | '{ArrowDown}' | '{ArrowUp}' = '{Enter}') => {
  await page.viewport(1280, 300)
  renderInBrowser(
    <div style={{ padding: 16 }}>
      <Menu label="Actions" items={entries}>
        <Button>Open</Button>
      </Menu>
    </div>
  )
  await userEvent.tab()
  await userEvent.keyboard(key)
  await opened()
  await waitForSettled(popup)
  await frames(2)
}

const overflow = (element: Element, reach = 0) => {
  const box = element.getBoundingClientRect()
  const area = body().getBoundingClientRect()
  const top = area.top + body().clientTop
  const left = area.left + body().clientLeft

  return Math.max(top - (box.top - reach), box.bottom + reach - (top + body().clientHeight), left - (box.left - reach), box.right + reach - (left + body().clientWidth), 0)
}

afterEach(async () => {
  document.documentElement.removeAttribute('style')
  await page.viewport(1280, 800)
})

describe('the items of the Menu on a short screen in a real browser', () => {
  it('has a body that scrolls, so the items below the visible part need the scroll to be seen', async () => {
    await openOnShortScreen()

    expect(body().scrollHeight).toBeGreaterThan(body().clientHeight)
    expect(body().scrollTop).toBe(0)
  })

  it('keeps every item that the down arrow reaches inside the visible part of the body, with the scroll following it', async () => {
    await openOnShortScreen()

    for (let position = 2; position <= 14; position += 1) {
      await userEvent.keyboard('{ArrowDown}')

      focusedOn(position)
      expect(overflow(item(position)), `item ${position}`).toBeLessThanOrEqual(1)
    }

    expect(body().scrollTop).toBeGreaterThan(0)
    expect(window.scrollY).toBe(0)
  })

  it('keeps every item that the up arrow reaches inside the visible part when the body was scrolled to its end', async () => {
    await openOnShortScreen('{ArrowUp}')
    focusedOn(30)

    for (let position = 29; position >= 18; position -= 1) {
      await userEvent.keyboard('{ArrowUp}')

      focusedOn(position)
      expect(overflow(item(position)), `item ${position}`).toBeLessThanOrEqual(1)
    }

    expect(window.scrollY).toBe(0)
  })

  it.each([
    ['End', '{End}', 30],
    ['Home', '{Home}', 1]
  ] as const)('brings the item that %s reaches into the visible part of the body, with the padding of the list beyond it', async (_name, key, position) => {
    await openOnShortScreen()

    if (position === 1) await userEvent.keyboard('{End}')

    await userEvent.keyboard(key)

    focusedOn(position)
    expect(overflow(item(position))).toBeLessThanOrEqual(1)
    expect(position === 1 ? body().scrollTop : body().scrollHeight - body().clientHeight - body().scrollTop).toBeLessThanOrEqual(1)
  })

  it.each([
    ['End', '{End}', 30],
    ['Home', '{Home}', 1]
  ] as const)('keeps the padding that the hook gives the list beyond the item that %s reaches', async (_name, key, position) => {
    onRoot({ '--enchase-menu-padding-block': '14px' })
    await openOnShortScreen()

    if (position === 1) await userEvent.keyboard('{End}')

    await userEvent.keyboard(key)

    focusedOn(position)
    expect(position === 1 ? body().scrollTop : body().scrollHeight - body().clientHeight - body().scrollTop).toBeLessThanOrEqual(1)
  })
})

describe('the first focus of the Menu on a short screen in a real browser', () => {
  it('puts the last item in the visible part of the body when the up arrow opens the menu', async () => {
    await openOnShortScreen('{ArrowUp}')

    focusedOn(30)
    expect(overflow(item(30))).toBeLessThanOrEqual(1)
    expect(body().scrollTop).toBeGreaterThan(0)
    expect(window.scrollY).toBe(0)
  })

  it('leaves the first item at the top of the body when the menu opens on it', async () => {
    await openOnShortScreen('{ArrowDown}')

    focusedOn(1)
    expect(overflow(item(1))).toBeLessThanOrEqual(1)
    expect(body().scrollTop).toBe(0)
    expect(window.scrollY).toBe(0)
  })
})
