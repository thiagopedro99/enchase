import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import { mockSystemColorScheme } from '@tests/colorScheme.ts'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { act, screen } from '@testing-library/react'
import { axe } from '@tests/axe.ts'

import ThemeToggle from '@components/common/ThemeToggle/index.tsx'

let scheme: ReturnType<typeof mockSystemColorScheme> | undefined

afterEach(() => {
  scheme?.restore()
  scheme = undefined
})

describe('ThemeToggle', () => {
  it('names the action, not the state, and changes it when toggled', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ThemeToggle />, { theme: 'light' })

    const button = screen.getByRole('button', { name: 'Mudar para tema escuro' })
    expect(button).not.toHaveAttribute('aria-describedby')

    await user.click(button)

    expect(await screen.findByRole('button', { name: 'Mudar para tema claro' })).toBeInTheDocument()
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('starts from the dark theme when told to', () => {
    renderWithProviders(<ThemeToggle />, { theme: 'dark' })

    expect(screen.getByRole('button', { name: 'Mudar para tema claro' })).toBeInTheDocument()
  })

  it('reflects the system preference while following it and keeps working after a change', async () => {
    scheme = mockSystemColorScheme('dark')
    const user = userEvent.setup()
    renderWithProviders(<ThemeToggle />, { theme: 'system' })

    expect(screen.getByRole('button', { name: 'Mudar para tema claro' })).toBeInTheDocument()

    act(() => scheme?.set('light'))

    expect(screen.getByRole('button', { name: 'Mudar para tema escuro' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Mudar para tema escuro' }))

    expect(await screen.findByRole('button', { name: 'Mudar para tema claro' })).toBeInTheDocument()
  })

  it('uses the configurable labels', () => {
    renderWithProviders(<ThemeToggle />, { theme: 'light', labels: { switchToDark: 'Dark mode' } })

    expect(screen.getByRole('button', { name: 'Dark mode' })).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = renderWithProviders(<ThemeToggle />)

    expect(await axe(container)).toHaveNoViolations()
  })
})
