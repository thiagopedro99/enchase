import { describeDialogContract } from '@tests/shared/contracts/dialogContract.tsx'
import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { setViewportWidth } from '@tests/viewport.ts'
import { useState } from 'react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { axe } from '@tests/axe.ts'

import { ptBR } from '@locales/ptBR.ts'
import { ColorModeProvider } from '@components/colorMode/index.tsx'
import UIProvider from '@components/uiProvider/index.tsx'
import { Modal } from '@components/common/Modal/index.tsx'
import Navbar from '@components/navbar/index.tsx'

import type { SidebarSection } from '@components/common/Sidebar/types.ts'

import type { DialogContractAdapter } from '@tests/shared/contracts/types.ts'

const sections: SidebarSection[] = [
  {
    id: 'main',
    items: [
      { id: 'home', label: 'Início', href: '/' },
      { id: 'docs', label: 'Docs', href: '/docs' },
      { id: 'intro', label: 'Introdução', href: '#intro' },
      { id: 'storybook', label: 'Storybook', href: '/storybook/', native: true },
      { id: 'action', label: 'Sem destino' }
    ]
  },
  { id: 'extra', title: 'Extra', items: [{ id: 'api', label: 'API', href: '/api' }] }
]

const navbarDrawerAdapter: DialogContractAdapter = {
  name: 'Navbar drawer',
  triggerName: 'Abrir menu',
  dialogName: 'Navegação mobile',
  render: () => <Navbar />
}

describeDialogContract(navbarDrawerAdapter)

