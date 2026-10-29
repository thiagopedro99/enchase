import { describeLabelPlacementContract } from '@tests/shared/contracts/labelPlacementContract.tsx'
import { describePortalContainerContract } from '@tests/shared/contracts/portalContainerContract.tsx'
import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import userEvent from '@testing-library/user-event'
import { screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderToString } from 'react-dom/server'
import { createRef, useState } from 'react'
import { render } from '@testing-library/react'
import { axe } from '@tests/axe.ts'

import { DatePicker } from '@components/common/DatePicker/index.tsx'
import UIProvider from '@components/uiProvider/index.tsx'
import { Modal } from '@components/common/Modal/index.tsx'
import { ptBR } from '@locales/ptBR.ts'
import { en } from '@locales/en.ts'

import type { ReactElement } from 'react'

const field = () => screen.getByRole('textbox') as HTMLInputElement

const toggle = () => screen.getByRole('button', { name: 'Abrir calendário' })

const dialog = () => screen.getByRole('dialog', { name: 'Escolher data' })

const day = (name: string | RegExp) => within(dialog()).getByRole('gridcell', { name })

const dayOf = (date: string) => dialog().querySelector(`[data-date="${date}"]`) as HTMLElement

const closed = () => waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

const wholePage = () => axe(document.body, { rules: { region: { enabled: false } } })

const wrap = (node: ReactElement, locale = ptBR) => <UIProvider locale={locale}>{node}</UIProvider>

const hiddenValues = (name: string) => [...document.querySelectorAll<HTMLInputElement>(`input[type="hidden"][name="${name}"]`)].map((input) => input.value)

const stubScrollIntoView = () => {
  const scrollIntoView = vi.fn()
  Element.prototype.scrollIntoView = scrollIntoView

  return scrollIntoView
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 9, 28, 12))
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  Reflect.deleteProperty(Element.prototype, 'scrollIntoView')
})

describeLabelPlacementContract({
  name: 'DatePicker',
  slot: 'date-picker',
  control: '[data-slot="date-picker-input"]',
  placeholder: 'dd/mm/aaaa',
  render: (placement) => <DatePicker label="Name" placeholder="dd/mm/aaaa" labelPlacement={placement} />
})

describePortalContainerContract({
  name: 'DatePicker',
  slot: 'popover-content',
  render: (container) => <DatePicker label="Date" open container={container} onOpenChange={vi.fn()} />
})

