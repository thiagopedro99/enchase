import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import { describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/react'
import { axe } from '@tests/axe.ts'

import { SidebarUser } from '@components/layout/subcomponentes/SidebarUser/index.tsx'

describe('SidebarUser', () => {
  it('shows the avatar initial, the name and a labelled logout button when expanded', () => {
    renderWithProviders(<SidebarUser name="Pedro Lima" collapsed={false} onLogout={vi.fn()} />)

    expect(screen.getByText('Pedro Lima')).toBeInTheDocument()
    expect(screen.getByText('P')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByRole('button', { name: 'Sair' })).toBeInTheDocument()
  })

  it('shows only the avatar when collapsed, keeping the user name for assistive technology', () => {
    renderWithProviders(<SidebarUser name="Pedro Lima" collapsed onLogout={vi.fn()} />)

    expect(screen.getByText('P')).toBeInTheDocument()
    expect(screen.getByText('Pedro Lima')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Sair' })).not.toBeInTheDocument()
  })

  it('calls the logout handler it receives', async () => {
    const onLogout = vi.fn()
    const actor = userEvent.setup()
    renderWithProviders(<SidebarUser name="Pedro Lima" collapsed={false} onLogout={onLogout} />)

    await actor.click(screen.getByRole('button', { name: 'Sair' }))

    expect(onLogout).toHaveBeenCalledTimes(1)
  })

  it('does not render a logout button when no handler is given', () => {
    renderWithProviders(<SidebarUser name="Pedro Lima" collapsed={false} />)

    expect(screen.getByText('Pedro Lima')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('uses a configurable logout label', () => {
    renderWithProviders(<SidebarUser name="Pedro Lima" collapsed={false} onLogout={vi.fn()} />, { labels: { logout: 'Sign out' } })

    expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = renderWithProviders(<SidebarUser name="Pedro Lima" collapsed={false} onLogout={vi.fn()} />)

    expect(await axe(container)).toHaveNoViolations()
  })
})
