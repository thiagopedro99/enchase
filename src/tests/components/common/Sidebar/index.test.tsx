import { describeDialogContract } from '@tests/shared/contracts/dialogContract.tsx'
import { ControlledDialog } from '@tests/shared/contracts/dialogHarness.tsx'
import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { useState } from 'react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { HomeIcon } from '@components/common/Icon/icons/HomeIcon.tsx'
import { LayoutGridIcon } from '@components/common/Icon/icons/LayoutGridIcon.tsx'
import { axe } from '@tests/axe.ts'

import { ptBR } from '@locales/ptBR.ts'
import { Modal } from '@components/common/Modal/index.tsx'
import { Sidebar } from '@components/common/Sidebar/index.tsx'
import UIProvider from '@components/uiProvider/index.tsx'

import type { DialogContractAdapter } from '@tests/shared/contracts/types.ts'
import type { SidebarSection } from '@components/common/Sidebar/types.ts'

const sections: SidebarSection[] = [
  {
    id: 'app',
    title: 'Aplicação',
    items: [
      { id: 'home', label: 'Início', icon: <HomeIcon />, href: '/' },
      { id: 'components', label: 'Componentes', icon: <LayoutGridIcon />, href: '/components', badge: 'Novo' }
    ]
  },
  {
    id: 'guide',
    title: 'Nesta página',
    items: [
      { id: 'buttons', label: 'Botões', href: '#buttons' },
      { id: 'inputs', label: 'Campos', href: '#inputs' },
      { id: 'action', label: 'Executar ação' }
    ]
  }
]

