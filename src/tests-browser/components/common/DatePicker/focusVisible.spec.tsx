import { describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'

import { DatePicker } from '@components/common/DatePicker/index.tsx'
import { renderInBrowser } from '../../../support/harness.tsx'
import { part } from '../../../support/hookProbes.ts'

import type { ReactElement } from 'react'

const toggle = () => part('date-picker-toggle') as HTMLButtonElement

const popup = () => document.body.querySelector<HTMLElement>('[data-slot="popover-content"]')

const dayOf = (date: string) => document.body.querySelector<HTMLElement>(`[data-slot="date-picker-calendar-day"][data-date="${date}"]`) as HTMLElement

const numberOf = (date: string) => dayOf(date).querySelector('[data-slot="date-picker-calendar-day-number"]') as HTMLElement

const stage = (ui: ReactElement) => <div style={{ position: 'absolute', top: 120, left: 300, width: 320 }}>{ui}</div>

const openedByClick = async (picker: ReactElement = <DatePicker label="Data" defaultValue="2026-03-18" />) => {
  renderInBrowser(stage(picker))
  await userEvent.click(toggle())
  await expect.poll(() => popup()?.getAttribute('data-state')).toBe('open')
  await expect.poll(() => document.activeElement).toBe(dayOf('2026-03-18'))
}

const expectRing = (date: string) => {
  expect(document.activeElement).toBe(dayOf(date))
  expect(getComputedStyle(numberOf(date)).outlineStyle).toBe('solid')
  expect(parseFloat(getComputedStyle(numberOf(date)).outlineWidth)).toBeGreaterThanOrEqual(2)
}

describe('the ring of the day of the DatePicker after the calendar opened with a click, in a real browser', () => {
  it('shows no ring on the day that took the focus when the calendar opened', async () => {
    await openedByClick()

    expect(getComputedStyle(numberOf('2026-03-18')).outlineStyle).toBe('none')
  })

  it.each([
    ['ArrowRight', '{ArrowRight}', '2026-03-19'],
    ['ArrowDown', '{ArrowDown}', '2026-03-25'],
    ['Home', '{Home}', '2026-03-15'],
    ['PageDown', '{PageDown}', '2026-04-18']
  ] as const)('shows the ring on the day that %s reaches', async (_name, keys, date) => {
    await openedByClick()
    await userEvent.keyboard(keys)

    expectRing(date)
  })

  it('shows the ring on the day that Shift+PageDown reaches', async () => {
    await openedByClick()
    await userEvent.keyboard('{Shift>}{PageDown}{/Shift}')

    expectRing('2027-03-18')
  })

  it('shows no ring on the day that a click focuses after the keys had moved the focus', async () => {
    await openedByClick(<DatePicker label="Data" defaultValue="2026-03-18" isDateDisabled={(date) => date === '2026-03-20'} />)
    await userEvent.keyboard('{ArrowRight}')

    expectRing('2026-03-19')

    await userEvent.click(dayOf('2026-03-20'), { force: true })

    expect(document.activeElement).toBe(dayOf('2026-03-20'))
    expect(getComputedStyle(numberOf('2026-03-20')).outlineStyle).toBe('none')
  })

  it('shows the ring on the day that the next arrow reaches after a Shift press that moved nothing', async () => {
    await openedByClick()
    await userEvent.keyboard('{Shift}')
    await userEvent.keyboard('{ArrowRight}')

    expectRing('2026-03-19')
  })
})
