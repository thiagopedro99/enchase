import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from '@tests/axe.ts'

import { Checkbox } from '@components/common/Checkbox/index.tsx'

describe('Checkbox', () => {
  it('toggles uncontrolled and exposes the checked state to assistive technology', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Checkbox label="Accept terms" />)
    const checkbox = screen.getByRole('checkbox', { name: 'Accept terms' })

    expect(checkbox).not.toBeChecked()
    await user.click(checkbox)

    expect(checkbox).toBeChecked()
  })

  it('toggles by clicking the label text', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Checkbox label="Accept terms" />)

    await user.click(screen.getByText('Accept terms'))

    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('is reachable by keyboard and toggles with Space', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Checkbox label="Accept terms" />)

    await user.tab()
    expect(screen.getByRole('checkbox')).toHaveFocus()
    await user.keyboard(' ')

    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('does not toggle when disabled', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Checkbox label="Locked" disabled />)

    await user.click(screen.getByText('Locked'))

    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  it('has no axe violations', async () => {
    const { container } = renderWithProviders(<Checkbox label="Accept terms" />)

    expect(await axe(container)).toHaveNoViolations()
  })
})
