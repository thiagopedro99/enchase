import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from '@tests/axe.ts'
import { useState } from 'react'

import { AppBar } from '@components/layout/subcomponentes/AppBar/index.tsx'

import type { AppBarProps } from '@components/layout/subcomponentes/AppBar/types.ts'

const baseProps: AppBarProps = {
  items: [
    { id: 'home', label: 'Início', to: '/' },
    { id: 'docs', label: 'Docs' }
  ],
  menuLabel: 'Recolher menu lateral',
  menuExpanded: true,
  menuControls: 'nav-id',
  onMenuToggle: vi.fn()
}

const ToggleHarness = () => {
  const [expanded, setExpanded] = useState(true)

  return (
    <AppBar
      {...baseProps}
      menuExpanded={expanded}
      menuLabel={expanded ? 'Recolher menu lateral' : 'Expandir menu lateral'}
      onMenuToggle={() => setExpanded((current) => !current)}
    />
  )
}

describe('AppBar', () => {
  it('is a banner with the menu button, the breadcrumb and the actions slot', () => {
    renderWithProviders(<AppBar {...baseProps} actions={<button>Tema</button>} />)

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Recolher menu lateral' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Trilha de navegação' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tema' })).toBeInTheDocument()
  })

  it('exposes the menu state with aria-expanded and aria-controls', () => {
    renderWithProviders(<AppBar {...baseProps} />)
    const button = screen.getByRole('button', { name: 'Recolher menu lateral' })

    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(button).toHaveAttribute('aria-controls', 'nav-id')
    expect(button).not.toHaveAttribute('aria-haspopup')
  })

  it('declares a dialog popup when the menu opens a drawer', () => {
    renderWithProviders(<AppBar {...baseProps} menuHasPopup menuLabel="Abrir menu" menuExpanded={false} />)

    expect(screen.getByRole('button', { name: 'Abrir menu' })).toHaveAttribute('aria-haspopup', 'dialog')
  })

  it('shows the menu-open icon while expanded and the hamburger while collapsed', () => {
    const { container, unmount } = renderWithProviders(<AppBar {...baseProps} menuExpanded />)

    expect(container.querySelector('[data-icon="menu-open"]')).toBeInTheDocument()
    expect(container.querySelector('.lucide-menu')).not.toBeInTheDocument()

    unmount()
    const collapsed = renderWithProviders(<AppBar {...baseProps} menuExpanded={false} menuLabel="Expandir menu lateral" />)

    expect(collapsed.container.querySelector('.lucide-menu')).toBeInTheDocument()
    expect(collapsed.container.querySelector('[data-icon="menu-open"]')).not.toBeInTheDocument()
  })

  it('shows the action as a tooltip on keyboard focus, without duplicating the accessible description', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AppBar {...baseProps} />)

    await user.tab()

    const button = screen.getByRole('button', { name: 'Recolher menu lateral' })
    expect(button).toHaveFocus()
    expect(button).not.toHaveAttribute('aria-describedby')
    expect(await screen.findByText('Recolher menu lateral', { selector: '[aria-hidden="true"]' })).toBeInTheDocument()
  })

  it('shows the tooltip on hover', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AppBar {...baseProps} />)

    await user.hover(screen.getByRole('button', { name: 'Recolher menu lateral' }))

    expect(await screen.findByText('Recolher menu lateral', { selector: '[aria-hidden="true"]' })).toBeInTheDocument()
  })

  it('keeps the tooltip text in sync with the current action', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ToggleHarness />)

    await user.click(screen.getByRole('button', { name: 'Recolher menu lateral' }))

    expect(await screen.findByText('Expandir menu lateral', { selector: '[aria-hidden="true"]' })).toBeInTheDocument()
    expect(screen.queryByText('Recolher menu lateral', { selector: '[aria-hidden="true"]' })).not.toBeInTheDocument()
  })

  it('dismisses the tooltip with Escape while keeping focus on the button', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AppBar {...baseProps} />)

    await user.tab()
    await screen.findByText('Recolher menu lateral', { selector: '[aria-hidden="true"]' })
    await user.keyboard('{Escape}')

    await waitFor(() => expect(screen.queryByText('Recolher menu lateral', { selector: '[aria-hidden="true"]' })).not.toBeInTheDocument())
    expect(screen.getByRole('button', { name: 'Recolher menu lateral' })).toHaveFocus()
  })

  it('calls the toggle handler when the button is activated', async () => {
    const user = userEvent.setup()
    const onMenuToggle = vi.fn()
    renderWithProviders(<AppBar {...baseProps} onMenuToggle={onMenuToggle} />)

    await user.click(screen.getByRole('button', { name: 'Recolher menu lateral' }))
    await user.keyboard('{Enter}')

    expect(onMenuToggle).toHaveBeenCalledTimes(2)
  })

  it('has no axe violations', async () => {
    const { container } = renderWithProviders(
      <>
        <div id="nav-id" />
        <AppBar {...baseProps} actions={<button>Tema</button>} />
      </>
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})
