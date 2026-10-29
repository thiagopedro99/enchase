import { useState } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { Calendar } from '@components/common/DatePicker/subcomponentes/Calendar/index.tsx'
import UIProvider from '@components/uiProvider/index.tsx'
import { en } from '@locales/en.ts'
import { ptBR } from '@locales/ptBR.ts'
import { contrastRatio } from '@styles/theme/contrast.ts'
import { parseComputedColor } from '../../../../../support/color.ts'
import { unlessWebkit } from '../../../../../support/browserSkips.ts'
import { renderInBrowser } from '../../../../../support/harness.tsx'
import { onRoot, part, parts, style } from '../../../../../support/hookProbes.ts'
import { setForcedColors } from '../../../../../support/media.ts'
import { frames, waitForSettled } from '../../../../../support/settle.ts'

import type { ComponentProps, ReactElement } from 'react'

type Props = Partial<ComponentProps<typeof Calendar>>

const calendar = (props: Props = {}) => <Calendar today="2026-10-28" onSelect={() => undefined} {...props} />

const cell = (iso: string) => document.querySelector<HTMLElement>(`[data-date="${iso}"]`) as HTMLElement

const cells = () => parts('date-picker-calendar-day')

const title = () => part('date-picker-calendar-title').textContent

const focused = () => document.activeElement?.getAttribute('data-date')

const box = (element: Element) => element.getBoundingClientRect()

const transparent = 'rgba(0, 0, 0, 0)'

const number = (iso: string) => cell(iso).querySelector('[data-slot="date-picker-calendar-day-number"]') as HTMLElement

const rtl = (ui: ReactElement) => (
  <div dir="rtl">
    <UIProvider locale={{ ...ptBR, dir: 'rtl' }} motion={{ mode: 'never' }}>
      {ui}
    </UIProvider>
  </div>
)

afterEach(async () => {
  document.documentElement.removeAttribute('style')
  await setForcedColors('none')
  await page.viewport(1280, 800)
})

