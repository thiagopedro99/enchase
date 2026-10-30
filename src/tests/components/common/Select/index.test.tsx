import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from '@tests/axe.ts'

import { describeRequiredContract } from '@tests/shared/contracts/requiredContract.tsx'
import { describeFieldVariantContract } from '@tests/shared/contracts/fieldVariantContract.tsx'
import { describeLabelPlacementContract } from '@tests/shared/contracts/labelPlacementContract.tsx'
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

describe('Select contract', () => {
  it('marks the wrapper and every part with a data-slot', () => {
    const { container } = renderWithProviders(<Select label="País" options={options} error="Obrigatório" />)

    for (const part of ['select', 'select-control', 'select-field', 'select-label', 'select-outline', 'select-icon', 'select-error']) {
      expect(container.querySelector(`[data-slot="${part}"]`), part).toBeInTheDocument()
    }
  })

  it('keeps className and style on the native select and the wrapper ones on the root', () => {
    const { container } = renderWithProviders(<Select label="País" options={options} className="mine" style={{ color: 'red' }} wrapperClassName="outer" wrapperStyle={{ margin: '3px' }} />)
    const field = screen.getByLabelText('País')
    const root = container.querySelector('[data-slot="select"]') as HTMLElement

    expect(field.className.split(' ').at(-1)).toBe('mine')
    expect(field.style.color).toBe('red')
    expect(root.className.split(' ').at(-1)).toBe('outer')
    expect(root.style.margin).toBe('3px')
  })

  it('flags the wrapper as invalid or disabled and wires the error to the field', () => {
    const { container } = renderWithProviders(<Select label="País" options={options} error="Obrigatório" disabled />)
    const root = container.querySelector('[data-slot="select"]') as HTMLElement
    const field = screen.getByLabelText('País')

    expect(root).toHaveAttribute('data-invalid')
    expect(root).toHaveAttribute('data-disabled')
    expect(field).toHaveAttribute('aria-invalid', 'true')
    expect(field.getAttribute('aria-describedby')).toBe(screen.getByRole('alert').id)
  })
})

describeLabelPlacementContract({ name: 'Select', slot: 'select', control: 'select', render: (placement) => <Select label="Name" options={options} labelPlacement={placement} /> })

describeFieldVariantContract({ name: 'Select', slot: 'select', control: 'select', render: (props) => <Select label="Name" options={options} {...props} /> })

describeRequiredContract({ name: 'Select', slot: 'select', control: 'select', role: 'combobox', render: (props) => <Select label="Name" options={options} {...props} /> })
