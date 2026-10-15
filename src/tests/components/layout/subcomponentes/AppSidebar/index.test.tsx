import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { axe } from '@tests/axe.ts'

import { demoSections } from '@tests/shared/fixtures/layoutBranding.tsx'
import { AppSidebar } from '@components/layout/subcomponentes/AppSidebar/index.tsx'

const baseProps = { sections: demoSections, variant: 'permanent' as const, collapsed: false, open: false, onClose: vi.fn() }

describe('AppSidebar', () => {
  it('shows the brand in the sidebar header when it has a name', () => {
    renderWithProviders(<AppSidebar {...baseProps} brand="Aurora" />)

    expect(screen.getByRole('link', { name: 'Aurora' })).toBeInTheDocument()
  })

  it('has no header without a brand or a logo', () => {
    renderWithProviders(<AppSidebar {...baseProps} />)

    expect(screen.queryByRole('link', { name: 'Aurora' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Início' })).toBeInTheDocument()
  })

  it('hands className and style to the sidebar root', () => {
    const { container } = renderWithProviders(<AppSidebar {...baseProps} className="mine" style={{ color: 'rgb(255, 0, 0)' }} />)
    const root = container.querySelector('[data-slot="sidebar"]') as HTMLElement

    expect(root.className.split(' ')).toContain('mine')
    expect(root).toHaveStyle({ color: 'rgb(255, 0, 0)' })
  })

  it('keeps only the brand mark when collapsed', () => {
    renderWithProviders(<AppSidebar {...baseProps} brand="Aurora" collapsed />)

    expect(screen.getByRole('link', { name: 'Aurora' })).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = renderWithProviders(<AppSidebar {...baseProps} brand="Aurora" />)

    expect(await axe(container)).toHaveNoViolations()
  })
})