describe('Calendar in a real browser', () => {
  it('lays out seven columns of one hit target each, with six rows of the same height under the weekdays', () => {
    renderInBrowser(calendar())
    const hit = 40
    const columns = [...document.querySelectorAll('thead th')].map((header) => box(header))

    expect(columns).toHaveLength(7)
    expect(columns.map((column) => Math.round(column.width))).toEqual([hit, hit, hit, hit, hit, hit, hit])
    expect(Math.round(box(part('date-picker-calendar-grid')).width)).toBe(7 * hit)
    expect(cells().every((day) => Math.round(box(day).width) === hit && Math.round(box(day).height) === hit)).toBe(true)
    expect(cells()).toHaveLength(42)
  })

  it('puts the weekday of a column above the days of that column', () => {
    renderInBrowser(calendar())
    const headers = [...document.querySelectorAll('thead th')]

    for (const [index, header] of headers.entries()) for (const day of cells().filter((_, position) => position % 7 === index)) expect(Math.abs(box(day).left - box(header).left)).toBeLessThanOrEqual(0.5)
  })

  it('centers the number of a day in its cell, as a circle of one hit target', () => {
    renderInBrowser(calendar({ value: '2026-10-15' }))
    const circle = box(number('2026-10-15'))
    const day = box(cell('2026-10-15'))

    expect(Math.round(circle.width)).toBe(40)
    expect(Math.round(circle.height)).toBe(40)
    expect(Math.abs(circle.left + circle.width / 2 - (day.left + day.width / 2))).toBeLessThanOrEqual(0.5)
    expect(Math.abs(circle.top + circle.height / 2 - (day.top + day.height / 2))).toBeLessThanOrEqual(0.5)
    expect(style('date-picker-calendar-day-number').borderTopLeftRadius).not.toBe('0px')
  })

  it('follows the hit size of the page: the columns and the rows grow with it', () => {
    onRoot({ '--enchase-hit-size': '48px' })
    renderInBrowser(calendar())

    expect(Math.round(box(part('date-picker-calendar-grid')).width)).toBe(7 * 48)
    expect(Math.round(box(cell('2026-10-15')).height)).toBe(48)
  })

  it('keeps the seven columns in a container that is narrower than the grid', () => {
    renderInBrowser(<div style={{ width: 200, overflow: 'hidden' }}>{calendar()}</div>)

    expect(Math.round(box(part('date-picker-calendar-grid')).width)).toBe(280)
    expect(cells()).toHaveLength(42)
  })

  it('shows the title between the two buttons, centered', () => {
    renderInBrowser(calendar())
    const [previous, next] = parts('date-picker-calendar-nav').map(box)
    const heading = box(part('date-picker-calendar-title'))

    expect(previous.right).toBeLessThanOrEqual(heading.left + 1)
    expect(heading.right).toBeLessThanOrEqual(next.left + 1)
    expect(Math.round(previous.width)).toBe(40)
    expect(Math.abs(previous.top + previous.height / 2 - (heading.top + heading.height / 2))).toBeLessThanOrEqual(1)
  })

  it('moves the real focus with the arrows, across months, and shows a ring on the focused day', async () => {
    renderInBrowser(calendar({ value: '2026-10-30' }))
    cell('2026-10-30').focus()
    await userEvent.keyboard('{ArrowRight}')
    await userEvent.keyboard('{ArrowRight}')

    expect(focused()).toBe('2026-11-01')
    expect(title()).toBe('novembro de 2026')
    expect(document.activeElement).toBe(cell('2026-11-01'))
    expect(document.activeElement?.matches(':focus-visible')).toBe(true)
    expect(getComputedStyle(number('2026-11-01')).outlineStyle).toBe('solid')
    expect(parseFloat(getComputedStyle(number('2026-11-01')).outlineWidth)).toBeGreaterThanOrEqual(2)
    expect(getComputedStyle(number('2026-11-02')).outlineStyle).toBe('none')
  })

  it('goes by weeks, months and years with the keyboard, and picks a day with Enter', async () => {
    let picked = ''

    renderInBrowser(calendar({ value: '2026-10-28', onSelect: (date) => (picked = date) }))
    cell('2026-10-28').focus()

    await userEvent.keyboard('{ArrowDown}')
    expect(focused()).toBe('2026-11-04')
    await userEvent.keyboard('{PageUp}')
    expect(focused()).toBe('2026-10-04')
    await userEvent.keyboard('{Shift>}{PageDown}{/Shift}')
    expect(focused()).toBe('2027-10-04')
    await userEvent.keyboard('{Home}')
    expect(focused()).toBe('2027-10-03')
    await userEvent.keyboard('{End}')
    expect(focused()).toBe('2027-10-09')
    await userEvent.keyboard('{Enter}')

    expect(picked).toBe('2027-10-09')
  })

  it('picks a day with a click and leaves the focus on it', async () => {
    let picked = ''

    renderInBrowser(calendar({ onSelect: (date) => (picked = date) }))
    await userEvent.click(cell('2026-10-15'))

    expect(picked).toBe('2026-10-15')
    expect(document.activeElement).toBe(cell('2026-10-15'))
  })

  it('moves the month with the buttons and keeps the focus on the button that was pressed', async () => {
    renderInBrowser(calendar())
    await userEvent.click(page.getByRole('button', { name: 'Próximo mês' }))

    expect(title()).toBe('novembro de 2026')
    expect(document.activeElement).toBe(page.getByRole('button', { name: 'Próximo mês' }).element())
  })

  it('has one stop in the tab order for the whole grid', async () => {
    renderInBrowser(
      <>
        <button>Antes</button>
        {calendar({ value: '2026-10-15' })}
        <button>Depois</button>
      </>
    )
    page.getByRole('button', { name: 'Antes' }).element().focus()

    await userEvent.tab()
    await userEvent.tab()
    await userEvent.tab()

    expect(document.activeElement).toBe(cell('2026-10-15'))

    await userEvent.tab()

    expect(document.activeElement).toBe(page.getByRole('button', { name: 'Depois' }).element())
  })

  it('takes the focus when it opens if it is told to', async () => {
    renderInBrowser(calendar({ value: '2026-10-15', autoFocus: true }))

    await expect.poll(() => document.activeElement).toBe(cell('2026-10-15'))
  })

  it('starts the week on the first day of the language of the platform, and where firstDayOfWeek says', () => {
    renderInBrowser(
      <>
        {calendar()}
        <UIProvider locale={{ ...en, locale: 'en-GB' }} motion={{ mode: 'never' }}>
          {calendar()}
        </UIProvider>
        {calendar({ firstDayOfWeek: 6 })}
      </>
    )
    const firstDays = [0, 1, 2].map((index) => parts('date-picker-calendar-grid')[index].querySelector('th')?.getAttribute('abbr'))

    expect(firstDays).toEqual(['domingo', 'Monday', 'sábado'])
  })
})

