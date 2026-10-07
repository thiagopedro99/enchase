import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { describeDialogContract } from '@tests/shared/contracts/dialogContract.tsx'
import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import { navigationSections } from '@tests/shared/fixtures/navigationSections.ts'
import { pageSections } from '@tests/shared/fixtures/pageSections.ts'
import { screen, waitFor, within } from '@testing-library/react'
import { setViewportWidth } from '@tests/viewport.ts'
import userEvent from '@testing-library/user-event'
import { axe } from '@tests/axe.ts'

import { useAppStore } from '@stores/app/index.ts'
import { docsUrl } from '@components/layout/defaultData.ts'
import Layout from '@components/layout/index.tsx'

import type { DialogContractAdapter } from '@tests/shared/contracts/types.ts'

const page = (props: Partial<Parameters<typeof Layout>[0]> = {}) => (
  <Layout pageTitle="Teste" navigationSections={navigationSections} {...props}>
    <h1>Conteúdo</h1>
  </Layout>
)

beforeEach(() => {
  setViewportWidth(1280)
  useAppStore.setState({ sidebarOpen: false, sidebarCollapsed: false })
})

afterEach(() => setViewportWidth(1024))

describe('Layout with sidebar (default, desktop)', () => {
  it('shows the persistent sidebar and an app bar with the menu button, breadcrumb and theme toggle', () => {
    renderWithProviders(page(), { route: '/components' })
    const banner = screen.getByRole('banner')

    expect(screen.getByRole('navigation', { name: 'Navegação principal' })).toBeInTheDocument()
    expect(within(banner).getByRole('button', { name: 'Recolher menu lateral' })).toBeInTheDocument()
    expect(within(banner).getByRole('navigation', { name: 'Trilha de navegação' })).toBeInTheDocument()
    expect(within(banner).getByRole('button', { name: 'Mudar para tema escuro' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Abrir menu' })).not.toBeInTheDocument()
  })

  it('exposes banner, navigation, main and contentinfo landmarks and sets the document title', () => {
    renderWithProviders(page({ pageTitle: 'Minha página' }))

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    expect(document.title).toBe('Minha página · Enchase')
  })

  it('credits the project and its license in the footer with the current year', () => {
    renderWithProviders(page())

    expect(screen.getByRole('contentinfo')).toHaveTextContent(`© ${new Date().getFullYear()} Enchase. Licença MIT.`)
  })

  it('puts the brand after the page title in the document title', () => {
    renderWithProviders(page({ pageTitle: 'Painel', brand: 'Aurora' }))

    expect(document.title).toBe('Painel · Aurora')
  })

  it('offers the documentation as a plain link in the default navigation', () => {
    renderWithProviders(
      <Layout pageTitle="Teste">
        <h1>Conteúdo</h1>
      </Layout>
    )
    const nav = screen.getByRole('navigation', { name: 'Navegação principal' })

    expect(within(nav).getByRole('link', { name: 'Início' })).toHaveAttribute('href', '/')
    expect(within(nav).getByRole('link', { name: 'Documentação' })).toHaveAttribute('href', docsUrl)
  })

  it('hides the breadcrumb when the trail has a single item', () => {
    renderWithProviders(page())

    expect(screen.queryByRole('navigation', { name: 'Trilha de navegação' })).not.toBeInTheDocument()
    expect(within(screen.getByRole('banner')).getByRole('button', { name: 'Mudar para tema escuro' })).toBeInTheDocument()
  })

  it('starts with a skip link and puts the menu button before the sidebar in the focus order', async () => {
    const user = userEvent.setup()
    renderWithProviders(page())

    await user.tab()
    const skip = screen.getByRole('link', { name: 'Pular para o conteúdo' })
    expect(skip).toHaveFocus()
    expect(skip).toHaveAttribute('href', `#${screen.getByRole('main').id}`)

    await user.tab()
    expect(screen.getByRole('button', { name: 'Recolher menu lateral' })).toHaveFocus()
  })

  it('lists the default routes and marks the current one', () => {
    renderWithProviders(page(), { route: '/getting-started' })
    const nav = screen.getByRole('navigation', { name: 'Navegação principal' })

    expect(within(nav).getByRole('link', { name: 'Primeiros passos' })).toHaveAttribute('aria-current', 'page')
    expect(within(nav).getByRole('link', { name: 'Início' })).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: 'Componentes' })).toBeInTheDocument()
  })

  it('appends page sections and marks the active one', () => {
    renderWithProviders(page({ pageSections, activePageSectionId: 'usage' }))
    const nav = screen.getByRole('navigation', { name: 'Navegação principal' })

    expect(within(nav).getByRole('list', { name: 'Nesta página' })).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: 'Uso' })).toHaveAttribute('aria-current', 'location')
    expect(within(nav).getByRole('link', { name: 'Introdução' })).not.toHaveAttribute('aria-current')
  })

  it('accepts custom navigation sections and brand', () => {
    renderWithProviders(page({ brand: 'Aurora', navigationSections: [{ id: 'x', title: 'Menu', items: [{ id: 'a', label: 'Painel', to: '/painel' }] }] }))
    const nav = screen.getByRole('navigation', { name: 'Navegação principal' })

    expect(within(nav).getByRole('link', { name: 'Painel' })).toBeInTheDocument()
    expect(within(nav).queryByRole('link', { name: 'Início' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Aurora/ })).toBeInTheDocument()
  })

  it('shows the brand mark with the name in the sidebar and keeps only the mark when collapsed', () => {
    const { unmount } = renderWithProviders(page())
    const brandLink = screen.getByRole('link', { name: 'Enchase' })

    expect(brandLink.querySelector('img')).toHaveAttribute('src', '/enchase-marca.svg')
    expect(brandLink.querySelector('img')).toHaveAttribute('alt', '')

    unmount()
    useAppStore.setState({ sidebarCollapsed: true })
    renderWithProviders(page())

    const collapsedLink = screen.getByRole('link', { name: 'Enchase' })
    expect(collapsedLink.querySelector('img')).toHaveAttribute('src', '/enchase-marca.svg')
    expect(collapsedLink).toHaveTextContent('Enchase')
  })

  it('accepts a custom brand logo and falls back to the initial letter without one', () => {
    const { unmount } = renderWithProviders(page({ brand: 'Aurora', brandLogo: '/aurora.svg' }))

    expect(screen.getByRole('link', { name: 'Aurora' }).querySelector('img')).toHaveAttribute('src', '/aurora.svg')

    unmount()
    renderWithProviders(page({ brand: 'Aurora', brandLogo: '' }))

    const link = screen.getByRole('link', { name: /Aurora/ })
    expect(link.querySelector('img')).toBeNull()
    expect(link).toHaveTextContent('A')
  })

  it('collapses and expands from the app bar button, keeping the state in sync and controlling the sidebar', async () => {
    const user = userEvent.setup()
    renderWithProviders(page())
    const button = screen.getByRole('button', { name: 'Recolher menu lateral' })

    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(document.getElementById(button.getAttribute('aria-controls') as string)).toBeInTheDocument()

    await user.click(button)

    expect(useAppStore.getState().sidebarCollapsed).toBe(true)
    const expand = screen.getByRole('button', { name: 'Expandir menu lateral' })
    expect(expand).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByRole('link', { name: 'Componentes' })).toBeInTheDocument()

    await user.click(expand)

    expect(useAppStore.getState().sidebarCollapsed).toBe(false)
  })

  it('shows the menu-open icon while expanded and the hamburger once collapsed', async () => {
    const user = userEvent.setup()
    renderWithProviders(page())
    const banner = screen.getByRole('banner')

    expect(banner.querySelector('[data-icon="menu-open"]')).toBeInTheDocument()

    await user.click(within(banner).getByRole('button', { name: 'Recolher menu lateral' }))

    await waitFor(() => expect(banner.querySelector('.lucide-menu')).toBeInTheDocument())
    expect(banner.querySelector('[data-icon="menu-open"]')).not.toBeInTheDocument()
  })

  it('no longer renders a collapse button inside the sidebar', () => {
    renderWithProviders(page())
    const nav = screen.getByRole('navigation', { name: 'Navegação principal' })

    expect(within(nav.parentElement as HTMLElement).queryByRole('button', { name: /menu lateral/ })).not.toBeInTheDocument()
  })

  it('derives the breadcrumb from the current route', () => {
    renderWithProviders(page(), { route: '/getting-started' })
    const trail = screen.getByRole('navigation', { name: 'Trilha de navegação' })

    expect(within(trail).getByRole('link', { name: 'Início' })).toHaveAttribute('href', '/')
    expect(within(trail).getByText('Primeiros passos')).toHaveAttribute('aria-current', 'page')
  })

  it('adds the active page section to the derived breadcrumb', () => {
    renderWithProviders(page({ pageSections, activePageSectionId: 'usage' }), { route: '/components' })
    const trail = screen.getByRole('navigation', { name: 'Trilha de navegação' })

    expect(within(trail).getByRole('link', { name: 'Início' })).toBeInTheDocument()
    expect(within(trail).getByRole('link', { name: 'Componentes' })).toHaveAttribute('href', '/components')
    expect(within(trail).getByText('Uso')).toHaveAttribute('aria-current', 'page')
  })

  it('uses explicit breadcrumbs when provided', () => {
    renderWithProviders(
      page({
        breadcrumbs: [
          { id: 'a', label: 'Projetos', to: '/projetos' },
          { id: 'b', label: 'Aurora' }
        ]
      })
    )
    const trail = screen.getByRole('navigation', { name: 'Trilha de navegação' })

    expect(within(trail).getByRole('link', { name: 'Projetos' })).toBeInTheDocument()
    expect(within(trail).getByText('Aurora')).toHaveAttribute('aria-current', 'page')
    expect(within(trail).queryByText('Início')).not.toBeInTheDocument()
  })

  it('hides the navigation and the app bar with hideNavbar', () => {
    renderWithProviders(page({ hideNavbar: true }))

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    expect(screen.queryByRole('banner')).not.toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = renderWithProviders(page({ pageSections, activePageSectionId: 'intro' }))

    expect(await axe(container)).toHaveNoViolations()
  })
})

