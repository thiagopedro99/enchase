import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { axe } from '@tests/axe.ts'

import ThemeToggle from '@components/common/ThemeToggle/index.tsx'
import { useAppStore } from '@stores/app/index.ts'

describe('ThemeToggle', () => {
  it('names the action, not the state, and changes it when toggled', async () => {
    const user = userEvent.setup()
    useAppStore.setState({ theme: 'light' })
    renderWithProviders(<ThemeToggle />)

    const button = screen.getByRole('button', { name: 'Mudar para tema escuro' })
    expect(button).not.toHaveAttribute('aria-describedby')

    await user.click(button)

    expect(await screen.findByRole('button', { name: 'Mudar para tema claro' })).toBeInTheDocument()
    expect(useAppStore.getState().theme).toBe('dark')
  })

  it('has no axe violations', async () => {
    const { container } = renderWithProviders(<ThemeToggle />)

    expect(await axe(container)).toHaveNoViolations()
  })
})