describe('DatePicker', () => {
  it('is a text field named by its label, with a button that opens the calendar and no calendar in the page', () => {
    renderWithProviders(<DatePicker label="Data" />)

    expect(screen.getByRole('textbox', { name: 'Data' })).toBe(field())
    expect(field()).toHaveAttribute('type', 'text')
    expect(field()).toHaveAttribute('autocomplete', 'off')
    expect(field()).not.toHaveAttribute('role')
    expect(toggle()).toHaveAttribute('type', 'button')
    expect(toggle()).toHaveAttribute('aria-haspopup', 'dialog')
    expect(toggle()).toHaveAttribute('aria-expanded', 'false')
    expect(toggle()).not.toHaveAttribute('aria-controls')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('keeps a space as the placeholder under a floating label, so the label can rise, and the placeholder of the user otherwise', () => {
    const { unmount } = renderWithProviders(<DatePicker label="Data" />)

    expect(field()).toHaveAttribute('placeholder', ' ')
    unmount()

    const { unmount: second } = renderWithProviders(<DatePicker label="Data" placeholder="dd/mm/aaaa" labelPlacement="stacked" />)

    expect(field()).toHaveAttribute('placeholder', 'dd/mm/aaaa')
    second()
    renderWithProviders(<DatePicker aria-label="Data" />)

    expect(field()).not.toHaveAttribute('placeholder')
  })

  it('names the button and the calendar from the labels of the language, and from custom labels', async () => {
    const { unmount } = renderWithProviders(<DatePicker label="Date" />, { locale: en })

    expect(screen.getByRole('button', { name: 'Open calendar' })).toBeInTheDocument()
    await userEvent.setup().click(screen.getByRole('button', { name: 'Open calendar' }))
    expect(await screen.findByRole('dialog', { name: 'Choose date' })).toBeInTheDocument()
    unmount()

    renderWithProviders(<DatePicker label="Data" />, { labels: { openCalendar: 'Escolher no calendário', chooseDate: 'Calendário' } })
    await userEvent.setup().click(screen.getByRole('button', { name: 'Escolher no calendário' }))

    expect(await screen.findByRole('dialog', { name: 'Calendário' })).toBeInTheDocument()
  })

  it('falls back to the English labels for a language that does not have them', () => {
    const { openCalendar, chooseDate, ...messages } = en.messages

    void openCalendar
    void chooseDate
    renderWithProviders(<DatePicker label="Data" />, { locale: { ...en, messages } })

    expect(screen.getByRole('button', { name: 'Open calendar' })).toBeInTheDocument()
  })

  it('marks the parts with slots and lets the classes and styles of the user win', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DatePicker label="Data" className="on-input" style={{ color: 'red' }} wrapperClassName="on-root" wrapperStyle={{ margin: 3 }} popupClassName="on-popup" popupStyle={{ opacity: 0.9 }} error="Erro" />)

    const root = document.querySelector('[data-slot="date-picker"]') as HTMLElement

    expect(root).toHaveClass('on-root')
    expect(root).toHaveStyle({ margin: '3px' })
    expect(field()).toHaveAttribute('data-slot', 'date-picker-input')
    expect(field()).toHaveClass('on-input')
    expect(field().style.color).toBe('red')
    expect(toggle()).toHaveAttribute('data-slot', 'date-picker-toggle')

    for (const part of ['control', 'label', 'outline', 'error']) expect(root.querySelector(`[data-slot="date-picker-${part}"]`), part).not.toBeNull()

    await user.click(toggle())
    const popup = await screen.findByRole('dialog')

    expect(popup).toHaveClass('on-popup')
    expect(popup).toHaveStyle({ opacity: '0.9' })
    expect(popup).toHaveAttribute('data-slot', 'popover-content')
  })

  it('gives the ref and the id to the input, and keeps the attributes of the input', () => {
    const ref = createRef<HTMLInputElement>()
    renderWithProviders(<DatePicker ref={ref} id="birthday" label="Data" required aria-label="Nascimento" data-testid="field" />)

    expect(ref.current).toBe(field())
    expect(field()).toHaveAttribute('id', 'birthday')
    expect(field()).toBeRequired()
    expect(field()).toHaveAttribute('data-testid', 'field')
    expect(screen.getByText('Data', { selector: 'label' })).toHaveAttribute('for', 'birthday')
  })

  it('sends the date in a hidden input with the name, as the ISO text, and nothing without a name', () => {
    const { unmount } = renderWithProviders(<DatePicker label="Data" name="birthday" form="signup" defaultValue="2026-10-28" />)

    expect(hiddenValues('birthday')).toEqual(['2026-10-28'])
    expect(document.querySelector('input[type="hidden"]')).toHaveAttribute('form', 'signup')
    expect(field()).not.toHaveAttribute('name')
    unmount()

    renderWithProviders(<DatePicker label="Data" />)

    expect(document.querySelector('input[type="hidden"]')).toBeNull()
  })

  it('sends an empty text for no date, and disables the hidden input with the field', () => {
    const { unmount } = renderWithProviders(<DatePicker label="Data" name="birthday" />)

    expect(hiddenValues('birthday')).toEqual([''])
    unmount()

    renderWithProviders(<DatePicker label="Data" name="birthday" defaultValue="2026-10-28" disabled />)

    expect(document.querySelector('input[type="hidden"]')).toBeDisabled()
  })

  it('ties the helper text to the field, and the error, which replaces it, as an alert', () => {
    const view = render(wrap(<DatePicker label="Data" helperText="Use o formato do seu país" />))

    expect(field()).toHaveAccessibleDescription('Use o formato do seu país')
    expect(field()).not.toHaveAttribute('aria-invalid')

    view.rerender(wrap(<DatePicker label="Data" helperText="Use o formato do seu país" error="Escolha uma data" />))

    expect(screen.getByRole('alert')).toHaveTextContent('Escolha uma data')
    expect(field()).toHaveAttribute('aria-invalid', 'true')
    expect(field()).toHaveAccessibleDescription('Escolha uma data')
    expect(screen.queryByText('Use o formato do seu país')).not.toBeInTheDocument()
  })

  it('keeps the description the user gave and adds its own after it', () => {
    renderWithProviders(<DatePicker label="Data" aria-describedby="outside" helperText="Apoio" />)

    expect(field().getAttribute('aria-describedby')).toMatch(/^outside .+-helper$/)
  })

  it('has no axe violations closed and open', async () => {
    renderWithProviders(<DatePicker label="Data" defaultValue="2026-10-28" helperText="Apoio" />)

    expect(await wholePage()).toHaveNoViolations()

    await userEvent.setup().click(toggle())
    await screen.findByRole('dialog')

    expect(await wholePage()).toHaveNoViolations()
  })

  it('has no axe violations with an error and stacked', async () => {
    renderWithProviders(<DatePicker label="Data" error="Escolha uma data" labelPlacement="stacked" disabled />)

    expect(await wholePage()).toHaveNoViolations()
  })
})

