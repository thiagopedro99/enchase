import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { axe } from '@tests/axe.ts'

import { ComboboxToggle } from '@components/common/Combobox/subcomponentes/ComboboxToggle/index.tsx'

const toggle = () => screen.getByRole('button', { name: 'Mostrar opções' })

describe('ComboboxToggle', () => {
  it('is a button named from the labels, out of the tab order, and it never submits a form', () => {
    renderWithProviders(<ComboboxToggle expanded={false} onToggle={vi.fn()} />)

    expect(toggle()).toHaveAttribute('type', 'button')
    expect(toggle()).toHaveAttribute('tabindex', '-1')
    expect(toggle()).toHaveAttribute('data-slot', 'combobox-toggle')
  })

  it('takes its name from the labels of the provider', () => {
    renderWithProviders(<ComboboxToggle expanded={false} onToggle={vi.fn()} />, { labels: { showOptions: 'Open the list' } })

    expect(screen.getByRole('button', { name: 'Open the list' })).toBeInTheDocument()
  })

  it('says the list is closed with aria-expanded, and points at nothing', () => {
    renderWithProviders(<ComboboxToggle expanded={false} onToggle={vi.fn()} />)

    expect(toggle()).toHaveAttribute('aria-expanded', 'false')
    expect(toggle()).not.toHaveAttribute('aria-controls')
  })

  it('says the list is open with aria-expanded, and points at it', () => {
    renderWithProviders(<ComboboxToggle expanded controls="list" onToggle={vi.fn()} />)

    expect(toggle()).toHaveAttribute('aria-expanded', 'true')
    expect(toggle()).toHaveAttribute('aria-controls', 'list')
  })

  it('calls onToggle when it is pressed', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    renderWithProviders(<ComboboxToggle expanded={false} onToggle={onToggle} />)

    await user.click(toggle())

    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('does nothing when it is disabled', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    renderWithProviders(<ComboboxToggle expanded={false} disabled onToggle={onToggle} />)

    await user.click(toggle())

    expect(toggle()).toBeDisabled()
    expect(onToggle).not.toHaveBeenCalled()
  })

  it('keeps the focus where it is when it is pressed with the mouse', () => {
    renderWithProviders(<ComboboxToggle expanded={false} onToggle={vi.fn()} />)

    expect(fireEvent.mouseDown(toggle())).toBe(false)
  })

  it('has no accessibility violations', async () => {
    const { container } = renderWithProviders(
      <>
        <ComboboxToggle expanded controls="list" onToggle={vi.fn()} />
        <div id="list" role="listbox" aria-label="Fruit" />
      </>
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})
