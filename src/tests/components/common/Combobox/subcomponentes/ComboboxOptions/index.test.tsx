import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { axe } from '@tests/axe.ts'

import { ComboboxOptions } from '@components/common/Combobox/subcomponentes/ComboboxOptions/index.tsx'

import type { ComponentProps } from 'react'
import type { ComboboxOption } from '@components/common/Combobox/types.ts'

const fruits: ComboboxOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry', disabled: true }
]

type Props = Partial<ComponentProps<typeof ComboboxOptions>>

const Harness = (props: Props) => (
  <div role="listbox" aria-label="Fruit">
    <ComboboxOptions options={fruits} selected={[]} active={-1} idPrefix="fruit" empty={false} loading={false} onActivate={vi.fn()} onChoose={vi.fn()} {...props} />
  </div>
)

const option = (name: string) => screen.getByRole('option', { name })

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ComboboxOptions', () => {
  it('renders one option per item, in order, each with an id built from the prefix and its position', () => {
    renderWithProviders(<Harness />)

    expect(screen.getAllByRole('option').map((item) => item.textContent)).toEqual(['Apple', 'Banana', 'Cherry'])
    expect(screen.getAllByRole('option').map((item) => item.id)).toEqual(['fruit-option-0', 'fruit-option-1', 'fruit-option-2'])
  })

  it('marks the selected options with aria-selected and a check, and no other', () => {
    renderWithProviders(<Harness selected={['banana']} />)

    expect(option('Apple')).toHaveAttribute('aria-selected', 'false')
    expect(option('Banana')).toHaveAttribute('aria-selected', 'true')
    expect(option('Apple').querySelector('svg')).toBeNull()
    expect(option('Banana').querySelector('svg')).not.toBeNull()
  })

  it('marks the disabled options with aria-disabled and the active one with data-active, and only that one', () => {
    renderWithProviders(<Harness active={1} />)

    expect(option('Cherry')).toHaveAttribute('aria-disabled', 'true')
    expect(option('Apple')).not.toHaveAttribute('aria-disabled')
    expect(option('Banana')).toHaveAttribute('data-active')
    expect(option('Apple')).not.toHaveAttribute('data-active')
    expect(option('Cherry')).not.toHaveAttribute('data-active')
  })

  it('has a slot on every option', () => {
    renderWithProviders(<Harness />)

    expect(document.querySelectorAll('[data-slot="combobox-option"]')).toHaveLength(3)
  })

  it('hands the option that was clicked to onChoose', async () => {
    const user = userEvent.setup()
    const onChoose = vi.fn()
    renderWithProviders(<Harness onChoose={onChoose} />)

    await user.click(option('Banana'))

    expect(onChoose).toHaveBeenCalledTimes(1)
    expect(onChoose).toHaveBeenCalledWith(fruits[1])
  })

  it('activates the option under the pointer, once, and leaves the active and the disabled ones alone', () => {
    const onActivate = vi.fn()
    renderWithProviders(<Harness active={0} onActivate={onActivate} />)

    fireEvent.pointerMove(option('Apple'))
    fireEvent.pointerMove(option('Cherry'))
    expect(onActivate).not.toHaveBeenCalled()

    fireEvent.pointerMove(option('Banana'))
    expect(onActivate).toHaveBeenCalledTimes(1)
    expect(onActivate).toHaveBeenCalledWith(1)
  })

  it('does not let a finger activate an option, since it has no hover to follow', () => {
    const onActivate = vi.fn()
    renderWithProviders(<Harness active={0} onActivate={onActivate} />)

    fireEvent.pointerMove(option('Banana'), { pointerType: 'touch' })
    expect(onActivate).not.toHaveBeenCalled()

    fireEvent.pointerMove(option('Banana'), { pointerType: 'pen' })
    expect(onActivate).toHaveBeenCalledWith(1)
  })

  it('lets a synthetic pointer move activate an option even at the same place, as the tools that test an app send them', () => {
    const onActivate = vi.fn()
    renderWithProviders(<Harness active={-1} onActivate={onActivate} />)

    fireEvent.pointerMove(option('Apple'), { clientX: 10, clientY: 20 })
    fireEvent.pointerMove(option('Banana'), { clientX: 10, clientY: 20 })

    expect(onActivate.mock.calls).toEqual([[0], [1]])
  })

  it('scrolls the active option into view when it changes, and does nothing while none is active', () => {
    const scrollIntoView = vi.fn()
    Element.prototype.scrollIntoView = scrollIntoView
    const { rerender } = renderWithProviders(<Harness active={-1} />)

    expect(scrollIntoView).not.toHaveBeenCalled()

    rerender(<Harness active={1} />)
    expect(scrollIntoView).toHaveBeenCalledTimes(1)
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' })
    expect(scrollIntoView.mock.contexts[0]).toBe(option('Banana'))

    rerender(<Harness active={1} />)
    expect(scrollIntoView).toHaveBeenCalledTimes(1)

    rerender(<Harness active={0} />)
    expect(scrollIntoView).toHaveBeenCalledTimes(2)
    expect(scrollIntoView.mock.contexts[1]).toBe(option('Apple'))
  })

  it('scrolls to the active option when it mounts already active', () => {
    const scrollIntoView = vi.fn()
    Element.prototype.scrollIntoView = scrollIntoView
    renderWithProviders(<Harness active={2} />)

    expect(scrollIntoView).toHaveBeenCalledTimes(1)
    expect(scrollIntoView.mock.contexts[0]).toBe(option('Cherry'))
  })

  it('shows a disabled message when there is nothing to show, and no message otherwise', () => {
    const { rerender } = renderWithProviders(<Harness options={[]} empty />)

    const message = screen.getByRole('option', { name: 'Nenhum resultado' })

    expect(message).toHaveAttribute('aria-disabled', 'true')
    expect(message).toHaveAttribute('aria-selected', 'false')
    expect(message).toHaveAttribute('data-message', 'empty')
    expect(message).toHaveAttribute('data-slot', 'combobox-message')

    rerender(<Harness />)
    expect(screen.queryByText('Nenhum resultado')).not.toBeInTheDocument()
  })

  it('shows a loading message after the options while it loads', () => {
    renderWithProviders(<Harness loading />)

    const items = screen.getAllByRole('option')
    const message = items[items.length - 1]

    expect(message).toHaveTextContent('Carregando')
    expect(message).toHaveAttribute('data-message', 'loading')
    expect(message).toHaveAttribute('aria-disabled', 'true')
    expect(items).toHaveLength(4)
  })

  it('does not call onChoose or onActivate for the messages', async () => {
    const user = userEvent.setup()
    const onChoose = vi.fn()
    const onActivate = vi.fn()
    renderWithProviders(<Harness options={[]} empty loading onChoose={onChoose} onActivate={onActivate} />)

    await user.click(screen.getByRole('option', { name: 'Nenhum resultado' }))
    await user.hover(screen.getByRole('option', { name: 'Carregando' }))

    expect(onChoose).not.toHaveBeenCalled()
    expect(onActivate).not.toHaveBeenCalled()
  })

  it('has no accessibility violations', async () => {
    const { container } = renderWithProviders(<Harness selected={['apple']} active={1} />)

    expect(await axe(container)).toHaveNoViolations()
  })
})