describe('Calendar in a right-to-left page in a real browser', () => {
  it('mirrors the grid: the first weekday on the right, the previous button on the right with its chevron turned around', () => {
    renderInBrowser(rtl(calendar()))
    const [first, last] = [...document.querySelectorAll('thead th')].map(box).filter((_, index) => index === 0 || index === 6)
    const [previous, next] = parts('date-picker-calendar-nav').map(box)

    expect(first.left).toBeGreaterThan(last.left)
    expect(previous.left).toBeGreaterThan(next.left)
    expect(new DOMMatrixReadOnly(getComputedStyle(parts('date-picker-calendar-nav')[0].querySelector('svg') as Element).transform).a).toBe(-1)
  })

  it('follows the screen with the arrows: the right arrow goes to the previous day', async () => {
    renderInBrowser(rtl(calendar({ value: '2026-10-15' })))
    cell('2026-10-15').focus()

    await userEvent.keyboard('{ArrowRight}')
    expect(focused()).toBe('2026-10-14')

    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}')
    expect(focused()).toBe('2026-10-16')
    expect(box(cell('2026-10-16')).left).toBeLessThan(box(cell('2026-10-15')).left)
  })
})

describe('the colors of the Calendar in a real browser', () => {
  it.each(['light', 'dark'] as const)('reads in %s mode: the days, the outside days, the selected day, the weekdays and the title', async (mode) => {
    onRoot({ '--enchase-date-picker-duration': '0s' })
    renderInBrowser(calendar({ value: '2026-10-15', isDateDisabled: (date) => date === '2026-10-20' }), 'never', mode)
    await expect.poll(() => document.documentElement.getAttribute('data-theme')).toBe(mode)
    await frames(3)
    await waitForSettled(() => document.documentElement)
    await expect.poll(() => parseComputedColor(getComputedStyle(document.body).backgroundColor).a).toBe(1)
    const surface = getComputedStyle(document.body).backgroundColor

    expect(contrastRatio(getComputedStyle(number('2026-10-14')).color, surface), 'day').toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(getComputedStyle(number('2026-09-30')).color, surface), 'outside day').toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(getComputedStyle(number('2026-10-15')).color, getComputedStyle(number('2026-10-15')).backgroundColor), 'selected day').toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(getComputedStyle(part('date-picker-calendar-weekday')).color, surface), 'weekday').toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(getComputedStyle(part('date-picker-calendar-title')).color, surface), 'title').toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(getComputedStyle(part('date-picker-calendar-nav')).color, surface), 'button').toBeGreaterThanOrEqual(4.5)
    expect(getComputedStyle(number('2026-10-20')).color).not.toBe(getComputedStyle(number('2026-10-14')).color)
  })

  it('draws today with a border and the selected day filled, and both when they are the same day', () => {
    renderInBrowser(calendar({ value: '2026-10-15' }))

    expect(getComputedStyle(number('2026-10-28')).borderTopColor).not.toBe(transparent)
    expect(getComputedStyle(number('2026-10-28')).backgroundColor).toBe(transparent)
    expect(getComputedStyle(number('2026-10-15')).backgroundColor).not.toBe(transparent)
    expect(getComputedStyle(number('2026-10-14')).borderTopColor).toBe(transparent)
  })

  it('tints the day under the pointer, but not the selected day nor a disabled one', async () => {
    renderInBrowser(calendar({ value: '2026-10-15', isDateDisabled: (date) => date === '2026-10-20' }))

    expect(getComputedStyle(number('2026-10-14')).backgroundColor).toBe(transparent)

    await userEvent.hover(cell('2026-10-14'))
    await expect.poll(() => getComputedStyle(number('2026-10-14')).backgroundColor).not.toBe(transparent)

    const selected = getComputedStyle(number('2026-10-15')).backgroundColor

    await userEvent.hover(cell('2026-10-15'))
    expect(getComputedStyle(number('2026-10-15')).backgroundColor).toBe(selected)

    await userEvent.hover(cell('2026-10-20'))
    expect(getComputedStyle(number('2026-10-20')).backgroundColor).toBe(transparent)
    expect(getComputedStyle(cell('2026-10-20')).cursor).toBe('not-allowed')
  })

  it('tints the nav button under the pointer and dims it when it cannot go on', async () => {
    renderInBrowser(calendar({ min: '2026-10-05' }))
    const next = parts('date-picker-calendar-nav')[1]
    const previous = parts('date-picker-calendar-nav')[0]

    expect(getComputedStyle(next).backgroundColor).toBe(transparent)

    await userEvent.hover(next)
    await expect.poll(() => getComputedStyle(next).backgroundColor).not.toBe(transparent)

    expect(previous).toBeDisabled()
    expect(getComputedStyle(previous).color).not.toBe(getComputedStyle(next).color)
    expect(getComputedStyle(previous).cursor).toBe('not-allowed')
  })

  const forced = unlessWebkit('forcedColors') ? it : it.skip

  forced('keeps the selected day filled in forced colors, and today outlined', async () => {
    renderInBrowser(calendar({ value: '2026-10-15' }))
    await setForcedColors('active')

    await expect.poll(() => getComputedStyle(number('2026-10-15')).backgroundColor).not.toBe(getComputedStyle(number('2026-10-14')).backgroundColor)

    expect(contrastRatio(getComputedStyle(number('2026-10-15')).color, getComputedStyle(number('2026-10-15')).backgroundColor)).toBeGreaterThanOrEqual(4.5)
    expect(getComputedStyle(number('2026-10-28')).borderTopStyle).toBe('solid')
    expect(getComputedStyle(number('2026-10-28')).borderTopColor).not.toBe(transparent)
  })
})

