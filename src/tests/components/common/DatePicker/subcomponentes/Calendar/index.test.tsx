import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import userEvent from '@testing-library/user-event'
import { act, screen, within } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from '@tests/axe.ts'

import { Calendar } from '@components/common/DatePicker/subcomponentes/Calendar/index.tsx'
import { en } from '@locales/en.ts'

import type { ComponentProps } from 'react'
import type { RenderWithProvidersOptions } from '@tests/types.ts'

type Props = Partial<ComponentProps<typeof Calendar>>

const render = (props: Props = {}, options?: RenderWithProvidersOptions) => {
  const onSelect = vi.fn()
  const result = renderWithProviders(<Calendar today="2026-10-28" onSelect={onSelect} {...props} />, options)

  return { onSelect, ...result }
}

const cell = (iso: string) => document.querySelector(`[data-date="${iso}"]`) as HTMLElement

const cells = () => [...document.querySelectorAll<HTMLElement>('[role="gridcell"]')]

const title = () => document.querySelector('[data-slot="date-picker-calendar-title"]')?.textContent

const focused = () => (document.activeElement as HTMLElement | null)?.getAttribute('data-date')

const focus = (iso: string) => act(() => cell(iso).focus())

const stylesheet = (text: string) => {
  const element = document.createElement('style')

  element.textContent = text
  document.head.append(element)

  return () => element.remove()
}

