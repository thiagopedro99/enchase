import { describeDialogContract } from '@tests/shared/contracts/dialogContract.tsx'
import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { axe } from '@tests/axe.ts'

import Navbar from '@components/navbar/index.tsx'

import type { DialogContractAdapter } from '@tests/shared/contracts/types.ts'

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
    await user.click(dialog.querySelector('a[href="/components"]') as HTMLElement)
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('marks the current page link', () => {
    renderWithProviders(<Navbar />, { route: '/components' })

    expect(screen.getByRole('link', { name: 'Components', hidden: true })).toHaveAttribute('aria-current', 'page')
  })

  it('has no axe violations while closed', async () => {
    const { container } = renderWithProviders(<Navbar />)

    expect(await axe(container)).toHaveNoViolations()
  })
})