const layoutDrawerAdapter: DialogContractAdapter = {
  name: 'Layout mobile drawer',
  triggerName: 'Abrir menu',
  dialogName: 'Navegação mobile',
  render: () => page(),
  before: () => setViewportWidth(500)
}

describeDialogContract(layoutDrawerAdapter)

describe('Layout with sidebar (mobile)', () => {
  beforeEach(() => setViewportWidth(500))

  it('shows the app bar with the menu button, breadcrumb and theme toggle, and no permanent sidebar', () => {
    renderWithProviders(page(), { route: '/components' })
    const banner = screen.getByRole('banner')

    expect(within(banner).getByRole('button', { name: 'Abrir menu' })).toHaveAttribute('aria-expanded', 'false')
    expect(within(banner).getByRole('navigation', { name: 'Trilha de navegação' })).toBeInTheDocument()
    expect(within(banner).getByRole('button', { name: 'Mudar para tema escuro' })).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Navegação principal' })).not.toBeInTheDocument()
  })

  it('wires the menu button state to the modal drawer', async () => {
    const user = userEvent.setup()
    renderWithProviders(page())
    const button = screen.getByRole('button', { name: 'Abrir menu' })

    await user.click(button)
    const dialog = await screen.findByRole('dialog', { name: 'Navegação mobile' })

    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(button).toHaveAttribute('aria-haspopup', 'dialog')
    expect(button.getAttribute('aria-controls')).toBe(dialog.id)
  })

  it('closes the drawer after choosing a destination', async () => {
    const user = userEvent.setup()
    renderWithProviders(page())

    await user.click(screen.getByRole('button', { name: 'Abrir menu' }))
    await user.click(await screen.findByRole('link', { name: 'Componentes' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('has no axe violations while the drawer is closed', async () => {
    const { container } = renderWithProviders(page())

    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Layout with navbar option', () => {
  it('shows the classic navbar, with no sidebar, menu toggle or breadcrumb', () => {
    renderWithProviders(page({ navigation: 'navbar' }))

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Recolher menu lateral' })).not.toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Trilha de navegação' })).not.toBeInTheDocument()
  })

  it('exposes banner, main and contentinfo landmarks', () => {
    renderWithProviders(page({ navigation: 'navbar' }))

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = renderWithProviders(page({ navigation: 'navbar' }))

    expect(await axe(container)).toHaveNoViolations()
  })
})