describe('Sidebar (permanent)', () => {
  it('draws a decorative indicator behind the current item and none when nothing is current', () => {
    const { rerender } = renderWithProviders(<Sidebar sections={sections} currentHref="/components" />)
    const indicator = () => document.querySelector('[data-slot="sidebar-indicator"]') as HTMLElement

    expect(indicator()).toHaveAttribute('aria-hidden', 'true')
    expect(indicator()).toHaveAttribute('data-visible')

    rerender(<Sidebar sections={sections} currentHref="/nowhere" />)

    expect(indicator()).not.toHaveAttribute('data-visible')
  })

  it('renders a labelled navigation with a named list per section', () => {
    renderWithProviders(<Sidebar sections={sections} />)

    expect(screen.getByRole('navigation', { name: 'Navegação principal' })).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Aplicação' })).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Nesta página' })).toBeInTheDocument()
  })

  it('marks the current route with aria-current page and only matches / exactly', () => {
    renderWithProviders(<Sidebar sections={sections} />, { route: '/components' })

    expect(screen.getByRole('link', { name: /Componentes/ })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Início' })).not.toHaveAttribute('aria-current')
  })

  it('marks the active in-page anchor with aria-current location', () => {
    renderWithProviders(<Sidebar sections={sections} activeSectionId="inputs" />)

    expect(screen.getByRole('link', { name: 'Campos' })).toHaveAttribute('aria-current', 'location')
    expect(screen.getByRole('link', { name: 'Botões' })).not.toHaveAttribute('aria-current')
    expect(screen.getByRole('link', { name: 'Campos' })).toHaveAttribute('href', '#inputs')
  })

  it('renders a button item that runs its handler', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    renderWithProviders(<Sidebar sections={[{ id: 'a', items: [{ id: 'x', label: 'Executar ação', onClick }] }]} />)

    await user.click(screen.getByRole('button', { name: 'Executar ação' }))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('lets the header react to the collapsed state', () => {
    const { unmount } = renderWithProviders(<Sidebar sections={sections} header={({ collapsed }) => <span>{collapsed ? 'M' : 'Marca completa'}</span>} />)

    expect(screen.getByText('Marca completa')).toBeInTheDocument()

    unmount()
    renderWithProviders(<Sidebar sections={sections} collapsed header={({ collapsed }) => <span>{collapsed ? 'M' : 'Marca completa'}</span>} />)

    expect(screen.getByText('M')).toBeInTheDocument()
    expect(screen.queryByText('Marca completa')).not.toBeInTheDocument()
  })

  it('shows the badge and the header and footer slots', () => {
    renderWithProviders(<Sidebar sections={sections} header={<span>Marca</span>} footer={<span>Rodapé</span>} />)

    expect(screen.getByText('Novo')).toBeInTheDocument()
    expect(screen.getByText('Marca')).toBeInTheDocument()
    expect(screen.getByText('Rodapé')).toBeInTheDocument()
  })

  it('exposes a collapse toggle with expanded state and a configurable label', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    renderWithProviders(<Sidebar sections={sections} onToggleCollapsed={onToggle} />, { labels: { collapseSidebar: 'Collapse' } })

    const toggle = screen.getByRole('button', { name: 'Collapse' })
    expect(toggle).toHaveAttribute('aria-expanded', 'true')

    await user.click(toggle)

    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('keeps accessible names when collapsed and drops visible labels, titles and badges', () => {
    renderWithProviders(<Sidebar sections={sections} collapsed onToggleCollapsed={vi.fn()} />)

    expect(screen.getByRole('link', { name: 'Início' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Componentes' })).toBeInTheDocument()
    expect(screen.queryByText('Novo')).not.toBeInTheDocument()
    expect(screen.queryByText('Aplicação')).not.toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Aplicação' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Expandir menu lateral' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('shows a tooltip with the label on focus when collapsed, without duplicating the description', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Sidebar sections={sections} collapsed />)

    await user.tab()

    const link = screen.getByRole('link', { name: 'Início' })
    expect(link).toHaveFocus()
    expect(link).not.toHaveAttribute('aria-describedby')
    expect(await screen.findByText('Início', { selector: '[aria-hidden="true"]' })).toBeInTheDocument()
  })

  it('falls back to the initial letter when an item has no icon in the rail', () => {
    renderWithProviders(<Sidebar sections={sections} collapsed />)

    expect(screen.getByRole('link', { name: 'Botões' })).toHaveTextContent('B')
  })

  it('has no axe violations expanded', async () => {
    const { container } = renderWithProviders(<Sidebar sections={sections} header={<span>Marca</span>} onToggleCollapsed={vi.fn()} />)

    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no axe violations collapsed', async () => {
    const { container } = renderWithProviders(<Sidebar sections={sections} collapsed onToggleCollapsed={vi.fn()} />)

    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Sidebar navigation', () => {
  it('marks a route as the page and never marks a section anchor as the page', () => {
    renderWithProviders(<Sidebar sections={sections} />, { route: '/components' })

    expect(screen.getByRole('link', { name: /Componentes/ })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Botões' })).not.toHaveAttribute('aria-current')
  })

  it('does not mark a route as a location just because its id is the active section', () => {
    renderWithProviders(<Sidebar sections={sections} activeSectionId="home" />)

    expect(screen.getByRole('link', { name: 'Início' })).not.toHaveAttribute('aria-current', 'location')
  })

  it('lets the currentHref prop override the one of the provider', () => {
    render(
      <UIProvider currentHref="/">
        <Sidebar sections={sections} currentHref="/components" />
      </UIProvider>
    )

    expect(screen.getByRole('link', { name: /Componentes/ })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Início' })).not.toHaveAttribute('aria-current')
  })

  it('never marks an external, native or phone link as current', () => {
    const items = [
      { id: 'ext', label: 'Externo', href: 'https://example.com/docs' },
      { id: 'native', label: 'Nativo', href: '/docs/', native: true },
      { id: 'mail', label: 'Email', href: 'mailto:a@b.co' }
    ]
    render(
      <UIProvider currentHref="/docs/intro">
        <Sidebar sections={[{ id: 'a', items }]} />
      </UIProvider>
    )

    for (const name of ['Externo', 'Nativo', 'Email']) expect(screen.getByRole('link', { name })).not.toHaveAttribute('aria-current')
  })

  it('navigates through the provider when a route is chosen, and still runs the item handler', () => {
    const navigate = vi.fn()
    const onClick = vi.fn()
    render(
      <UIProvider navigate={navigate}>
        <Sidebar sections={[{ id: 'a', items: [{ id: 'docs', label: 'Docs', href: '/docs', onClick }] }]} />
      </UIProvider>
    )

    const notPrevented = fireEvent.click(screen.getByRole('link', { name: 'Docs' }))

    expect(navigate).toHaveBeenCalledWith('/docs')
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(notPrevented).toBe(false)
  })

  it('closes the drawer after choosing a route', () => {
    const navigate = vi.fn()
    const onClose = vi.fn()
    render(
      <UIProvider navigate={navigate}>
        <Sidebar variant="modal" open onClose={onClose} sections={[{ id: 'a', items: [{ id: 'docs', label: 'Docs', href: '/docs' }] }]} />
      </UIProvider>
    )

    fireEvent.click(screen.getByRole('link', { name: 'Docs' }))

    expect(navigate).toHaveBeenCalledWith('/docs')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('leaves a native item to the browser even when it looks like a route', () => {
    const navigate = vi.fn()
    render(
      <UIProvider navigate={navigate}>
        <Sidebar sections={[{ id: 'a', items: [{ id: 'docs', label: 'Docs', href: '/docs/', native: true }] }]} />
      </UIProvider>
    )

    const notPrevented = fireEvent.click(screen.getByRole('link', { name: 'Docs' }))

    expect(navigate).not.toHaveBeenCalled()
    expect(notPrevented).toBe(true)
  })

  it('leaves a section anchor to the browser', () => {
    const navigate = vi.fn()
    render(
      <UIProvider navigate={navigate}>
        <Sidebar sections={sections} />
      </UIProvider>
    )

    expect(fireEvent.click(screen.getByRole('link', { name: 'Campos' }))).toBe(true)
    expect(navigate).not.toHaveBeenCalled()
  })
})

const sidebarModalAdapter: DialogContractAdapter = {
  name: 'Sidebar modal',
  triggerName: 'Open',
  dialogName: 'Navegação mobile',
  render: () => (
    <ControlledDialog>
      {({ open, close }) => <Sidebar sections={sections} variant="modal" open={open} onClose={close} header={<span>Marca</span>} />}
    </ControlledDialog>
  )
}

describeDialogContract(sidebarModalAdapter)

describe('Sidebar (modal)', () => {
  it('renders nothing while closed', () => {
    renderWithProviders(<Sidebar sections={sections} variant="modal" open={false} onClose={vi.fn()} />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('shows the navigation inside the dialog', async () => {
    renderWithProviders(<Sidebar sections={sections} variant="modal" open onClose={vi.fn()} />)

    const dialog = await screen.findByRole('dialog', { name: 'Navegação mobile' })

    expect(within(dialog).getByRole('navigation')).toBeInTheDocument()
  })

  it('closes with the overlay and after choosing an item', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onClick = vi.fn()
    renderWithProviders(<Sidebar sections={[{ id: 'a', items: [{ id: 'x', label: 'Executar ação', onClick }] }]} variant="modal" open onClose={onClose} />)
    const dialog = await screen.findByRole('dialog')

    await user.click(dialog.previousElementSibling as HTMLElement)
    expect(onClose).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'Executar ação' }))
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(2)
  })
})

describe('Sidebar contract', () => {
  it('marks the permanent root with a slot, variant and state, merging className and style', () => {
    const { container, rerender } = renderWithProviders(<Sidebar sections={sections} className="mine" style={{ color: 'red' }} />)
    const root = container.querySelector('[data-slot="sidebar"]') as HTMLElement

    expect(root).toHaveAttribute('data-variant', 'permanent')
    expect(root).toHaveAttribute('data-state', 'expanded')
    expect(root.className.split(' ').at(-1)).toBe('mine')
    expect(root.style.color).toBe('red')

    rerender(<Sidebar sections={sections} collapsed />)

    expect(container.querySelector('[data-slot="sidebar"]')).toHaveAttribute('data-state', 'collapsed')
  })

  it('never sets or animates the width inline when collapsing', () => {
    const { container } = renderWithProviders(<Sidebar sections={sections} collapsed />)
    const root = container.querySelector('[data-slot="sidebar"]') as HTMLElement

    expect(root.style.width).toBe('')
    expect(root.style.inlineSize).toBe('')
    expect(root.style.transition).toBe('')
  })

  it('names the parts with slots', () => {
    const { container } = renderWithProviders(<Sidebar sections={sections} header={<span>Marca</span>} footer={<span>Rodapé</span>} onToggleCollapsed={vi.fn()} />)

    for (const name of ['sidebar-header', 'sidebar-nav', 'sidebar-section', 'sidebar-section-title', 'sidebar-item', 'sidebar-item-icon', 'sidebar-item-label', 'sidebar-item-badge', 'sidebar-footer', 'sidebar-collapse-button']) {
      expect(container.querySelector(`[data-slot="${name}"]`), name).toBeInTheDocument()
    }
    expect(screen.getByRole('button', { name: 'Executar ação' })).toHaveAttribute('data-slot', 'sidebar-item-control')
  })

  it('places the collapsed tooltip at the end side', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Sidebar sections={sections} collapsed />)

    await user.tab()

    expect(await screen.findByText('Início', { selector: '[aria-hidden="true"]' })).toHaveAttribute('data-position', 'right')
  })

  it('puts className and style on the modal panel and names the modal parts', async () => {
    const { container } = renderWithProviders(<Sidebar sections={sections} variant="modal" open onClose={vi.fn()} className="mine" style={{ color: 'red' }} />)
    const dialog = await screen.findByRole('dialog')

    expect(dialog).toHaveAttribute('data-slot', 'sidebar-panel')
    expect(dialog).toHaveAttribute('data-variant', 'modal')
    expect(dialog).toHaveClass('mine')
    expect(dialog.style.color).toBe('red')
    expect(dialog.previousElementSibling).toHaveAttribute('data-slot', 'sidebar-overlay')
    expect(container.querySelector('[data-slot="sidebar"][data-variant="modal"]')).toBeInTheDocument()
    await waitFor(() => expect(dialog).toHaveAttribute('data-state', 'open'))
  })

  it('slides from the start side by the drawer width and flips in rtl', async () => {
    const { unmount } = renderWithProviders(<Sidebar sections={sections} variant="modal" open onClose={vi.fn()} />)

    const ltr = (await screen.findByRole('dialog')).style

    expect(ltr.getPropertyValue('--enchase-sidebar-dx')).toBe('-1')
    expect(ltr.getPropertyValue('--enchase-sidebar-distance')).toBe('300px')

    unmount()
    renderWithProviders(<Sidebar sections={sections} variant="modal" open onClose={vi.fn()} />, { locale: { ...ptBR, dir: 'rtl' } })

    expect((await screen.findByRole('dialog')).style.getPropertyValue('--enchase-sidebar-dx')).toBe('1')
  })

  it('turns the presence variables to zero when the animation is off', async () => {
    renderWithProviders(<Sidebar sections={sections} variant="modal" open onClose={vi.fn()} animation={false} />)
    const dialog = await screen.findByRole('dialog')

    expect(dialog.style.getPropertyValue('--enchase-sidebar-duration')).toBe('0ms')
    expect(dialog.style.getPropertyValue('--enchase-sidebar-distance')).toBe('0px')
  })

  it('stays mounted while exiting and unmounts after the exit time', async () => {
    let setOpenOutside: (open: boolean) => void = () => undefined
    const Harness = () => {
      const [open, setOpen] = useState(true)
      setOpenOutside = setOpen

      return <Sidebar sections={sections} variant="modal" open={open} onClose={() => setOpen(false)} />
    }
    renderWithProviders(<Harness />)
    await screen.findByRole('dialog')

    act(() => setOpenOutside(false))

    expect(screen.getByRole('dialog', { hidden: true })).toHaveAttribute('data-state', 'exiting')
    await waitFor(() => expect(screen.queryByRole('dialog', { hidden: true })).not.toBeInTheDocument(), { timeout: 2000 })
  })

  it('closes only the modal on top when a modal is open over the drawer', async () => {
    const user = userEvent.setup()
    const closeDrawer = vi.fn()
    const closeModal = vi.fn()
    render(
      <>
        <Sidebar sections={sections} variant="modal" open onClose={closeDrawer} />
        <Modal isOpen onClose={closeModal} title="Sobre o menu">
          <p>conteúdo</p>
        </Modal>
      </>
    )
    await screen.findAllByRole('dialog', { hidden: true })

    await user.keyboard('{Escape}')

    expect(closeModal).toHaveBeenCalledTimes(1)
    expect(closeDrawer).not.toHaveBeenCalled()
  })
})
