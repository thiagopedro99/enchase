import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { axe } from '@tests/axe.ts'

import { CalendarHeader } from '@components/common/DatePicker/subcomponentes/Calendar/subcomponentes/CalendarHeader/index.tsx'

import type { ComponentProps } from 'react'

type Props = Partial<ComponentProps<typeof CalendarHeader>>

const header = (props: Props = {}) => (
  <CalendarHeader title="outubro de 2026" titleId="title" previousLabel="Mês anterior" nextLabel="Próximo mês" canGoPrevious canGoNext onPrevious={vi.fn()} onNext={vi.fn()} {...props} />
)

const render = (props: Props = {}) => renderWithProviders(header(props))

const title = () => document.querySelector('[data-slot="date-picker-calendar-title"]') as HTMLElement

describe('CalendarHeader', () => {
  it('shows the title with the id it is given, announced when it changes', () => {
    render()

    expect(title()).toHaveTextContent('outubro de 2026')
    expect(title()).toHaveAttribute('id', 'title')
    expect(title()).toHaveAttribute('aria-live', 'polite')
    expect(title()).toHaveAttribute('aria-atomic', 'true')
  })

  it('has a button for the previous month and one for the next, named by the labels it is given, and neither submits a form', () => {
    render({ previousLabel: 'Back', nextLabel: 'Forward' })

    expect(screen.getByRole('button', { name: 'Back' })).toHaveAttribute('type', 'button')
    expect(screen.getByRole('button', { name: 'Forward' })).toHaveAttribute('type', 'button')
  })

  it('puts the previous button before the title and the next button after it, so that a right-to-left page can mirror them', () => {
    render()
    const parts = [...document.querySelector('[data-slot="date-picker-calendar-header"]')!.children].map((part) => part.getAttribute('data-slot'))

    expect(parts).toEqual(['date-picker-calendar-nav', 'date-picker-calendar-title', 'date-picker-calendar-nav'])
    expect(screen.getAllByRole('button').map((button) => button.getAttribute('aria-label'))).toEqual(['Mês anterior', 'Próximo mês'])
  })

  it('calls the handler of the button that was pressed, once', async () => {
    const user = userEvent.setup()
    const onPrevious = vi.fn()
    const onNext = vi.fn()

    render({ onPrevious, onNext })
    await user.click(screen.getByRole('button', { name: 'Próximo mês' }))
    await user.click(screen.getByRole('button', { name: 'Próximo mês' }))
    await user.click(screen.getByRole('button', { name: 'Mês anterior' }))

    expect(onNext).toHaveBeenCalledTimes(2)
    expect(onPrevious).toHaveBeenCalledTimes(1)
  })

  it('disables each button on its own and does not call a handler of a disabled one', async () => {
    const user = userEvent.setup()
    const onPrevious = vi.fn()
    const onNext = vi.fn()

    render({ canGoPrevious: false, onPrevious, onNext })
    await user.click(screen.getByRole('button', { name: 'Mês anterior' }))

    expect(screen.getByRole('button', { name: 'Mês anterior' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Próximo mês' })).toBeEnabled()
    expect(onPrevious).not.toHaveBeenCalled()
  })

  it('disables the next button when there is no next month', () => {
    render({ canGoNext: false })

    expect(screen.getByRole('button', { name: 'Próximo mês' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Mês anterior' })).toBeEnabled()
  })

  it('draws a directional chevron in each button, hidden from assistive technology', () => {
    render()
    const [previous, next] = screen.getAllByRole('button')

    expect(previous.querySelector('svg')).toHaveAttribute('data-icon', 'chevron-left')
    expect(next.querySelector('svg')).toHaveAttribute('data-icon', 'chevron-right')
    expect(previous.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('has no accessibility violations', async () => {
    const { container } = render()

    expect(await axe(container)).toHaveNoViolations()
  })
})