describe('DatePicker value and text', () => {
  it('shows the default value the way the language writes a date', () => {
    const { unmount } = renderWithProviders(<DatePicker label="Data" defaultValue="2026-10-28" />)

    expect(field()).toHaveValue('28/10/2026')
    unmount()

    for (const [locale, text] of [
      ['en', '10/28/2026'],
      ['de', '28.10.2026'],
      ['ja', '2026/10/28'],
      ['en-GB', '28/10/2026']
    ] as const) {
      const view = renderWithProviders(<DatePicker label="Date" defaultValue="2026-10-28" />, { locale: { ...en, locale } })

      expect(field(), locale).toHaveValue(text)
      view.unmount()
    }
  })

  it('is empty without a value, and for a value that is not a date', () => {
    const { unmount } = renderWithProviders(<DatePicker label="Data" />)

    expect(field()).toHaveValue('')
    unmount()

    for (const value of ['', 'hoje', '2026-02-30', '28/10/2026']) {
      const view = renderWithProviders(<DatePicker label="Data" defaultValue={value} name="when" />)

      expect(field(), value).toHaveValue('')
      expect(hiddenValues('when'), value).toEqual([''])
      view.unmount()
    }
  })

  it('follows the value when the app controls it, and is empty for null', () => {
    const view = render(wrap(<DatePicker label="Data" value="2026-10-28" onValueChange={() => undefined} />))
    const again = (value: string | null) => view.rerender(wrap(<DatePicker label="Data" value={value} onValueChange={() => undefined} />))

    expect(field()).toHaveValue('28/10/2026')
    again('2027-01-02')
    expect(field()).toHaveValue('02/01/2027')
    again(null)
    expect(field()).toHaveValue('')
  })

  it('writes the typed date again the way the language does once it is committed', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DatePicker label="Data" />)

    await user.type(field(), '1/2/2027')

    expect(field()).toHaveValue('1/2/2027')
    await user.tab()

    expect(field()).toHaveValue('01/02/2027')
  })

  it('commits the typed date on blur, as an ISO text', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderWithProviders(<DatePicker label="Data" onValueChange={onValueChange} name="when" />)

    await user.type(field(), '28/10/2026')

    expect(onValueChange).not.toHaveBeenCalled()
    await user.tab()

    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(onValueChange).toHaveBeenCalledWith('2026-10-28')
    expect(hiddenValues('when')).toEqual(['2026-10-28'])
  })

  it('reads the typed date in the order of the language', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    for (const [locale, typed] of [
      ['en', '10/28/2026'],
      ['de', '28.10.2026'],
      ['ja', '2026/10/28'],
      ['pt-BR', '28-10-2026']
    ] as const) {
      onValueChange.mockClear()

      const view = renderWithProviders(<DatePicker label="Data" onValueChange={onValueChange} />, { locale: { ...en, locale } })

      await user.type(field(), typed)
      await user.tab()

      expect(onValueChange, locale).toHaveBeenCalledWith('2026-10-28')
      view.unmount()
    }
  })

  it('reads a date typed as eight digits, and a date that starts with the year as ISO writes it', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderWithProviders(<DatePicker label="Data" onValueChange={onValueChange} />)

    await user.type(field(), '28102026')
    await user.tab()
    expect(onValueChange).toHaveBeenLastCalledWith('2026-10-28')
    await user.clear(field())
    await user.type(field(), '2027-01-02')
    await user.tab()

    expect(onValueChange).toHaveBeenLastCalledWith('2027-01-02')
    expect(field()).toHaveValue('02/01/2027')
  })

  it('commits with Enter and keeps the focus in the field', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderWithProviders(<DatePicker label="Data" onValueChange={onValueChange} />)

    await user.type(field(), '28/10/2026{Enter}')

    expect(onValueChange).toHaveBeenCalledWith('2026-10-28')
    expect(field()).toHaveFocus()
    expect(field()).toHaveValue('28/10/2026')
  })

  it('puts the typed text back for a text that is not a date, and does not report it', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderWithProviders(<DatePicker label="Data" defaultValue="2026-10-28" onValueChange={onValueChange} />)

    for (const typed of ['amanhã', '31/02/2026', '28/10/26', '28/10', '99/99/9999']) {
      await user.clear(field())
      await user.type(field(), typed)
      await user.tab()

      expect(field(), typed).toHaveValue('28/10/2026')
    }

    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('clears the date when the text is emptied, and reports null', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderWithProviders(<DatePicker label="Data" defaultValue="2026-10-28" onValueChange={onValueChange} name="when" />)

    await user.clear(field())
    await user.tab()

    expect(onValueChange).toHaveBeenCalledWith(null)
    expect(field()).toHaveValue('')
    expect(hiddenValues('when')).toEqual([''])
    await user.type(field(), '   ')
    await user.tab()

    expect(onValueChange).toHaveBeenCalledTimes(1)
  })

  it('refuses a typed date that is out of min and max, or that the app disabled, and puts the old one back', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderWithProviders(<DatePicker label="Data" defaultValue="2026-10-15" min="2026-10-05" max="2026-10-25" isDateDisabled={(date) => date === '2026-10-20'} onValueChange={onValueChange} />)

    for (const typed of ['04/10/2026', '26/10/2026', '20/10/2026']) {
      await user.clear(field())
      await user.type(field(), typed)
      await user.tab()

      expect(field(), typed).toHaveValue('15/10/2026')
    }

    expect(onValueChange).not.toHaveBeenCalled()

    for (const typed of ['05/10/2026', '25/10/2026']) {
      await user.clear(field())
      await user.type(field(), typed)
      await user.tab()

      expect(field(), typed).toHaveValue(typed)
    }

    expect(onValueChange).toHaveBeenCalledTimes(2)
  })

  it('treats a text of only spaces as an empty one, and clears the date', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderWithProviders(<DatePicker label="Data" defaultValue="2026-10-28" onValueChange={onValueChange} />)

    await user.clear(field())
    await user.type(field(), '   ')
    await user.tab()

    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(onValueChange).toHaveBeenCalledWith(null)
    expect(field()).toHaveValue('')
  })

  it('reports nothing when the field is left without being touched, even if the value is not a date', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderWithProviders(<DatePicker label="Data" defaultValue="hoje" onValueChange={onValueChange} />)

    await user.click(field())
    await user.tab()

    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('does not report the date that is already the value, and writes it again', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderWithProviders(<DatePicker label="Data" defaultValue="2026-10-28" onValueChange={onValueChange} />)

    await user.clear(field())
    await user.type(field(), '28102026')
    await user.tab()

    expect(onValueChange).not.toHaveBeenCalled()
    expect(field()).toHaveValue('28/10/2026')
  })

  it('shows what the app holds when it does not accept the new date', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderWithProviders(<DatePicker label="Data" value="2026-10-28" onValueChange={onValueChange} />)

    await user.clear(field())
    await user.type(field(), '29/10/2026')
    await user.tab()

    expect(onValueChange).toHaveBeenCalledWith('2026-10-29')
    expect(field()).toHaveValue('28/10/2026')
  })

  it('writes the date again when the language of the provider changes', () => {
    const view = render(wrap(<DatePicker label="Data" defaultValue="2026-10-28" />))

    expect(field()).toHaveValue('28/10/2026')

    view.rerender(wrap(<DatePicker label="Data" defaultValue="2026-10-28" />, en))

    expect(field()).toHaveValue('10/28/2026')
  })

  it('keeps what the user is typing while the app re-renders with the same value', async () => {
    const user = userEvent.setup()

    const Harness = () => {
      const [value, setValue] = useState<string | null>('2026-10-28')

      return (
        <>
          <DatePicker label="Data" value={value} onValueChange={setValue} />
          <output>{value ?? 'none'}</output>
        </>
      )
    }

    renderWithProviders(<Harness />)
    await user.clear(field())
    await user.type(field(), '1/1')

    expect(field()).toHaveValue('1/1')
    await user.type(field(), '/2027')
    await user.tab()

    expect(screen.getByRole('status', { hidden: true }).textContent).toBe('2027-01-01')
  })
})

