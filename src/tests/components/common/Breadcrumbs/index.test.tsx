import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { axe } from '@tests/axe.ts'

import { Breadcrumbs } from '@components/common/Breadcrumbs/index.tsx'

import type { BreadcrumbItem } from '@components/common/Breadcrumbs/types.ts'

const short: BreadcrumbItem[] = [
  { id: 'home', label: 'Início', to: '/' },
  { id: 'docs', label: 'Docs', to: '/docs' },
  { id: 'api', label: 'API' }
]

const long: BreadcrumbItem[] = [
  { id: 'a', label: 'Nível A', to: '/a' },
  { id: 'b', label: 'Nível B', to: '/b' },
  { id: 'c', label: 'Nível C', to: '/c' },
  { id: 'd', label: 'Nível D', to: '/d' },
  { id: 'e', label: 'Nível E', to: '/e' },
  { id: 'f', label: 'Nível F' }
]

describe('Breadcrumbs', () => {
  it('renders a labelled navigation with an ordered list', () => {
    renderWithProviders(<Breadcrumbs items={short} />)
    const nav = screen.getByRole('navigation', { name: 'Trilha de navegação' })

    expect(within(nav).getByRole('list')).toBeInTheDocument()
    expect(within(nav).getAllByRole('listitem')).toHaveLength(3)
    expect(nav.querySelector('ol')).not.toBeNull()
  })

  it('links every item except the last, which is the current page', () => {
    renderWithProviders(<Breadcrumbs items={short} />)

    expect(screen.getByRole('link', { name: 'Início' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute('href', '/docs')
    expect(screen.queryByRole('link', { name: 'API' })).not.toBeInTheDocument()
    expect(screen.getByText('API')).toHaveAttribute('aria-current', 'page')
  })

  it('does not link the last item even when it has a destination', () => {
    renderWithProviders(<Breadcrumbs items={[{ id: 'a', label: 'A', to: '/a' }, { id: 'b', label: 'B', to: '/b' }]} />)

    expect(screen.queryByRole('link', { name: 'B' })).not.toBeInTheDocument()
    expect(screen.getByText('B')).toHaveAttribute('aria-current', 'page')
  })

  it('supports in-page anchors and items without a destination', () => {
    renderWithProviders(
      <Breadcrumbs
        items={[
          { id: 'a', label: 'Âncora', href: '#secao' },
          { id: 'b', label: 'Sem destino' },
          { id: 'c', label: 'Atual' }
        ]}
      />
    )

    expect(screen.getByRole('link', { name: 'Âncora' })).toHaveAttribute('href', '#secao')
    expect(screen.queryByRole('link', { name: 'Sem destino' })).not.toBeInTheDocument()
    expect(screen.getByText('Sem destino')).toBeInTheDocument()
  })

  it('hides the separators from assistive technology', () => {
    const { container } = renderWithProviders(<Breadcrumbs items={short} />)

    expect(container.querySelectorAll('span[aria-hidden="true"]')).toHaveLength(2)
    expect(container.querySelectorAll('li > span[aria-hidden="true"] svg')).toHaveLength(2)
  })

  it('renders nothing for an empty trail', () => {
    renderWithProviders(<Breadcrumbs items={[]} />)

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('collapses a long trail to first, ellipsis and the last items', () => {
    renderWithProviders(<Breadcrumbs items={long} maxItems={4} />)

    expect(screen.getByRole('link', { name: 'Nível A' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mostrar caminho completo' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Nível B' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Nível C' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Nível E' })).toBeInTheDocument()
    expect(screen.getByText('Nível F')).toHaveAttribute('aria-current', 'page')
  })

  it('keeps short trails intact', () => {
    renderWithProviders(<Breadcrumbs items={short} maxItems={4} />)

    expect(screen.queryByRole('button', { name: 'Mostrar caminho completo' })).not.toBeInTheDocument()
  })

  it('reveals the full trail from the ellipsis and moves focus to the first revealed item', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Breadcrumbs items={long} maxItems={4} />)

    await user.click(screen.getByRole('button', { name: 'Mostrar caminho completo' }))

    expect(screen.queryByRole('button', { name: 'Mostrar caminho completo' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Nível B' })).toHaveFocus()
    expect(screen.getByRole('link', { name: 'Nível C' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Nível D' })).toBeInTheDocument()
  })

  it('is reachable by keyboard', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Breadcrumbs items={short} />)

    await user.tab()
    expect(screen.getByRole('link', { name: 'Início' })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveFocus()
  })

  it('accepts a custom and a configurable accessible name', () => {
    const { unmount } = renderWithProviders(<Breadcrumbs items={short} ariaLabel="Caminho" />)

    expect(screen.getByRole('navigation', { name: 'Caminho' })).toBeInTheDocument()

    unmount()
    renderWithProviders(<Breadcrumbs items={short} />, { labels: { breadcrumb: 'You are here' } })

    expect(screen.getByRole('navigation', { name: 'You are here' })).toBeInTheDocument()
  })

  it('has no axe violations collapsed or expanded', async () => {
    const user = userEvent.setup()
    const { container } = renderWithProviders(<Breadcrumbs items={long} maxItems={4} />)

    expect(await axe(container)).toHaveNoViolations()

    await user.click(screen.getByRole('button', { name: 'Mostrar caminho completo' }))

    expect(await axe(container)).toHaveNoViolations()
  })
})
