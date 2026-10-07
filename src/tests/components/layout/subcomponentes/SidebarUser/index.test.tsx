import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/react'
import { axe } from '@tests/axe.ts'

import { SidebarUser } from '@components/layout/subcomponentes/SidebarUser/index.tsx'
import { useAuthStore } from '@stores/auth/index.ts'

const user = { id: '1', name: 'Pedro Lima', email: 'pedro@example.com', createdAt: '2026-01-01' }

describe('SidebarUser', () => {
  beforeEach(() => {
    useAuthStore.setState({ token: 'token', user })
  })

  it('renders nothing without a user', () => {
    useAuthStore.setState({ token: null, user: null })
    renderWithProviders(<SidebarUser collapsed={false} />)

    expect(screen.queryByRole('button', { name: 'Sair' })).not.toBeInTheDocument()
    expect(screen.queryByText('P')).not.toBeInTheDocument()
  })

  it('shows the avatar initial, the name and a labelled logout button when expanded', () => {
    renderWithProviders(<SidebarUser collapsed={false} />)

    expect(screen.getByText('Pedro Lima')).toBeInTheDocument()
    expect(screen.getByText('P')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByRole('button', { name: 'Sair' })).toBeInTheDocument()
  })

  it('shows only the avatar when collapsed, keeping the user name for assistive technology', () => {
    renderWithProviders(<SidebarUser collapsed />)

    expect(screen.getByText('P')).toBeInTheDocument()
    expect(screen.getByText('Pedro Lima')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Sair' })).not.toBeInTheDocument()
  })

  it('logs out through the auth store', async () => {
    const logout = vi.fn()
    useAuthStore.setState({ logout })
    const actor = userEvent.setup()
    renderWithProviders(<SidebarUser collapsed={false} />)

    await actor.click(screen.getByRole('button', { name: 'Sair' }))

    expect(logout).toHaveBeenCalledTimes(1)
  })

  it('uses a configurable logout label', () => {
    renderWithProviders(<SidebarUser collapsed={false} />, { labels: { logout: 'Sign out' } })

    expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = renderWithProviders(<SidebarUser collapsed={false} />)

    expect(await axe(container)).toHaveNoViolations()
  })
})