describe('DatePicker calendar', () => {
  it('opens a dialog with the calendar from the button, and links the two', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    renderWithProviders(<DatePicker label="Data" onOpenChange={onOpenChange} />)

    await user.click(toggle())

    expect(dialog()).toBeInTheDocument()
    expect(within(dialog()).getByRole('grid')).toBeInTheDocument()
    expect(toggle()).toHaveAttribute('aria-expanded', 'true')
    expect(toggle()).toHaveAttribute('aria-controls', dialog().id)
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it('closes from the button when it is open', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DatePicker label="Data" />)

    await user.click(toggle())
    await screen.findByRole('dialog')
    await user.click(toggle())
    await closed()

    expect(toggle()).toHaveAttribute('aria-expanded', 'false')
  })

  it('opens on the month of the date and puts the focus on that day', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DatePicker label="Data" defaultValue="2027-03-09" />)

    await user.click(toggle())
    await screen.findByRole('dialog')

    expect(within(dialog()).getByText('março de 2027')).toBeInTheDocument()
    expect(dayOf('2027-03-09')).toHaveFocus()
    expect(dayOf('2027-03-09')).toHaveAttribute('aria-selected', 'true')
  })

  it('opens on today, with the focus on it, when there is no date', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DatePicker label="Data" />)

    await user.click(toggle())
    await screen.findByRole('dialog')

    expect(within(dialog()).getByText('outubro de 2026')).toBeInTheDocument()
    expect(dayOf('2026-10-28')).toHaveFocus()
    expect(dayOf('2026-10-28')).toHaveAttribute('aria-current', 'date')
  })

  it('puts the focus on the day, and not on the button of the previous month, when it opens from the keyboard', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DatePicker label="Data" defaultValue="2026-10-15" />)

    toggle().focus()
    await user.keyboard('{Enter}')
    await screen.findByRole('dialog')

    expect(dayOf('2026-10-15')).toHaveFocus()
    expect(within(dialog()).getByRole('button', { name: 'Mês anterior' })).not.toHaveFocus()
  })

  it('opens from the keyboard with Space as well', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DatePicker label="Data" defaultValue="2026-10-15" />)

    toggle().focus()
    await user.keyboard(' ')
    await screen.findByRole('dialog')

    expect(dayOf('2026-10-15')).toHaveFocus()
  })

  it('chooses a day: reports it, writes it, closes and gives the focus back to the button', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderWithProviders(<DatePicker label="Data" defaultValue="2026-10-15" onValueChange={onValueChange} name="when" />)

    await user.click(toggle())
    await screen.findByRole('dialog')
    await user.click(day(/22 de outubro/))
    await closed()

    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(onValueChange).toHaveBeenCalledWith('2026-10-22')
    expect(field()).toHaveValue('22/10/2026')
    expect(hiddenValues('when')).toEqual(['2026-10-22'])
    expect(toggle()).toHaveFocus()
  })

  it('chooses a day from another month with the keyboard', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderWithProviders(<DatePicker label="Data" defaultValue="2026-10-31" onValueChange={onValueChange} />)

    toggle().focus()
    await user.keyboard('{Enter}')
    await screen.findByRole('dialog')
    await user.keyboard('{ArrowRight}{Enter}')
    await closed()

    expect(onValueChange).toHaveBeenCalledWith('2026-11-01')
    expect(field()).toHaveValue('01/11/2026')
  })

  it('chooses the day that is already the value without reporting it', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderWithProviders(<DatePicker label="Data" defaultValue="2026-10-15" onValueChange={onValueChange} />)

    await user.click(toggle())
    await screen.findByRole('dialog')
    await user.click(day(/15 de outubro/))
    await closed()

    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('passes min, max, the disabled dates and the first day of the week to the calendar', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderWithProviders(<DatePicker label="Data" defaultValue="2026-10-15" min="2026-10-05" max="2026-10-25" isDateDisabled={(date) => date === '2026-10-20'} firstDayOfWeek={1} onValueChange={onValueChange} />)

    await user.click(toggle())
    await screen.findByRole('dialog')

    for (const date of ['2026-10-04', '2026-10-20', '2026-10-26']) expect(dayOf(date), date).toHaveAttribute('aria-disabled', 'true')

    expect(dayOf('2026-10-19')).not.toHaveAttribute('aria-disabled')
    expect(within(dialog()).getAllByRole('columnheader')[0]).toHaveAttribute('abbr', 'segunda-feira')

    await user.click(dayOf('2026-10-20'))

    expect(onValueChange).not.toHaveBeenCalled()
    expect(dialog()).toBeInTheDocument()
  })

  it('closes with Escape and gives the focus back to the button', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    renderWithProviders(<DatePicker label="Data" onOpenChange={onOpenChange} />)

    await user.click(toggle())
    await screen.findByRole('dialog')
    await user.keyboard('{Escape}')
    await closed()

    expect(onOpenChange).toHaveBeenLastCalledWith(false)
    expect(toggle()).toHaveFocus()
    expect(field()).toHaveValue('')
  })

  it('closes on a click outside, and stays open on a click inside', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <div>
        <DatePicker label="Data" />
        <button>Fora</button>
      </div>
    )

    await user.click(toggle())
    await screen.findByRole('dialog')
    await user.click(within(dialog()).getByRole('button', { name: 'Próximo mês' }))

    expect(dialog()).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Fora' }))
    await closed()
  })

  it('closes when the field is clicked, so the date can be typed', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DatePicker label="Data" />)

    await user.click(toggle())
    await screen.findByRole('dialog')
    await user.click(field())
    await closed()

    expect(field()).toHaveFocus()
  })

  it('opens by default without taking the focus, and takes it again the next time it opens', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DatePicker label="Data" defaultOpen defaultValue="2026-10-15" />)
    await screen.findByRole('dialog')

    expect(document.body).toHaveFocus()
    expect(dayOf('2026-10-15')).not.toHaveFocus()

    await user.keyboard('{Escape}')
    await closed()
    await user.click(toggle())
    await screen.findByRole('dialog')

    expect(dayOf('2026-10-15')).toHaveFocus()
  })

  it('works controlled and reports the requested change', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    const view = render(wrap(<DatePicker label="Data" open={false} onOpenChange={onOpenChange} />))

    await user.click(toggle())

    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    view.rerender(wrap(<DatePicker label="Data" open onOpenChange={onOpenChange} />))

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(dayOf('2026-10-28')).toHaveFocus()
  })

  it('commits the text that is still being typed when the button is pressed, and shows it in the calendar', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderWithProviders(<DatePicker label="Data" onValueChange={onValueChange} />)

    await user.type(field(), '09/03/2027')
    await user.click(toggle())
    await screen.findByRole('dialog')

    expect(onValueChange).toHaveBeenCalledWith('2027-03-09')
    expect(within(dialog()).getByText('março de 2027')).toBeInTheDocument()
    expect(dayOf('2027-03-09')).toHaveAttribute('aria-selected', 'true')
  })

  it('closes with Enter in the field, after committing what was typed', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderWithProviders(<DatePicker label="Data" defaultOpen onValueChange={onValueChange} />)
    await screen.findByRole('dialog')

    field().focus()
    await user.keyboard('09/03/2027')

    expect(dialog()).toBeInTheDocument()
    await user.keyboard('{Enter}')
    await closed()

    expect(onValueChange).toHaveBeenCalledWith('2027-03-09')
    expect(field()).toHaveValue('09/03/2027')
    expect(field()).toHaveFocus()
  })

  it('moves the calendar to the month of the value when the app changes it while it is open', async () => {
    const Harness = () => {
      const [value, setValue] = useState<string | null>('2026-10-15')

      return (
        <>
          <DatePicker label="Data" value={value} onValueChange={setValue} defaultOpen />
          <button onClick={() => setValue('2027-05-20')}>Mudar</button>
        </>
      )
    }

    const user = userEvent.setup()
    renderWithProviders(<Harness />)
    await screen.findByRole('dialog')

    expect(within(dialog()).getByText('outubro de 2026')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Mudar' }))

    expect(within(dialog()).getByText('maio de 2027')).toBeInTheDocument()
    expect(field()).toHaveValue('20/05/2027')
  })

  it('names the days and the weekdays in the language of the provider', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DatePicker label="Date" defaultValue="2026-10-28" />, { locale: en })

    await user.click(screen.getByRole('button', { name: 'Open calendar' }))
    await screen.findByRole('dialog')

    const popup = screen.getByRole('dialog', { name: 'Choose date' })

    expect(within(popup).getByText('October 2026')).toBeInTheDocument()
    expect(within(popup).getByRole('gridcell', { name: 'Wednesday, October 28, 2026' })).toBeInTheDocument()
    expect(within(popup).getAllByRole('columnheader')[0]).toHaveAttribute('abbr', 'Sunday')
  })

  it('mirrors the calendar in a right-to-left language', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DatePicker label="التاريخ" defaultValue="2026-10-28" />, { locale: { ...en, locale: 'ar', dir: 'rtl' } })

    await user.click(screen.getByRole('button', { name: 'Open calendar' }))
    await screen.findByRole('dialog')

    expect(screen.getByRole('dialog', { name: 'Choose date' })).toHaveAttribute('dir', 'rtl')
  })

  it('closes the calendar, and does not open it, for a field that is disabled or read-only', async () => {
    const user = userEvent.setup()
    const view = render(wrap(<DatePicker label="Data" defaultOpen />))
    await screen.findByRole('dialog')

    view.rerender(wrap(<DatePicker label="Data" defaultOpen disabled />))
    await closed()

    expect(field()).toBeDisabled()
    expect(toggle()).toBeDisabled()

    view.unmount()
    render(wrap(<DatePicker label="Data" readOnly defaultValue="2026-10-28" />))

    expect(field()).toHaveAttribute('readonly')
    expect(toggle()).toBeDisabled()
    await user.click(toggle())
    await user.type(field(), '1')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(field()).toHaveValue('28/10/2026')
  })

  it('closes only the calendar with Escape when it is open over a modal, then the modal', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderWithProviders(
      <Modal isOpen onClose={onClose} title="Agenda">
        <DatePicker label="Data" />
      </Modal>
    )

    await user.click(toggle())
    await screen.findByRole('dialog', { name: 'Escolher data' })
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Escolher data' })).not.toBeInTheDocument())

    expect(onClose).not.toHaveBeenCalled()
    await user.keyboard('{Escape}')

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('renders only the field on the server, with the date written, even when open by default', () => {
    const html = renderToString(
      <UIProvider locale={ptBR}>
        <DatePicker label="Data" defaultOpen defaultValue="2026-10-28" name="when" />
      </UIProvider>
    )

    expect(html).toContain('value="28/10/2026"')
    expect(html).toContain('value="2026-10-28"')
    expect(html).toContain('aria-expanded="true"')
    expect(html).not.toContain('role="grid"')
    expect(html).not.toContain('role="dialog"')
  })
})

