import { afterEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { DatePicker } from '@components/common/DatePicker/index.tsx'
import { frames, waitForSettled } from '../../../support/settle.ts'
import { renderInBrowser } from '../../../support/harness.tsx'
import { part } from '../../../support/hookProbes.ts'

import type { ReactElement } from 'react'

const moves = [
  ['ArrowDown', '{ArrowDown}', '2026-03-22', '2026-03-29'],
  ['ArrowUp', '{ArrowUp}', '2026-03-29', '2026-03-22'],
  ['ArrowRight', '{ArrowRight}', '2026-03-28', '2026-03-29'],
  ['ArrowLeft', '{ArrowLeft}', '2026-03-29', '2026-03-28'],
  ['Home', '{Home}', '2026-03-25', '2026-03-22'],
  ['End', '{End}', '2026-03-25', '2026-03-28'],
  ['PageDown', '{PageDown}', '2026-03-25', '2026-04-25'],
  ['PageUp', '{PageUp}', '2026-03-25', '2026-02-25'],
  ['Shift+PageDown', '{Shift>}{PageDown}{/Shift}', '2026-03-25', '2027-03-25'],
  ['Shift+PageUp', '{Shift>}{PageUp}{/Shift}', '2026-03-25', '2025-03-25']
] as const

const toggle = () => part('date-picker-toggle') as HTMLButtonElement

const body = () => part('popover-body')

const popup = () => document.body.querySelector<HTMLElement>('[data-slot="popover-content"]')

const dayOf = (date: string) => document.body.querySelector<HTMLElement>(`[data-slot="date-picker-calendar-day"][data-date="${date}"]`) as HTMLElement

const stage = (ui: ReactElement) => (
  <div style={{ position: 'relative', height: 3000 }}>
    <div style={{ position: 'absolute', top: 16, left: 300, width: 320 }}>{ui}</div>
  </div>
)

const opened = () => expect.poll(() => popup()?.getAttribute('data-state')).toBe('open')

const focusedOn = (date: string) => expect.poll(() => document.activeElement).toBe(dayOf(date))

const openers = {
  pointer: () => userEvent.click(toggle()),
  keyboard: async () => {
    toggle().focus()
    await userEvent.keyboard('{Enter}')
  }
}

const openOnShortScreen = async (date: string) => {
  await page.viewport(1280, 300)
  renderInBrowser(stage(<DatePicker label="Data" defaultValue={date} />))
  await userEvent.click(toggle())
  await opened()
  await focusedOn(date)
}

const overflow = (element: Element) => {
  const box = element.getBoundingClientRect()
  const area = body().getBoundingClientRect()
  const top = area.top + body().clientTop
  const left = area.left + body().clientLeft

  return Math.max(top - box.top, box.bottom - (top + body().clientHeight), left - box.left, box.right - (left + body().clientWidth), 0)
}

afterEach(() => page.viewport(1280, 800))

describe('the calendar of the DatePicker on a short screen in a real browser', () => {
  it.each(moves)('brings the day that %s reaches into the visible part of the body', async (_name, keys, from, to) => {
    await openOnShortScreen(from)

    expect(body().scrollHeight).toBeGreaterThan(body().clientHeight)
    expect(body().scrollTop).toBe(0)

    await userEvent.keyboard(keys)

    expect(document.activeElement).toBe(dayOf(to))
    expect(overflow(dayOf(to))).toBeLessThanOrEqual(1)
    expect(body().scrollTop).toBeGreaterThan(0)
    expect(window.scrollY).toBe(0)
  })

  it('keeps every day that the down arrow reaches inside the visible part, with the scroll of the body following it', async () => {
    await openOnShortScreen('2026-03-04')
    const scrolls: number[] = []

    for (const date of ['2026-03-11', '2026-03-18', '2026-03-25']) {
      await userEvent.keyboard('{ArrowDown}')

      expect(document.activeElement, date).toBe(dayOf(date))
      expect(overflow(dayOf(date)), date).toBeLessThanOrEqual(1)
      scrolls.push(body().scrollTop)
    }

    expect(scrolls).toEqual([...scrolls].sort((first, second) => first - second))
    expect(scrolls[2]).toBeGreaterThan(0)
    expect(window.scrollY).toBe(0)
  })

  it('brings the days that the up arrow reaches back into the visible part when the body was scrolled to its end', async () => {
    await openOnShortScreen('2026-03-25')
    body().scrollTop = body().scrollHeight
    const end = body().scrollTop

    expect(end).toBeGreaterThan(0)

    for (const date of ['2026-03-18', '2026-03-11', '2026-03-04']) {
      await userEvent.keyboard('{ArrowUp}')

      expect(document.activeElement, date).toBe(dayOf(date))
      expect(overflow(dayOf(date)), date).toBeLessThanOrEqual(1)
    }

    expect(body().scrollTop).toBeLessThan(end)
    expect(window.scrollY).toBe(0)
  })

  it.each(['pointer', 'keyboard'] as const)('does not scroll the body to the day when the calendar opens from the %s, even if the day is below the visible part', async (device) => {
    await page.viewport(1280, 300)
    renderInBrowser(stage(<DatePicker label="Data" defaultValue="2026-03-29" />), 'auto')
    await openers[device]()
    await opened()
    await waitForSettled(popup)
    await frames(3)

    expect(document.activeElement).toBe(dayOf('2026-03-29'))
    expect(overflow(dayOf('2026-03-29'))).toBeGreaterThan(1)
    expect(body().scrollTop).toBe(0)
    expect(window.scrollY).toBe(0)
  })
})

describe('the calendar of the DatePicker on a tall screen in a real browser', () => {
  it('does not scroll the body nor the page when the whole calendar is in view', async () => {
    renderInBrowser(stage(<DatePicker label="Data" defaultValue="2026-03-04" />))
    await userEvent.click(toggle())
    await opened()
    await focusedOn('2026-03-04')

    expect(body().scrollHeight).toBeLessThanOrEqual(body().clientHeight)

    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowRight}{End}{PageDown}{Home}{PageUp}{ArrowUp}')

    expect(document.activeElement).toBe(dayOf('2026-03-12'))
    expect(body().scrollTop).toBe(0)
    expect(window.scrollY).toBe(0)
  })
})