describe('Calendar from its hooks', () => {
  it('takes the room around the calendar and between its header and its grid from their hooks', () => {
    onRoot({ '--enchase-date-picker-calendar-gap': '11px', '--enchase-date-picker-calendar-padding-block': '7px', '--enchase-date-picker-calendar-padding-inline': '9px' })
    renderInBrowser(calendar())
    const root = style('date-picker-calendar')

    expect([root.rowGap, root.paddingTop, root.paddingBottom, root.paddingLeft, root.paddingRight]).toEqual(['11px', '7px', '7px', '9px', '9px'])
  })

  it('takes the look of the title and of the buttons from their hooks', async () => {
    onRoot({
      '--enchase-date-picker-calendar-header-gap': '13px',
      '--enchase-date-picker-calendar-title-font-size': '19px',
      '--enchase-date-picker-calendar-title-font-weight': '650',
      '--enchase-date-picker-calendar-title-color': 'rgb(1, 2, 3)',
      '--enchase-date-picker-calendar-nav-color': 'rgb(4, 5, 6)',
      '--enchase-date-picker-calendar-nav-color-hover': 'rgb(7, 8, 9)',
      '--enchase-date-picker-calendar-nav-radius': '9px'
    })
    renderInBrowser(calendar({ min: '2026-10-05' }))
    const [previous, next] = parts('date-picker-calendar-nav')

    expect(style('date-picker-calendar-header').columnGap).toBe('13px')
    expect([style('date-picker-calendar-title').fontSize, style('date-picker-calendar-title').fontWeight, style('date-picker-calendar-title').color]).toEqual(['19px', '650', 'rgb(1, 2, 3)'])
    expect([getComputedStyle(next).color, getComputedStyle(next).borderTopLeftRadius]).toEqual(['rgb(4, 5, 6)', '9px'])

    await userEvent.hover(next)
    await expect.poll(() => getComputedStyle(next).color).toBe('rgb(7, 8, 9)')

    onRoot({ '--enchase-date-picker-calendar-nav-color-disabled': 'rgb(10, 11, 12)' })
    await expect.poll(() => getComputedStyle(previous).color).toBe('rgb(10, 11, 12)')
  })

  it('takes the look of the weekdays from their hooks', () => {
    onRoot({ '--enchase-date-picker-calendar-weekday-font-size': '12px', '--enchase-date-picker-calendar-weekday-font-weight': '700', '--enchase-date-picker-calendar-weekday-color': 'rgb(1, 2, 3)' })
    renderInBrowser(calendar())

    expect([style('date-picker-calendar-weekday').fontSize, style('date-picker-calendar-weekday').fontWeight, style('date-picker-calendar-weekday').color]).toEqual(['12px', '700', 'rgb(1, 2, 3)'])
  })

  it('takes the type, the corners and the colors of the days from their hooks', () => {
    onRoot({
      '--enchase-date-picker-calendar-day-radius': '7px',
      '--enchase-date-picker-calendar-day-font-size': '15px',
      '--enchase-date-picker-calendar-day-font-weight': '450',
      '--enchase-date-picker-calendar-day-color': 'rgb(1, 2, 3)',
      '--enchase-date-picker-calendar-day-color-outside': 'rgb(4, 5, 6)',
      '--enchase-date-picker-calendar-day-color-disabled': 'rgb(7, 8, 9)',
      '--enchase-date-picker-calendar-day-background-selected': 'rgb(10, 11, 12)',
      '--enchase-date-picker-calendar-day-color-selected': 'rgb(13, 14, 15)',
      '--enchase-date-picker-calendar-day-border-color-today': 'rgb(16, 17, 18)'
    })
    renderInBrowser(calendar({ value: '2026-10-15', isDateDisabled: (date) => date === '2026-10-20' }))
    const plain = getComputedStyle(number('2026-10-14'))

    expect([plain.borderTopLeftRadius, plain.fontSize, plain.fontWeight, plain.color]).toEqual(['7px', '15px', '450', 'rgb(1, 2, 3)'])
    expect(getComputedStyle(number('2026-09-30')).color).toBe('rgb(4, 5, 6)')
    expect(getComputedStyle(number('2026-10-20')).color).toBe('rgb(7, 8, 9)')
    expect([getComputedStyle(number('2026-10-15')).backgroundColor, getComputedStyle(number('2026-10-15')).color]).toEqual(['rgb(10, 11, 12)', 'rgb(13, 14, 15)'])
    expect(getComputedStyle(number('2026-10-28')).borderTopColor).toBe('rgb(16, 17, 18)')
  })

  it('eases the colors of the days and of the buttons for as long as the hooks say', () => {
    onRoot({ '--enchase-date-picker-duration': '0.4s', '--enchase-date-picker-ease': 'linear' })
    renderInBrowser(calendar(), 'auto')
    const durations = (name: string) => style(name).transitionDuration.split(',').map((value) => value.trim())

    expect(durations('date-picker-calendar-day-number')).toEqual(['0.4s', '0.4s'])
    expect(durations('date-picker-calendar-nav')).toEqual(['0.4s', '0.4s'])
    expect(style('date-picker-calendar-day-number').transitionTimingFunction.split(',')[0].trim()).toBe('linear')
  })
})

describe('Calendar kept in the page by an app in a real browser', () => {
  const Harness = () => {
    const [value, setValue] = useState<string | null>('2026-10-15')

    return (
      <>
        <button onClick={() => setValue('2027-03-15')}>Mover</button>
        {calendar({ value, onSelect: setValue })}
        <output>{value}</output>
      </>
    )
  }

  it('shows the month of a value that the app sets, and keeps what the person chose', async () => {
    renderInBrowser(<Harness />)
    await userEvent.click(cell('2026-10-20'))

    expect(document.querySelector('output')?.textContent).toBe('2026-10-20')
    expect(cell('2026-10-20')).toHaveAttribute('aria-selected', 'true')

    await userEvent.click(page.getByRole('button', { name: 'Mover' }))

    expect(title()).toBe('março de 2027')
    expect(cell('2027-03-15')).toHaveAttribute('aria-selected', 'true')
  })
})