describe('DatePicker calendar bringing the focused day into view', () => {
  it('gives the focus to the day without scrolling when it opens from the pointer, from the keyboard and by default', async () => {
    const scrollIntoView = stubScrollIntoView()
    const focus = vi.spyOn(HTMLElement.prototype, 'focus')
    const user = userEvent.setup()
    const focusesOf = (element: Element) => focus.mock.calls.filter((_call, index) => focus.mock.contexts[index] === element)
    const { unmount } = renderWithProviders(<DatePicker label="Data" defaultValue="2026-10-15" />)

    await user.click(toggle())
    await screen.findByRole('dialog')

    expect(dayOf('2026-10-15')).toHaveFocus()
    expect(focusesOf(dayOf('2026-10-15'))).toEqual([[{ preventScroll: true }]])
    expect(focusesOf(within(dialog()).getByRole('button', { name: 'Mês anterior' }))).toEqual([])
    unmount()
    focus.mockClear()

    renderWithProviders(<DatePicker label="Data" defaultValue="2026-10-15" />)
    toggle().focus()
    await user.keyboard('{Enter}')
    await screen.findByRole('dialog')

    expect(dayOf('2026-10-15')).toHaveFocus()
    expect(focusesOf(dayOf('2026-10-15'))).toEqual([[{ preventScroll: true }]])
    expect(focusesOf(within(dialog()).getByRole('button', { name: 'Mês anterior' }))).toEqual([])
    expect(scrollIntoView).not.toHaveBeenCalled()
  })

  it('does not scroll nor take the focus when it is open by default', async () => {
    const scrollIntoView = stubScrollIntoView()

    renderWithProviders(<DatePicker label="Data" defaultOpen defaultValue="2026-10-15" />)
    await screen.findByRole('dialog')

    expect(document.body).toHaveFocus()
    expect(scrollIntoView).not.toHaveBeenCalled()
  })

  it('brings the day that an arrow key reaches into view once it is open', async () => {
    const scrollIntoView = stubScrollIntoView()
    const user = userEvent.setup()
    renderWithProviders(<DatePicker label="Data" defaultValue="2026-10-15" />)

    await user.click(toggle())
    await screen.findByRole('dialog')

    expect(scrollIntoView).not.toHaveBeenCalled()

    await user.keyboard('{ArrowDown}')

    expect(scrollIntoView).toHaveBeenCalledTimes(1)
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest', inline: 'nearest' })
    expect(scrollIntoView.mock.contexts[0]).toBe(dayOf('2026-10-22'))
  })
})

