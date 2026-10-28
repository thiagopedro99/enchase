import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { DatePickerCalendar } from '@components/common/DatePicker/subcomponentes/DatePickerCalendar/index.tsx'
import { Popover } from '@components/common/Popover/index.tsx'
import UIProvider from '@components/uiProvider/index.tsx'
import { ptBR } from '@locales/ptBR.ts'

import type { ReactElement } from 'react'

const wrap = (node: ReactElement) => <UIProvider locale={ptBR}>{node}</UIProvider>

const day = (date: string) => document.querySelector(`[data-date="${date}"]`) as HTMLElement

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 9, 28, 12))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('DatePickerCalendar', () => {
  it('shows the month of the value, with today marked from the clock', () => {
    renderWithProviders(<DatePickerCalendar value="2026-10-15" autoFocus={false} onSelect={vi.fn()} />)

    expect(screen.getByText('outubro de 2026')).toBeInTheDocument()
    expect(day('2026-10-15')).toHaveAttribute('aria-selected', 'true')
    expect(day('2026-10-28')).toHaveAttribute('aria-current', 'date')
  })

  it('shows the month of today when there is no value', () => {
    renderWithProviders(<DatePickerCalendar value={null} autoFocus={false} onSelect={vi.fn()} />)

    expect(screen.getByText('outubro de 2026')).toBeInTheDocument()
    expect(document.querySelector('[aria-selected="true"]')).toBeNull()
  })

  it('reads the clock once, when it appears, and not on every render', () => {
    const view = render(wrap(<DatePickerCalendar value={null} autoFocus={false} onSelect={vi.fn()} />))

    vi.setSystemTime(new Date(2026, 10, 3, 12))

    view.rerender(wrap(<DatePickerCalendar value={null} autoFocus={false} onSelect={vi.fn()} />))

    expect(day('2026-10-28')).toHaveAttribute('aria-current', 'date')
    expect(document.querySelector('[data-date="2026-11-03"]')?.getAttribute('aria-current')).toBeNull()
  })

  it('moves the focus to the day only when it is told to', () => {
    const { unmount } = renderWithProviders(<DatePickerCalendar value="2026-10-15" autoFocus onSelect={vi.fn()} />)

    expect(day('2026-10-15')).toHaveFocus()
    unmount()
    renderWithProviders(<DatePickerCalendar value="2026-10-15" autoFocus={false} onSelect={vi.fn()} />)

    expect(day('2026-10-15')).not.toHaveFocus()
  })

  it('passes the limits, the disabled dates and the first day of the week to the calendar', () => {
    renderWithProviders(<DatePickerCalendar value="2026-10-15" min="2026-10-05" max="2026-10-25" isDateDisabled={(date) => date === '2026-10-20'} firstDayOfWeek={1} autoFocus={false} onSelect={vi.fn()} />)

    for (const date of ['2026-10-04', '2026-10-20', '2026-10-26']) expect(day(date), date).toHaveAttribute('aria-disabled', 'true')

    expect(screen.getAllByRole('columnheader')[0]).toHaveAttribute('abbr', 'segunda-feira')
  })

  it('reports the day that is chosen, outside of a popover', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    renderWithProviders(<DatePickerCalendar value="2026-10-15" autoFocus={false} onSelect={onSelect} />)

    await user.click(day('2026-10-22'))

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith('2026-10-22')
  })

  it('closes the popover it is in after the day is reported, and gives the focus back to its trigger', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const onOpenChange = vi.fn()
    renderWithProviders(
      <Popover open onOpenChange={onOpenChange} content={<DatePickerCalendar value="2026-10-15" autoFocus={false} onSelect={onSelect} />}>
        <button>Abrir</button>
      </Popover>
    )
    const dialog = await screen.findByRole('dialog')

    await user.click(within(dialog).getByRole('gridcell', { name: /22 de outubro/ }))

    expect(onSelect).toHaveBeenCalledWith('2026-10-22')
    expect(onOpenChange).toHaveBeenCalledWith(false)
    await waitFor(() => expect(screen.getByRole('button', { name: 'Abrir' })).toHaveFocus())
  })

  it('does not report or close for a day that is not available', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const onOpenChange = vi.fn()
    renderWithProviders(
      <Popover open onOpenChange={onOpenChange} content={<DatePickerCalendar value="2026-10-15" max="2026-10-20" autoFocus={false} onSelect={onSelect} />}>
        <button>Abrir</button>
      </Popover>
    )
    await screen.findByRole('dialog')
    await user.click(day('2026-10-22'))

    expect(onSelect).not.toHaveBeenCalled()
    expect(onOpenChange).not.toHaveBeenCalled()
  })
})
