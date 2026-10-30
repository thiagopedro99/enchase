import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from '@tests/axe.ts'

import { describeFieldVariantContract } from '@tests/shared/contracts/fieldVariantContract.tsx'
import { describeLabelPlacementContract } from '@tests/shared/contracts/labelPlacementContract.tsx'
import { Input } from '@components/common/Input/index.tsx'

describe('Input password toggle', () => {
  it('shows a toggle button for password fields and reveals the value', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Input label="Senha" type="password" defaultValue="segredo" />)
    const field = screen.getByLabelText('Senha')

    expect(field).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: 'Mostrar senha' }))

    expect(field).toHaveAttribute('type', 'text')
    expect(field).toHaveValue('segredo')
    expect(screen.getByRole('button', { name: 'Ocultar senha' })).toHaveFocus()

    await user.click(screen.getByRole('button', { name: 'Ocultar senha' }))

    expect(field).toHaveAttribute('type', 'password')
    expect(screen.getByRole('button', { name: 'Mostrar senha' })).toBeInTheDocument()
  })

  it('can be reached and activated with the keyboard after the field', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Input label="Senha" type="password" />)

    await user.tab()
    expect(screen.getByLabelText('Senha')).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Mostrar senha' })).toHaveFocus()
    await user.keyboard('{Enter}')

    expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'text')
  })

  it('does not render the toggle for other types or when turned off', () => {
    const { unmount } = renderWithProviders(<Input label="Email" type="email" />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()

    unmount()
    renderWithProviders(<Input label="Senha" type="password" passwordToggle={false} />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'password')
  })

  it('disables the toggle together with the field', () => {
    renderWithProviders(<Input label="Senha" type="password" disabled />)

    expect(screen.getByRole('button', { name: 'Mostrar senha' })).toBeDisabled()
  })

  it('uses configurable labels', () => {
    renderWithProviders(<Input label="Password" type="password" />, { labels: { showPassword: 'Show password', hidePassword: 'Hide password' } })

    expect(screen.getByRole('button', { name: 'Show password' })).toBeInTheDocument()
  })

  it('has no axe violations with the toggle', async () => {
    const { container } = renderWithProviders(<Input label="Senha" type="password" helperText="Mínimo de 8 caracteres" />)

    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Input', () => {
  it('associates the label even when no id is provided', () => {
    renderWithProviders(<Input label="Email" />)

    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('keeps ids unique across fields', () => {
    renderWithProviders(
      <>
        <Input label="First" helperText="one" />
        <Input label="Second" helperText="two" />
      </>
    )

    expect(screen.getByLabelText('First').id).not.toBe(screen.getByLabelText('Second').id)
  })

  it('uses a provided id', () => {
    renderWithProviders(<Input label="Email" id="email" />)

    expect(screen.getByLabelText('Email')).toHaveAttribute('id', 'email')
  })

  it('describes the field with the helper text', () => {
    renderWithProviders(<Input label="Email" helperText="We never share it" />)

    expect(screen.getByLabelText('Email')).toHaveAccessibleDescription('We never share it')
  })

  it('marks the field invalid and announces the error instead of the helper', () => {
    renderWithProviders(<Input label="Email" helperText="We never share it" error="Required" />)

    const field = screen.getByLabelText('Email')
    expect(field).toHaveAttribute('aria-invalid', 'true')
    expect(field).toHaveAccessibleDescription('Required')
    expect(screen.getByRole('alert')).toHaveTextContent('Required')
  })

  it('merges a consumer aria-describedby with its own', () => {
    renderWithProviders(
      <>
        <p id="hint">Extra hint</p>
        <Input label="Email" helperText="Helper" aria-describedby="hint" />
      </>
    )

    expect(screen.getByLabelText('Email')).toHaveAccessibleDescription('Extra hint Helper')
  })

  it('is not marked invalid by default', () => {
    renderWithProviders(<Input label="Email" />)

    expect(screen.getByLabelText('Email')).not.toHaveAttribute('aria-invalid')
  })

  it('has no axe violations with helper text and error', async () => {
    const { container } = renderWithProviders(
      <form>
        <Input label="Name" helperText="Your full name" />
        <Input label="Email" error="Required" />
      </form>
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Input contract', () => {
  it('marks the wrapper and every part with a data-slot', () => {
    const { container } = renderWithProviders(<Input label="Senha" type="password" error="Obrigatório" />)

    for (const part of ['input', 'input-control', 'input-field', 'input-label', 'input-outline', 'input-toggle', 'input-error']) {
      expect(container.querySelector(`[data-slot="${part}"]`), part).toBeInTheDocument()
    }
  })

  it('keeps className and style on the native input and the wrapper ones on the root', () => {
    const { container } = renderWithProviders(<Input label="Nome" className="mine" style={{ color: 'red' }} wrapperClassName="outer" wrapperStyle={{ margin: '3px' }} />)
    const field = screen.getByLabelText('Nome')
    const root = container.querySelector('[data-slot="input"]') as HTMLElement

    expect(field.className.split(' ').at(-1)).toBe('mine')
    expect(field.style.color).toBe('red')
    expect(field).toHaveAttribute('data-slot', 'input-field')
    expect(root.className.split(' ').at(-1)).toBe('outer')
    expect(root.style.margin).toBe('3px')
  })

  it('flags the wrapper as invalid or disabled and wires the error to the field', () => {
    const { container } = renderWithProviders(<Input label="Nome" error="Obrigatório" disabled />)
    const root = container.querySelector('[data-slot="input"]') as HTMLElement
    const field = screen.getByLabelText('Nome')

    expect(root).toHaveAttribute('data-invalid')
    expect(root).toHaveAttribute('data-disabled')
    expect(field).toHaveAttribute('aria-invalid', 'true')
    expect(field.getAttribute('aria-describedby')).toBe(screen.getByRole('alert').id)
  })

  it('joins a caller aria-describedby with the helper text', () => {
    renderWithProviders(<Input label="Nome" helperText="Dica" aria-describedby="extra" />)

    expect(screen.getByLabelText('Nome').getAttribute('aria-describedby')).toBe(`extra ${screen.getByText('Dica').id}`)
  })
})

describeLabelPlacementContract({ name: 'Input', slot: 'input', control: 'input', placeholder: 'Type', render: (placement) => <Input label="Name" placeholder="Type" labelPlacement={placement} /> })

describeFieldVariantContract({ name: 'Input', slot: 'input', control: 'input', render: (props) => <Input label="Name" placeholder="Type" {...props} /> })
