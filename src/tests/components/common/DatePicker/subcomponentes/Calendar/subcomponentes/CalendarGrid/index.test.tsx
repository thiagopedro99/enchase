import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { axe } from '@tests/axe.ts'

import { CalendarGrid } from '@components/common/DatePicker/subcomponentes/Calendar/subcomponentes/CalendarGrid/index.tsx'
import { createDateFormat } from '@utils/dateFormat.ts'
import { formatIsoDate, isSameDate, monthWeeks, parseIsoDate } from '@utils/calendarDate.ts'

import type { ComponentProps } from 'react'
import type { CalendarDate } from '@utils/calendarDate.ts'

type Props = Partial<ComponentProps<typeof CalendarGrid>>

const date = (text: string) => parseIsoDate(text) as CalendarDate

const grid = (props: Props = {}) => (
  <CalendarGrid
    weeks={monthWeeks(date('2026-10-14'), 0)}
    weekdays={[0, 1, 2, 3, 4, 5, 6]}
    focused={date('2026-10-14')}
    today={date('2026-10-28')}
    format={createDateFormat('pt-BR')}
    labelledBy="title"
    gridRef={createRef()}
    isSelected={() => false}
    isDisabled={() => false}
    onChoose={vi.fn()}
    onKeyDown={vi.fn()}
    {...props}
  />
)

const render = (props: Props = {}) => renderWithProviders(grid(props))

const cell = (iso: string) => document.querySelector(`[data-date="${iso}"]`) as HTMLElement

describe('CalendarGrid', () => {
  it('is a grid that takes its name from the element it is told', () => {
    renderWithProviders(
      <>
        <span id="title">outubro de 2026</span>
        {grid()}
      </>
    )

    expect(screen.getByRole('grid', { name: 'outubro de 2026' })).toBeInTheDocument()
  })

  it('has a header for each weekday it is given, in that order, with the short name and the whole name', () => {
    render({ weekdays: [1, 2, 3, 4, 5, 6, 0] })

    expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual(['S', 'T', 'Q', 'Q', 'S', 'S', 'D'])
    expect(screen.getAllByRole('columnheader').map((header) => header.getAttribute('abbr'))[0]).toBe('segunda-feira')
    expect(screen.getAllByRole('columnheader').every((header) => header.getAttribute('scope') === 'col')).toBe(true)
  })

  it('has a day for every date of the weeks it is given, in rows of seven, each with the number and the whole date', () => {
    render()

    expect(screen.getAllByRole('gridcell')).toHaveLength(42)
    expect(document.querySelectorAll('[data-slot="date-picker-calendar-week"]')).toHaveLength(6)
    expect(cell('2026-10-28').textContent).toBe('28')
    expect(cell('2026-10-28')).toHaveAttribute('aria-label', 'quarta-feira, 28 de outubro de 2026')
    expect([...document.querySelector('[data-slot="date-picker-calendar-week"]')!.children]).toHaveLength(7)
  })

  it('lays out as many weeks as it is given', () => {
    render({ weeks: monthWeeks(date('2026-02-10'), 0, 4) })

    expect(screen.getAllByRole('gridcell')).toHaveLength(28)
  })

  it('puts the day that is in focus in the tab order, and no other', () => {
    render({ focused: date('2026-10-20') })

    expect(screen.getAllByRole('gridcell').filter((day) => day.tabIndex === 0)).toEqual([cell('2026-10-20')])
  })

  it('marks the days that are selected, with true or false on each', () => {
    render({ isSelected: (day) => isSameDate(day, date('2026-10-15')) })

    expect(cell('2026-10-15')).toHaveAttribute('aria-selected', 'true')
    expect(cell('2026-10-16')).toHaveAttribute('aria-selected', 'false')
  })

  it('marks the day that is today with aria-current, and only that one', () => {
    render({ today: date('2026-10-20') })

    expect(screen.getAllByRole('gridcell').filter((day) => day.getAttribute('aria-current') === 'date')).toEqual([cell('2026-10-20')])
  })

  it('marks the days that are disabled and only sets aria-disabled for them', () => {
    render({ isDisabled: (day) => day.day === 3 })

    expect(cell('2026-10-03')).toHaveAttribute('aria-disabled', 'true')
    expect(cell('2026-10-04')).not.toHaveAttribute('aria-disabled')
  })

  it('marks the days of the other months than the one in focus', () => {
    render()

    expect(cell('2026-09-30')).toHaveAttribute('data-outside')
    expect(cell('2026-11-02')).toHaveAttribute('data-outside')
    expect(cell('2026-10-14')).not.toHaveAttribute('data-outside')
  })

  it('hands the date of the day that was clicked, and the key that was pressed, to its handlers', async () => {
    const user = userEvent.setup()
    const onChoose = vi.fn()
    const onKeyDown = vi.fn()

    render({ onChoose, onKeyDown })
    await user.click(cell('2026-10-09'))
    fireEvent.keyDown(cell('2026-10-14'), { key: 'ArrowRight' })

    expect(onChoose).toHaveBeenCalledTimes(1)
    expect(formatIsoDate(onChoose.mock.calls[0][0])).toBe('2026-10-09')
    expect(onKeyDown).toHaveBeenCalledTimes(1)
    expect(onKeyDown.mock.calls[0][0].key).toBe('ArrowRight')
  })

  it('gives the table to the ref it is given', () => {
    const gridRef = createRef<HTMLTableElement>()

    render({ gridRef })

    expect(gridRef.current).toBe(screen.getByRole('grid'))
  })

  it('has no accessibility violations', async () => {
    const { container } = render({ isSelected: (day) => day.day === 15, isDisabled: (day) => day.day === 3 })

    expect(await axe(container)).toHaveNoViolations()
  })
})