describe('DatePicker language of its own', () => {
  it('writes the date the way the tag of the prop does, whatever the language of the provider', () => {
    for (const [locale, text] of [
      [undefined, '10/28/2026'],
      ['en-GB', '28/10/2026'],
      ['en-CA', '2026-10-28'],
      ['de', '28.10.2026'],
      ['ja', '2026/10/28']
    ] as const) {
      const view = renderWithProviders(<DatePicker label="Date" locale={locale} defaultValue="2026-10-28" />, { locale: en })

      expect(field(), String(locale)).toHaveValue(text)
      view.unmount()
    }
  })

  it('uses the tag of the provider when there is no prop, and writes the same text as the prop with that tag', () => {
    const provider = renderWithProviders(<DatePicker label="Date" defaultValue="2026-10-28" />, { locale: { ...en, locale: 'en-GB' } })

    expect(field()).toHaveValue('28/10/2026')
    provider.unmount()

    renderWithProviders(<DatePicker label="Date" locale="en-GB" defaultValue="2026-10-28" />, { locale: en })

    expect(field()).toHaveValue('28/10/2026')
  })

  it('reads the typed text in the order of the tag of the prop', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    for (const [locale, typed] of [
      ['en-GB', '28/10/2026'],
      ['en-GB', '28102026'],
      ['en-CA', '2026-10-28'],
      ['en-CA', '20261028']
    ] as const) {
      onValueChange.mockClear()

      const view = renderWithProviders(<DatePicker label="Date" locale={locale} onValueChange={onValueChange} />, { locale: en })

      await user.type(field(), typed)
      await user.tab()

      expect(onValueChange, `${locale} ${typed}`).toHaveBeenCalledWith('2026-10-28')
      view.unmount()
    }
  })

  it('puts back a date written in the order of the provider when the prop asks for another', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderWithProviders(<DatePicker label="Date" locale="en-GB" onValueChange={onValueChange} />, { locale: en })

    await user.type(field(), '10/28/2026')
    await user.tab()

    expect(onValueChange).not.toHaveBeenCalled()
    expect(field()).toHaveValue('')
  })

  it('starts the week of the calendar where the tag does, and lets firstDayOfWeek win over it', async () => {
    const user = userEvent.setup()
    const { unmount } = renderWithProviders(<DatePicker label="Date" locale="en-GB" defaultValue="2026-10-28" />, { locale: en })

    await user.click(screen.getByRole('button', { name: 'Open calendar' }))
    await screen.findByRole('dialog')

    expect(within(screen.getByRole('dialog')).getAllByRole('columnheader')[0]).toHaveAttribute('abbr', 'Monday')
    unmount()

    renderWithProviders(<DatePicker label="Date" locale="en-GB" firstDayOfWeek={0} defaultValue="2026-10-28" />, { locale: en })
    await user.click(screen.getByRole('button', { name: 'Open calendar' }))
    await screen.findByRole('dialog')

    expect(within(screen.getByRole('dialog')).getAllByRole('columnheader')[0]).toHaveAttribute('abbr', 'Sunday')
  })

  it('names the month and the days of the calendar with the tag of the prop', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DatePicker label="Date" locale="de" defaultValue="2026-10-28" />, { locale: en })

    await user.click(screen.getByRole('button', { name: 'Open calendar' }))
    await screen.findByRole('dialog')

    const popup = screen.getByRole('dialog', { name: 'Choose date' })

    expect(within(popup).getByText('Oktober 2026')).toBeInTheDocument()
    expect(within(popup).getAllByRole('columnheader')[0]).toHaveAttribute('abbr', 'Montag')
  })

  it('keeps the labels and the direction of the provider, and does not take them from the tag', async () => {
    const user = userEvent.setup()
    const { unmount } = renderWithProviders(<DatePicker label="Data" locale="en-CA" defaultValue="2026-10-28" />)

    expect(field()).toHaveValue('2026-10-28')

    await user.click(toggle())
    await screen.findByRole('dialog')

    expect(dialog()).toHaveAttribute('dir', 'ltr')
    unmount()

    renderWithProviders(<DatePicker label="Date" locale="en-GB" defaultValue="2026-10-28" />, { locale: { ...en, locale: 'ar', dir: 'rtl' } })
    await user.click(screen.getByRole('button', { name: 'Open calendar' }))
    await screen.findByRole('dialog')

    expect(field()).toHaveValue('28/10/2026')
    expect(screen.getByRole('dialog', { name: 'Choose date' })).toHaveAttribute('dir', 'rtl')
  })

  it('writes the date again when the prop changes, and goes back to the provider when it is removed', () => {
    const view = render(wrap(<DatePicker label="Date" locale="en-GB" defaultValue="2026-10-28" />, en))

    expect(field()).toHaveValue('28/10/2026')

    view.rerender(wrap(<DatePicker label="Date" locale="en-CA" defaultValue="2026-10-28" />, en))

    expect(field()).toHaveValue('2026-10-28')

    view.rerender(wrap(<DatePicker label="Date" defaultValue="2026-10-28" />, en))

    expect(field()).toHaveValue('10/28/2026')
  })

  it('falls back to English for a tag that is not valid, and does not throw', () => {
    for (const locale of ['not a locale', 'en_US']) {
      const view = renderWithProviders(<DatePicker label="Data" locale={locale} defaultValue="2026-10-28" />)

      expect(field(), locale).toHaveValue('10/28/2026')
      view.unmount()
    }
  })

  it('treats an empty tag as no tag, and uses the language of the provider', () => {
    const { unmount } = renderWithProviders(<DatePicker label="Data" locale="" defaultValue="2026-10-28" />)

    expect(field()).toHaveValue('28/10/2026')
    unmount()

    renderWithProviders(<DatePicker label="Date" locale="" defaultValue="2026-10-28" />, { locale: { ...en, locale: 'en-CA' } })

    expect(field()).toHaveValue('2026-10-28')
  })

  it('does not pass the prop to the input as an attribute', () => {
    renderWithProviders(<DatePicker label="Date" locale="en-GB" />, { locale: en })

    expect(field()).not.toHaveAttribute('locale')
  })

  it('writes the date of the tag of the prop on the server too', () => {
    const html = renderToString(
      <UIProvider locale={en}>
        <DatePicker label="Date" locale="en-GB" defaultValue="2026-10-28" />
      </UIProvider>
    )

    expect(html).toContain('value="28/10/2026"')
    expect(html).not.toContain('value="10/28/2026"')
  })
})