describe('Calendar', () => {
  it('is a grid named by the month it shows, with a column for each day of the week', () => {
    render()

    expect(screen.getByRole('grid', { name: 'outubro de 2026' })).toBeInTheDocument()
    expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual(['D', 'S', 'T', 'Q', 'Q', 'S', 'S'])
    expect(screen.getAllByRole('columnheader').map((header) => header.getAttribute('abbr'))).toEqual(['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'])
  })

  it('shows six weeks, starting on the first day of the week that holds the first of the month, and marks the days of the other months', () => {
    render()

    expect(cells()).toHaveLength(42)
    expect(cells()[0]).toHaveAttribute('data-date', '2026-09-27')
    expect(cells()[41]).toHaveAttribute('data-date', '2026-11-07')
    expect(cells().filter((day) => !day.hasAttribute('data-outside')).map((day) => day.textContent)).toEqual(Array.from({ length: 31 }, (_, index) => String(index + 1)))
    expect(cell('2026-09-30')).toHaveAttribute('data-outside')
    expect(cell('2026-10-01')).not.toHaveAttribute('data-outside')
  })

  it('names every day with the whole date, in the language of the provider', () => {
    render()

    expect(cell('2026-10-28')).toHaveAccessibleName('quarta-feira, 28 de outubro de 2026')
    expect(screen.getByRole('gridcell', { name: 'domingo, 1 de novembro de 2026' })).toBe(cell('2026-11-01'))
  })

  it('follows the language of the provider for the month, the weekdays, the labels and the first day of the week', () => {
    render({}, { locale: en })

    expect(screen.getByRole('grid', { name: 'October 2026' })).toBeInTheDocument()
    expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual(['S', 'M', 'T', 'W', 'T', 'F', 'S'])
    expect(screen.getByRole('button', { name: 'Previous month' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next month' })).toBeInTheDocument()
    expect(cell('2026-10-28')).toHaveAccessibleName('Wednesday, October 28, 2026')
  })

  it('marks today with aria-current and nothing else', () => {
    render()

    expect(cells().filter((day) => day.getAttribute('aria-current') === 'date')).toEqual([cell('2026-10-28')])
  })

  it('does not mark a day as today when today is not in the month on view', () => {
    render({ today: '2026-10-28', value: '2027-03-15' })

    expect(cells().filter((day) => day.hasAttribute('aria-current'))).toEqual([])
  })

  it('marks the chosen day with aria-selected true and every other with false', () => {
    render({ value: '2026-10-15' })

    expect(cells().filter((day) => day.getAttribute('aria-selected') === 'true')).toEqual([cell('2026-10-15')])
    expect(cells().filter((day) => day.getAttribute('aria-selected') === 'false')).toHaveLength(41)
  })

  it('selects nothing when there is no value, or when the value is not a day', () => {
    const { unmount } = render({ value: null })

    expect(cells().some((day) => day.getAttribute('aria-selected') === 'true')).toBe(false)
    unmount()
    render({ value: 'not a date' })

    expect(cells().some((day) => day.getAttribute('aria-selected') === 'true')).toBe(false)
    expect(title()).toBe('outubro de 2026')
  })

  it('opens on the month of the value, and otherwise on the month of today', () => {
    const { unmount } = render({ value: '2027-03-15' })

    expect(title()).toBe('março de 2027')
    unmount()
    render()

    expect(title()).toBe('outubro de 2026')
  })

  it('has one day in the tab order: the chosen one, or else today', () => {
    const { unmount } = render({ value: '2026-10-15' })

    expect(cells().filter((day) => day.tabIndex === 0)).toEqual([cell('2026-10-15')])
    expect(cells().filter((day) => day.tabIndex === -1)).toHaveLength(41)
    unmount()
    render()

    expect(cells().filter((day) => day.tabIndex === 0)).toEqual([cell('2026-10-28')])
  })

  it('keeps the day that gets the focus inside the limits', () => {
    const { unmount } = render({ min: '2026-11-10' })

    expect(title()).toBe('novembro de 2026')
    expect(cell('2026-11-10')).toHaveAttribute('tabindex', '0')
    unmount()
    render({ max: '2026-09-05' })

    expect(title()).toBe('setembro de 2026')
    expect(cell('2026-09-05')).toHaveAttribute('tabindex', '0')
  })

  it('ignores a today, a min or a max that is not a day', () => {
    render({ today: 'nope', min: 'nope', max: '2026-13-45' })

    expect(title()).toBe('janeiro de 2000')
    expect(cells().some((day) => day.getAttribute('aria-disabled') === 'true')).toBe(false)
  })

  it('does not take the focus when it opens, unless it is told to', () => {
    const { unmount } = render({ value: '2026-10-15' })

    expect(document.body).toHaveFocus()
    unmount()
    render({ value: '2026-10-15', autoFocus: true })

    expect(cell('2026-10-15')).toHaveFocus()
  })

  it('takes the focus without scrolling the page to the day', () => {
    const spy = vi.spyOn(HTMLElement.prototype, 'focus')

    render({ value: '2026-10-15', autoFocus: true })

    expect(spy).toHaveBeenCalledWith({ preventScroll: true })
    spy.mockRestore()
  })

  it('marks the days before min, after max and the ones the app disables, and only those', () => {
    const isDateDisabled = vi.fn((date: string) => date === '2026-10-20' || date === '2026-10-21')

    render({ min: '2026-10-05', max: '2026-10-25', isDateDisabled })
    const disabled = cells().filter((day) => day.getAttribute('aria-disabled') === 'true').map((day) => day.getAttribute('data-date'))

    expect(disabled).toContain('2026-10-04')
    expect(disabled).toContain('2026-10-26')
    expect(disabled).toContain('2026-10-20')
    expect(disabled).toContain('2026-10-21')
    expect(disabled).not.toContain('2026-10-05')
    expect(disabled).not.toContain('2026-10-25')
    expect(disabled).not.toContain('2026-10-22')
    expect(isDateDisabled).toHaveBeenCalledWith('2026-10-20')
    expect(isDateDisabled.mock.calls.every(([date]) => /^\d{4}-\d{2}-\d{2}$/.test(date))).toBe(true)
  })

  it('tells the app the day that was clicked, written as YYYY-MM-DD', async () => {
    const user = userEvent.setup()
    const { onSelect } = render()

    await user.click(cell('2026-10-15'))

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith('2026-10-15')
  })

  it('lets a day of the other months be chosen, and goes to its month', async () => {
    const user = userEvent.setup()
    const { onSelect } = render()

    await user.click(cell('2026-11-03'))

    expect(onSelect).toHaveBeenCalledWith('2026-11-03')
    expect(title()).toBe('novembro de 2026')
  })

  it('does not choose a day that is disabled', async () => {
    const user = userEvent.setup()
    const { onSelect } = render({ min: '2026-10-10', max: '2026-10-20', isDateDisabled: (date) => date === '2026-10-15' })

    for (const date of ['2026-10-09', '2026-10-21', '2026-10-15']) await user.click(cell(date))

    expect(onSelect).not.toHaveBeenCalled()

    await user.click(cell('2026-10-16'))
    expect(onSelect).toHaveBeenCalledWith('2026-10-16')
  })

  it('moves to the month of a value that the app changes, and stays there when the value is cleared', async () => {
    const user = userEvent.setup()
    const Harness = () => {
      const [value, setValue] = useState<string | null>('2026-10-15')

      return (
        <>
          <button onClick={() => setValue('2027-03-15')}>Move</button>
          <button onClick={() => setValue(null)}>Clear</button>
          <Calendar today="2026-10-28" value={value} onSelect={vi.fn()} />
        </>
      )
    }

    renderWithProviders(<Harness />)
    expect(title()).toBe('outubro de 2026')

    await user.click(screen.getByRole('button', { name: 'Move' }))
    expect(title()).toBe('março de 2027')
    expect(cell('2027-03-15')).toHaveAttribute('aria-selected', 'true')
    expect(cell('2027-03-15')).toHaveAttribute('tabindex', '0')

    await user.click(screen.getByRole('button', { name: 'Clear' }))
    expect(title()).toBe('março de 2027')
    expect(cells().some((day) => day.getAttribute('aria-selected') === 'true')).toBe(false)
  })

  it('does not go back to the value when the person moves on to another month', async () => {
    const user = userEvent.setup()

    render({ value: '2026-10-15' })
    await user.click(screen.getByRole('button', { name: 'Próximo mês' }))
    await user.click(screen.getByRole('button', { name: 'Próximo mês' }))

    expect(title()).toBe('dezembro de 2026')
  })
})

describe('Calendar with the keyboard', () => {
  it('moves the focus by one day with the left and right arrows', async () => {
    const user = userEvent.setup()

    render({ value: '2026-10-15' })
    focus('2026-10-15')

    await user.keyboard('{ArrowRight}')
    expect(focused()).toBe('2026-10-16')

    await user.keyboard('{ArrowLeft}{ArrowLeft}')
    expect(focused()).toBe('2026-10-14')
  })

  it('moves the focus by one week with the up and down arrows', async () => {
    const user = userEvent.setup()

    render({ value: '2026-10-15' })
    focus('2026-10-15')

    await user.keyboard('{ArrowDown}')
    expect(focused()).toBe('2026-10-22')

    await user.keyboard('{ArrowUp}{ArrowUp}')
    expect(focused()).toBe('2026-10-08')
  })

  it('goes into the next and the previous month, and says it', async () => {
    const user = userEvent.setup()

    render({ value: '2026-10-31' })
    focus('2026-10-31')

    await user.keyboard('{ArrowRight}')
    expect(focused()).toBe('2026-11-01')
    expect(title()).toBe('novembro de 2026')

    await user.keyboard('{ArrowLeft}')
    expect(focused()).toBe('2026-10-31')
    expect(title()).toBe('outubro de 2026')
  })

  it('goes across the year in both directions', async () => {
    const user = userEvent.setup()

    render({ value: '2026-12-31' })
    focus('2026-12-31')

    await user.keyboard('{ArrowRight}')
    expect(focused()).toBe('2027-01-01')
    expect(title()).toBe('janeiro de 2027')

    await user.keyboard('{ArrowLeft}')
    expect(focused()).toBe('2026-12-31')
  })

  it('goes to the first and the last day of the week with Home and End', async () => {
    const user = userEvent.setup()

    render({ value: '2026-10-28' })
    focus('2026-10-28')

    await user.keyboard('{Home}')
    expect(focused()).toBe('2026-10-25')

    await user.keyboard('{End}')
    expect(focused()).toBe('2026-10-31')
  })

  it('counts the week from the day that firstDayOfWeek says', async () => {
    const user = userEvent.setup()

    render({ value: '2026-10-28', firstDayOfWeek: 1 })
    expect(screen.getAllByRole('columnheader').map((header) => header.getAttribute('abbr'))[0]).toBe('segunda-feira')
    focus('2026-10-28')

    await user.keyboard('{Home}')
    expect(focused()).toBe('2026-10-26')

    await user.keyboard('{End}')
    expect(focused()).toBe('2026-11-01')
  })

  it('goes by a month with PageUp and PageDown, keeping the day or the last day of a shorter month', async () => {
    const user = userEvent.setup()

    render({ value: '2026-03-31' })
    focus('2026-03-31')

    await user.keyboard('{PageUp}')
    expect(focused()).toBe('2026-02-28')
    expect(title()).toBe('fevereiro de 2026')

    await user.keyboard('{PageDown}{PageDown}')
    expect(focused()).toBe('2026-04-28')
  })

  it('goes by a year with Shift and PageUp or PageDown', async () => {
    const user = userEvent.setup()

    render({ value: '2024-02-29' })
    focus('2024-02-29')

    await user.keyboard('{Shift>}{PageDown}{/Shift}')
    expect(focused()).toBe('2025-02-28')

    await user.keyboard('{Shift>}{PageUp}{PageUp}{/Shift}')
    expect(focused()).toBe('2023-02-28')
  })

  it('chooses the focused day with Enter and with Space', async () => {
    const user = userEvent.setup()
    const { onSelect } = render({ value: '2026-10-15' })

    focus('2026-10-15')
    await user.keyboard('{ArrowRight}{Enter}')
    await user.keyboard('{ArrowRight} ')

    expect(onSelect.mock.calls).toEqual([['2026-10-16'], ['2026-10-17']])
  })

  it('does not choose a disabled day with Enter, but lets the focus reach it', async () => {
    const user = userEvent.setup()
    const { onSelect } = render({ value: '2026-10-15', isDateDisabled: (date) => date === '2026-10-16' })

    focus('2026-10-15')
    await user.keyboard('{ArrowRight}')

    expect(focused()).toBe('2026-10-16')

    await user.keyboard('{Enter}')
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('stops at min and at max', async () => {
    const user = userEvent.setup()

    render({ value: '2026-10-15', min: '2026-10-14', max: '2026-10-16' })
    focus('2026-10-15')

    await user.keyboard('{ArrowLeft}{ArrowLeft}{ArrowLeft}')
    expect(focused()).toBe('2026-10-14')

    await user.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}')
    expect(focused()).toBe('2026-10-16')

    await user.keyboard('{PageDown}')
    expect(focused()).toBe('2026-10-16')
    expect(title()).toBe('outubro de 2026')
  })

  it('leaves alone the keys with Ctrl, Meta or Alt, and the arrows with Shift', async () => {
    const user = userEvent.setup()

    render({ value: '2026-10-15' })
    focus('2026-10-15')

    await user.keyboard('{Control>}{ArrowRight}{/Control}')
    await user.keyboard('{Meta>}{ArrowDown}{/Meta}')
    await user.keyboard('{Alt>}{PageDown}{/Alt}')
    await user.keyboard('{Shift>}{ArrowRight}{/Shift}')

    expect(focused()).toBe('2026-10-15')
  })

  it('leaves alone the other keys', async () => {
    const user = userEvent.setup()
    const { onSelect } = render({ value: '2026-10-15' })

    focus('2026-10-15')
    await user.keyboard('a{Escape}{Tab}')

    expect(onSelect).not.toHaveBeenCalled()
  })

  it('turns the left and right arrows around in a right-to-left page, so that they follow the screen', async () => {
    const user = userEvent.setup()
    const remove = stylesheet('[data-slot="date-picker-calendar-grid"] { direction: rtl; }')

    try {
      render({ value: '2026-10-15' })
      focus('2026-10-15')

      await user.keyboard('{ArrowLeft}')
      expect(focused()).toBe('2026-10-16')

      await user.keyboard('{ArrowRight}{ArrowRight}')
      expect(focused()).toBe('2026-10-14')

      await user.keyboard('{ArrowDown}')
      expect(focused()).toBe('2026-10-21')
    } finally {
      remove()
    }
  })

  it('keeps the focus in the day after it moves to another month, and only one day in the tab order', async () => {
    const user = userEvent.setup()

    render({ value: '2026-10-31' })
    focus('2026-10-31')
    await user.keyboard('{ArrowRight}')

    expect(cell('2026-11-01')).toHaveFocus()
    expect(cells().filter((day) => day.tabIndex === 0)).toEqual([cell('2026-11-01')])
  })
})

describe('Calendar with the buttons of the month', () => {
  it('shows the next and the previous month, keeping the day, and leaves the focus on the button', async () => {
    const user = userEvent.setup()

    render({ value: '2026-01-31' })
    await user.click(screen.getByRole('button', { name: 'Próximo mês' }))

    expect(title()).toBe('fevereiro de 2026')
    expect(screen.getByRole('button', { name: 'Próximo mês' })).toHaveFocus()
    expect(cells().filter((day) => day.tabIndex === 0)).toEqual([cell('2026-02-28')])

    await user.click(screen.getByRole('button', { name: 'Mês anterior' }))
    await user.click(screen.getByRole('button', { name: 'Mês anterior' }))
    expect(title()).toBe('dezembro de 2025')
  })

  it('announces the month when it changes, and has the same name for the grid', async () => {
    const user = userEvent.setup()

    render()

    expect(document.querySelector('[data-slot="date-picker-calendar-title"]')).toHaveAttribute('aria-live', 'polite')
    expect(document.querySelector('[data-slot="date-picker-calendar-title"]')).toHaveAttribute('aria-atomic', 'true')

    await user.click(screen.getByRole('button', { name: 'Próximo mês' }))
    expect(screen.getByRole('grid', { name: 'novembro de 2026' })).toBeInTheDocument()
  })

  it('stops the buttons at min and at max', () => {
    const { unmount } = render({ min: '2026-10-05', max: '2026-10-25' })

    expect(screen.getByRole('button', { name: 'Mês anterior' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Próximo mês' })).toBeDisabled()
    unmount()
    render({ min: '2026-09-30', max: '2026-11-01' })

    expect(screen.getByRole('button', { name: 'Mês anterior' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Próximo mês' })).toBeEnabled()
  })

  it('does not let the buttons go past the limits', async () => {
    const user = userEvent.setup()

    render({ min: '2026-09-15', max: '2026-11-15' })
    await user.click(screen.getByRole('button', { name: 'Mês anterior' }))
    await user.click(screen.getByRole('button', { name: 'Mês anterior' }))
    await user.click(screen.getByRole('button', { name: 'Próximo mês' }))
    await user.click(screen.getByRole('button', { name: 'Próximo mês' }))
    await user.click(screen.getByRole('button', { name: 'Próximo mês' }))

    expect(title()).toBe('novembro de 2026')
    expect(screen.getByRole('button', { name: 'Próximo mês' })).toBeDisabled()
  })
})

describe('Calendar first day of the week', () => {
  it('uses the first day of the language when it is not told, and the one it is told otherwise', () => {
    const { unmount } = render({}, { locale: en })

    expect(screen.getAllByRole('columnheader')[0]).toHaveAttribute('abbr', 'Sunday')
    unmount()
    render({ firstDayOfWeek: 1 }, { locale: en })

    expect(screen.getAllByRole('columnheader')[0]).toHaveAttribute('abbr', 'Monday')
    expect(cells()[0]).toHaveAttribute('data-date', '2026-09-28')
  })

  it('ignores a first day that is not a day of the week', () => {
    const british = { ...en, locale: 'en-GB' }
    const { unmount } = render({ firstDayOfWeek: 7 }, { locale: british })

    expect(screen.getAllByRole('columnheader')[0]).toHaveAttribute('abbr', 'Monday')
    unmount()
    render({ firstDayOfWeek: 1.5 }, { locale: british })

    expect(screen.getAllByRole('columnheader')[0]).toHaveAttribute('abbr', 'Monday')
  })

  it('lays the week out in the order of the first day', () => {
    render({ firstDayOfWeek: 6 })

    expect(screen.getAllByRole('columnheader').map((header) => header.getAttribute('abbr'))).toEqual(['sábado', 'domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira'])
  })
})

describe('Calendar language of its own', () => {
  it('names the month and the weekdays with the tag it is given, and keeps the labels of the provider', () => {
    render({ locale: 'en-GB' })

    expect(screen.getByRole('grid', { name: 'October 2026' })).toBeInTheDocument()
    expect(screen.getAllByRole('columnheader').map((header) => header.getAttribute('abbr'))).toEqual(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
    expect(screen.getByRole('button', { name: 'Mês anterior' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Próximo mês' })).toBeInTheDocument()
  })

  it('starts the week where the tag does, over the first day of the language of the provider', () => {
    const { unmount } = render({ locale: 'en-GB' }, { locale: en })

    expect(screen.getAllByRole('columnheader')[0]).toHaveAttribute('abbr', 'Monday')
    expect(cells()[0]).toHaveAttribute('data-date', '2026-09-28')
    unmount()
    render({ locale: 'en-CA' }, { locale: { ...en, locale: 'en-GB' } })

    expect(screen.getAllByRole('columnheader')[0]).toHaveAttribute('abbr', 'Sunday')
    expect(cells()[0]).toHaveAttribute('data-date', '2026-09-27')
  })

  it('lets firstDayOfWeek win over the first day of the tag', () => {
    render({ locale: 'en-GB', firstDayOfWeek: 0 }, { locale: en })

    expect(screen.getAllByRole('columnheader')[0]).toHaveAttribute('abbr', 'Sunday')
  })

  it('follows the language of the provider when it is not given a tag', () => {
    render({ locale: undefined }, { locale: { ...en, locale: 'en-GB' } })

    expect(screen.getByRole('grid', { name: 'October 2026' })).toBeInTheDocument()
    expect(screen.getAllByRole('columnheader')[0]).toHaveAttribute('abbr', 'Monday')
  })

  it('treats an empty tag as no tag, and follows the language of the provider', () => {
    const { unmount } = render({ locale: '' })

    expect(screen.getByRole('grid', { name: 'outubro de 2026' })).toBeInTheDocument()
    unmount()
    render({ locale: '' }, { locale: { ...en, locale: 'en-GB' } })

    expect(screen.getByRole('grid', { name: 'October 2026' })).toBeInTheDocument()
    expect(screen.getAllByRole('columnheader')[0]).toHaveAttribute('abbr', 'Monday')
  })

  it('names the month and starts the week again when the tag changes while it is open', async () => {
    const user = userEvent.setup()

    const Harness = () => {
      const [locale, setLocale] = useState('en-GB')

      return (
        <>
          <button type="button" onClick={() => setLocale('de')}>
            Change
          </button>
          <Calendar today="2026-10-28" locale={locale} onSelect={vi.fn()} />
        </>
      )
    }

    renderWithProviders(<Harness />, { locale: en })

    expect(screen.getByRole('grid', { name: 'October 2026' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Change' }))

    expect(screen.getByRole('grid', { name: 'Oktober 2026' })).toBeInTheDocument()
    expect(screen.getAllByRole('columnheader')[0]).toHaveAttribute('abbr', 'Montag')
  })

  it('falls back to English for a tag that is not valid, and does not throw', () => {
    for (const locale of ['not a locale', 'en_US']) {
      const { unmount } = render({ locale })

      expect(screen.getByRole('grid', { name: 'October 2026' }), locale).toBeInTheDocument()
      expect(screen.getAllByRole('columnheader')[0], locale).toHaveAttribute('abbr', 'Sunday')
      unmount()
    }
  })
})

describe('Calendar parts', () => {
  it('marks the root and every part with a data-slot', () => {
    render({ value: '2026-10-15' })

    for (const part of ['calendar', 'calendar-header', 'calendar-nav', 'calendar-title', 'calendar-grid', 'calendar-weekday', 'calendar-week', 'calendar-day', 'calendar-day-number']) expect(document.querySelector(`[data-slot="date-picker-${part}"]`), part).not.toBeNull()

    expect(document.querySelectorAll('[data-slot="date-picker-calendar-day"]')).toHaveLength(42)
    expect(document.querySelectorAll('[data-slot="date-picker-calendar-week"]')).toHaveLength(6)
  })

  it('keeps the numbers inside the days', () => {
    render()

    expect(within(cell('2026-10-28')).getByText('28')).toHaveAttribute('data-slot', 'date-picker-calendar-day-number')
  })

  it('has no accessibility violations', async () => {
    const { container } = render({ value: '2026-10-15', min: '2026-10-05', max: '2026-11-20', isDateDisabled: (date) => date === '2026-10-20' })

    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no accessibility violations in English and in the middle of a keyboard move', async () => {
    const user = userEvent.setup()
    const { container } = render({ value: '2026-10-31' }, { locale: en })

    focus('2026-10-31')
    await user.keyboard('{ArrowRight}')

    expect(await axe(container)).toHaveNoViolations()
  })
})