describe('Navbar', () => {
  it('uses banner and labelled navigation landmarks without nesting navs', () => {
    renderWithProviders(<Navbar />)

    expect(screen.getByRole('banner')).toBeInTheDocument()
    const navigations = screen.getAllByRole('navigation', { hidden: true })

    expect(navigations).toHaveLength(1)
    expect(navigations[0]).toHaveAttribute('aria-label', 'Navegação principal')
  })

  it('lays out the logo first and the actions last, with the theme toggle among them', () => {
    renderWithProviders(<Navbar />)
    const logo = screen.getByRole('link', { name: 'Logo' })
    const bar = logo.parentElement as HTMLElement
    const actions = bar.lastElementChild as HTMLElement

    expect(bar.firstElementChild).toBe(logo)
    expect(actions).toContainElement(screen.getByRole('button', { name: 'Mudar para tema escuro' }))
  })

  it('exposes the mobile menu button state with expanded and controls', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Navbar />)
    const button = screen.getByRole('button', { name: 'Abrir menu' })

    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(button).toHaveAttribute('aria-haspopup', 'dialog')

    await user.click(button)

    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(button.getAttribute('aria-controls')).toBe((await screen.findByRole('dialog')).id)
  })

  it('does not render off-screen mobile links while closed', () => {
    renderWithProviders(<Navbar />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Home', hidden: true })).toHaveLength(1)
  })

  it('updates aria-expanded back to false when the drawer closes with Escape', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Navbar />)
    const button = screen.getByRole('button', { name: 'Abrir menu' })

    await user.click(button)
    await screen.findByRole('dialog')
    await user.keyboard('{Escape}')

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('makes the header inert while the drawer is open', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Navbar />)

    await user.click(screen.getByRole('button', { name: 'Abrir menu' }))
    await screen.findByRole('dialog')

    expect(screen.getByRole('banner')).toHaveAttribute('inert')
  })

  it('closes the drawer with its close button and when a link is chosen', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Navbar />)

    await user.click(screen.getByRole('button', { name: 'Abrir menu' }))
    await user.click(await screen.findByRole('button', { name: 'Fechar menu' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'Abrir menu' }))
    const dialog = await screen.findByRole('dialog')
    await user.click(dialog.querySelector('a[href="/"]') as HTMLElement)
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('marks the current page link', () => {
    renderWithProviders(<Navbar />, { route: '/' })

    expect(screen.getByRole('link', { name: 'Home', hidden: true })).toHaveAttribute('aria-current', 'page')
  })

  it('renders the links of every section and skips items without a destination', () => {
    renderWithProviders(<Navbar sections={sections} />)
    const nav = screen.getByRole('navigation', { name: 'Navegação principal', hidden: true })

    expect(within(nav).getAllByRole('link', { hidden: true }).map((link) => link.textContent)).toEqual(['Início', 'Docs', 'Introdução', 'Storybook', 'API'])
    expect(within(nav).queryByText('Sem destino')).not.toBeInTheDocument()
  })

  it('marks routes with page, sections with location, and never native links', () => {
    renderWithProviders(<Navbar sections={sections} activeSectionId="intro" />, { route: '/docs/guide' })
    const nav = screen.getByRole('navigation', { name: 'Navegação principal', hidden: true })
    const current = (name: string) => within(nav).getByRole('link', { name, hidden: true }).getAttribute('aria-current')

    expect(current('Docs')).toBe('page')
    expect(current('Introdução')).toBe('location')
    expect(current('Início')).toBeNull()
    expect(current('Storybook')).toBeNull()
    expect(current('API')).toBeNull()
  })

  it('marks hash links of the current page as locations, never as the current page', () => {
    const anchors: SidebarSection[] = [
      {
        id: 'main',
        items: [
          { id: 'recursos', label: 'Recursos', href: '/#recursos' },
          { id: 'contato', label: 'Contato', href: '/#contato' },
          { id: 'sobre', label: 'Sobre', href: '/sobre#equipe' }
        ]
      }
    ]
    renderWithProviders(<Navbar sections={anchors} activeSectionId="contato" />, { route: '/' })
    const nav = screen.getByRole('navigation', { name: 'Navegação principal', hidden: true })
    const current = (name: string) => within(nav).getByRole('link', { name, hidden: true }).getAttribute('aria-current')

    expect(current('Recursos')).toBeNull()
    expect(current('Contato')).toBe('location')
    expect(current('Sobre')).toBeNull()
  })

  it('navigates through the provider from the logo and the menu links', () => {
    const navigate = vi.fn()
    render(
      <ColorModeProvider storage={null}>
        <UIProvider navigate={navigate} currentHref="/">
          <Navbar sections={sections} />
        </UIProvider>
      </ColorModeProvider>
    )

    fireEvent.click(screen.getByRole('link', { name: 'Logo' }))
    fireEvent.click(screen.getByRole('link', { name: 'Docs', hidden: true }))
    fireEvent.click(screen.getByRole('link', { name: 'Storybook', hidden: true }))

    expect(navigate.mock.calls).toEqual([['/'], ['/docs']])
  })

  it('accepts a node as the logo and names the link from its text', () => {
    renderWithProviders(
      <Navbar
        logo={
          <>
            <img src="/marca.svg" alt="" data-testid="mark" />
            <span>Acme</span>
          </>
        }
      />
    )
    const link = screen.getByRole('link', { name: 'Acme' })

    expect(link).toContainElement(screen.getByTestId('mark'))
    expect(link).toHaveAttribute('data-slot', 'navbar-logo')
  })

  it('points the logo to logoHref and navigates there through the provider', () => {
    const navigate = vi.fn()
    render(
      <ColorModeProvider storage={null}>
        <UIProvider navigate={navigate} currentHref="/">
          <Navbar logoHref="/inicio" />
        </UIProvider>
      </ColorModeProvider>
    )
    const logo = screen.getByRole('link', { name: 'Logo' })

    expect(logo).toHaveAttribute('href', '/inicio')

    fireEvent.click(logo)

    expect(navigate).toHaveBeenCalledWith('/inicio')
  })

  it('navigates and closes the drawer when a drawer link is chosen', async () => {
    const user = userEvent.setup()
    const navigate = vi.fn()
    render(
      <ColorModeProvider storage={null}>
        <UIProvider navigate={navigate} locale={ptBR}>
          <Navbar sections={sections} />
        </UIProvider>
      </ColorModeProvider>
    )

    await user.click(screen.getByRole('button', { name: 'Abrir menu' }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('link', { name: 'Docs' }))

    expect(navigate).toHaveBeenCalledWith('/docs')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('has no axe violations while closed', async () => {
    const { container } = renderWithProviders(<Navbar />)

    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Navbar actions', () => {
  afterEach(() => setViewportWidth(1024))

  const enter = <button type="button">Entrar</button>

  it('puts the actions between the menu and the theme toggle on a wide screen', () => {
    setViewportWidth(1280)
    const { container } = renderWithProviders(<Navbar sections={sections} actions={enter} />)
    const cta = container.querySelector('[data-slot="navbar-cta"]') as HTMLElement
    const menu = container.querySelector('[data-slot="navbar-menu"]') as HTMLElement
    const toggle = screen.getByRole('button', { name: 'Mudar para tema escuro' })

    expect(within(cta).getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
    expect(cta.parentElement).toBe(menu.parentElement)
    expect(menu.compareDocumentPosition(cta) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(cta.compareDocumentPosition(toggle) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('renders no actions container without the prop', () => {
    const { container } = renderWithProviders(<Navbar />)

    expect(container.querySelector('[data-slot="navbar-cta"]')).toBeNull()
  })

  it('keeps the actions out of the bar on a compact screen and shows them under the links inside the drawer', async () => {
    setViewportWidth(500)
    const user = userEvent.setup()
    const { container } = renderWithProviders(<Navbar sections={sections} actions={enter} />)

    expect(container.querySelector('[data-slot="navbar-cta"]')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Entrar' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Abrir menu' }))
    const dialog = await screen.findByRole('dialog')
    const cta = dialog.querySelector('[data-slot="navbar-drawer-cta"]') as HTMLElement

    expect(within(cta).getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
    expect(dialog.querySelector('[data-slot="navbar-drawer-nav"]')?.nextElementSibling).toBe(cta)
  })

  it('closes the drawer when a link inside the actions is chosen, but not for a button', async () => {
    setViewportWidth(500)
    const user = userEvent.setup()
    renderWithProviders(
      <Navbar
        actions={
          <>
            <button type="button">Entrar</button>
            <a href="#contato">Contato</a>
          </>
        }
      />
    )

    await user.click(screen.getByRole('button', { name: 'Abrir menu' }))
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Entrar' }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.click(within(screen.getByRole('dialog')).getByRole('link', { name: 'Contato' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('has no axe violations with actions in the bar', async () => {
    setViewportWidth(1280)
    const { container } = renderWithProviders(<Navbar actions={enter} />)

    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Navbar contract', () => {
  it('marks the root and the parts with slots, merging className and style', () => {
    const { container } = renderWithProviders(<Navbar sections={sections} className="mine" style={{ color: 'red' }} />)
    const root = container.querySelector('header') as HTMLElement

    expect(root).toHaveAttribute('data-slot', 'navbar')
    expect(root.className.split(' ').at(-1)).toBe('mine')
    expect(root.style.color).toBe('red')
    for (const name of ['navbar-bar', 'navbar-logo', 'navbar-actions', 'navbar-menu', 'navbar-menu-button']) {
      expect(container.querySelector(`[data-slot="${name}"]`), name).toBeInTheDocument()
    }
  })

  it('names the drawer parts and goes through entering and open', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Navbar sections={sections} />)

    await user.click(screen.getByRole('button', { name: 'Abrir menu' }))
    const dialog = await screen.findByRole('dialog')

    expect(dialog).toHaveAttribute('data-slot', 'navbar-drawer')
    expect(dialog.previousElementSibling).toHaveAttribute('data-slot', 'navbar-overlay')
    expect(within(dialog).getByRole('button', { name: 'Fechar menu' })).toHaveAttribute('data-slot', 'navbar-drawer-close')
    expect(within(dialog).getByRole('navigation')).toHaveAttribute('data-slot', 'navbar-drawer-nav')
    await waitFor(() => expect(dialog).toHaveAttribute('data-state', 'open'))
  })

  it('slides in from the end side by the drawer distance and flips in rtl', async () => {
    const user = userEvent.setup()
    const { unmount } = renderWithProviders(<Navbar sections={sections} />)

    await user.click(screen.getByRole('button', { name: 'Abrir menu' }))
    const ltr = (await screen.findByRole('dialog')).style

    expect(ltr.getPropertyValue('--enchase-navbar-dx')).toBe('1')
    expect(ltr.getPropertyValue('--enchase-navbar-distance')).toBe('280px')

    unmount()
    renderWithProviders(<Navbar sections={sections} />, { locale: { ...ptBR, dir: 'rtl' } })
    await user.click(screen.getByRole('button', { name: 'Abrir menu' }))

    expect((await screen.findByRole('dialog')).style.getPropertyValue('--enchase-navbar-dx')).toBe('-1')
  })

  it('stays mounted while exiting and unmounts after the exit time', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Navbar sections={sections} />)

    await user.click(screen.getByRole('button', { name: 'Abrir menu' }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Fechar menu' }))

    expect(screen.getByRole('dialog', { hidden: true })).toHaveAttribute('data-state', 'exiting')
    await waitFor(() => expect(screen.queryByRole('dialog', { hidden: true })).not.toBeInTheDocument(), { timeout: 2000 })
  })

  it('keeps the drawer open when Escape closes a modal opened over it', async () => {
    const user = userEvent.setup()
    const Harness = () => {
      const [modal, setModal] = useState(false)

      return (
        <>
          <Navbar sections={sections} />
          <button onClick={() => setModal(true)}>Abrir modal</button>
          <Modal isOpen={modal} onClose={() => setModal(false)} title="Sobre o menu">
            <p>conteúdo</p>
          </Modal>
        </>
      )
    }
    renderWithProviders(<Harness />)

    await user.click(screen.getByRole('button', { name: 'Abrir menu' }))
    await screen.findByRole('dialog', { name: 'Navegação mobile' })
    act(() => screen.getByRole('button', { name: 'Abrir modal', hidden: true }).click())
    await screen.findByRole('dialog', { name: 'Sobre o menu' })

    await user.keyboard('{Escape}')

    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Sobre o menu', hidden: true })).not.toBeInTheDocument(), { timeout: 2000 })
    expect(screen.getByRole('dialog', { name: 'Navegação mobile', hidden: true })).toHaveAttribute('data-state', 'open')
  })
})
