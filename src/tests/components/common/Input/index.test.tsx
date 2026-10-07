import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from '@tests/axe.ts'

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
