import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from '@tests/axe.ts'

import { DatePickerToggle } from '@components/common/DatePicker/subcomponentes/DatePickerToggle/index.tsx'
import { en } from '@locales/en.ts'

describe('DatePickerToggle', () => {
  it('is a button that does not submit, named from the labels, with the calendar icon', () => {
    renderWithProviders(<DatePickerToggle />)

    const button = screen.getByRole('button', { name: 'Abrir calendário' })

    expect(button).toHaveAttribute('type', 'button')
    expect(button).toHaveAttribute('data-slot', 'date-picker-toggle')
    expect(button.querySelector('svg')).toHaveAttribute('data-icon', 'calendar')
    expect(button.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('takes its name from the language of the provider and from custom labels', () => {
    const { unmount } = renderWithProviders(<DatePickerToggle />, { locale: en })

    expect(screen.getByRole('button', { name: 'Open calendar' })).toBeInTheDocument()
    unmount()

    renderWithProviders(<DatePickerToggle />, { labels: { openCalendar: 'Calendário' } })

    expect(screen.getByRole('button', { name: 'Calendário' })).toBeInTheDocument()
  })

  it('passes the attributes and the handlers that the popover gives to its trigger', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    renderWithProviders(<DatePickerToggle aria-expanded aria-haspopup="dialog" aria-controls="popup" onClick={onClick} />)

    const button = screen.getByRole('button')

    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(button).toHaveAttribute('aria-haspopup', 'dialog')
    expect(button).toHaveAttribute('aria-controls', 'popup')
    await user.click(button)

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('keeps its slot when the caller passes one, and cannot be turned into another kind of button', () => {
    renderWithProviders(<DatePickerToggle {...({ 'data-slot': 'other', type: 'submit' } as object)} />)

    expect(screen.getByRole('button')).toHaveAttribute('data-slot', 'date-picker-toggle')
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  })

  it('is disabled with the field', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    renderWithProviders(<DatePickerToggle disabled onClick={onClick} />)

    expect(screen.getByRole('button')).toBeDisabled()
    await user.click(screen.getByRole('button'))

    expect(onClick).not.toHaveBeenCalled()
  })

  it('has no axe violations', async () => {
    const { container } = renderWithProviders(<DatePickerToggle />)

    expect(await axe(container)).toHaveNoViolations()
  })
})
