import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from '@tests/axe.ts'

import { Select } from '@components/common/Select/index.tsx'

const options = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' }
]

describe('Select', () => {
  it('associates the label without an id and describes errors', () => {
    renderWithProviders(<Select label="Choice" options={options} error="Pick one" />)

    const select = screen.getByLabelText('Choice')
    expect(select).toHaveAttribute('aria-invalid', 'true')
    expect(select).toHaveAccessibleDescription('Pick one')
  })

  it('selects an option with the keyboard-accessible native control', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Select label="Choice" options={options} placeholder="Select..." defaultValue="" />)

    await user.selectOptions(screen.getByLabelText('Choice'), 'b')

    expect(screen.getByLabelText('Choice')).toHaveValue('b')
  })

  it('has no axe violations', async () => {
    const { container } = renderWithProviders(<Select label="Choice" options={options} />)

    expect(await axe(container)).toHaveNoViolations()
  })
})
