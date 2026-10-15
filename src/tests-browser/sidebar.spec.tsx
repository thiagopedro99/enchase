import { render } from '@testing-library/react'
import { exceptWebkit } from './browserSkips.ts'
import { useState } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { ColorModeProvider } from '@components/colorMode/index.tsx'
import { Modal } from '@components/common/Modal/index.tsx'
import { Sidebar } from '@components/common/Sidebar/index.tsx'
import UIProvider from '@components/uiProvider/index.tsx'
import Navbar from '@components/navbar/index.tsx'
import Layout from '@components/layout/index.tsx'
import { GlobalStyles } from '@styles/react.tsx'
import { ptBR } from '@locales/ptBR.ts'
import { demoSections } from '@tests/shared/fixtures/layoutBranding.tsx'
import { renderInBrowser } from './harness.tsx'

import type { ReactElement } from 'react'

const renderRtl = (ui: ReactElement) =>
  render(
    <ColorModeProvider defaultMode="light" storage={null}>
      <GlobalStyles />
      <UIProvider locale={{ ...ptBR, dir: 'rtl' }} motion={{ mode: 'never' }} navigate={() => undefined} currentHref="/">
        {ui}
      </UIProvider>
    </ColorModeProvider>
  )

const added: HTMLStyleElement[] = []

const addStyle = (css: string, where: 'start' | 'end') => {
  const style = document.createElement('style')
  style.textContent = css
  if (where === 'start') document.head.prepend(style)
  else document.head.append(style)
  added.push(style)
}

afterEach(async () => {
  added.splice(0).forEach((style) => style.remove())
  document.documentElement.removeAttribute('dir')
  await page.viewport(1280, 800)
})

const DrawerPage = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)}>Abrir</button>
      <main>
        <button>Atrás</button>
      </main>
      <Sidebar variant="modal" open={open} onClose={() => setOpen(false)} sections={demoSections} />
    </>
  )
}

const NavbarModalPage = () => {
  const [modal, setModal] = useState(false)

  return (
    <>
      <Navbar sections={demoSections} />
      <main>
        <button>Atrás</button>
      </main>
      <Modal isOpen={modal} onClose={() => setModal(false)} title="Sobre o menu">
        <input aria-label="Nome" />
      </Modal>
      <button onClick={() => setModal(true)}>Abrir modal</button>
    </>
  )
}

const dialogOf = (name: string) => page.getByRole('dialog', { name }).element() as HTMLElement

describe('Sidebar drawer in a real browser', () => {
  exceptWebkit('webkitFocus')('moves focus into the drawer, traps Tab and makes the page inert', async () => {
    renderInBrowser(<DrawerPage />)
    await userEvent.click(page.getByRole('button', { name: 'Abrir' }))
    await expect.element(page.getByRole('dialog')).toBeVisible()
    const drawer = dialogOf('Navegação mobile')

    expect(drawer.contains(document.activeElement)).toBe(true)
    for (let round = 0; round < 6; round += 1) {
      await userEvent.tab()
      expect(drawer.contains(document.activeElement)).toBe(true)
    }

    const behind = page.getByRole('button', { name: 'Atrás', includeHidden: true }).element() as HTMLButtonElement
    expect(behind.closest('[inert]')).not.toBeNull()
  })

  exceptWebkit('webkitFocus')('closes with Escape and gives the focus back to the trigger', async () => {
    renderInBrowser(<DrawerPage />)
    const trigger = page.getByRole('button', { name: 'Abrir' })
    await userEvent.click(trigger)
    await expect.element(page.getByRole('dialog')).toBeVisible()

    await userEvent.keyboard('{Escape}')

    await expect.poll(() => page.getByRole('dialog').elements().length).toBe(0)
    await expect.poll(() => document.activeElement).toBe(trigger.element())
  })

  it('lands on the left edge in left-to-right and on the right edge in right-to-left', async () => {
    renderInBrowser(<DrawerPage />)
    await userEvent.click(page.getByRole('button', { name: 'Abrir' }))
    await expect.poll(() => dialogOf('Navegação mobile').getAttribute('data-state')).toBe('open')
    await expect.poll(() => Math.round(dialogOf('Navegação mobile').getBoundingClientRect().left)).toBe(0)

    await userEvent.keyboard('{Escape}')
    await expect.poll(() => page.getByRole('dialog').elements().length).toBe(0)
  })

  it('lands on the right edge in right-to-left', async () => {
    document.documentElement.dir = 'rtl'
    renderRtl(<DrawerPage />)
    await userEvent.click(page.getByRole('button', { name: 'Abrir' }))
    await expect.poll(() => dialogOf('Navegação mobile').getAttribute('data-state')).toBe('open')
    await expect.poll(() => Math.round(dialogOf('Navegação mobile').getBoundingClientRect().right)).toBe(document.documentElement.clientWidth)
  })
})

describe('Navbar drawer in a real browser', () => {
  exceptWebkit('webkitFocus')('opens a focus-trapped drawer on a narrow viewport and closes it with Escape', async () => {
    await page.viewport(600, 800)
    renderInBrowser(<NavbarModalPage />)
    const trigger = page.getByRole('button', { name: 'Abrir menu' })
    await userEvent.click(trigger)
    await expect.element(page.getByRole('dialog', { name: 'Navegação mobile' })).toBeVisible()
    const drawer = dialogOf('Navegação mobile')

    expect(drawer.contains(document.activeElement)).toBe(true)
    for (let round = 0; round < 6; round += 1) {
      await userEvent.tab()
      expect(drawer.contains(document.activeElement)).toBe(true)
    }

    await userEvent.keyboard('{Escape}')
    await expect.poll(() => page.getByRole('dialog').elements().length).toBe(0)
    await expect.poll(() => document.activeElement).toBe(trigger.element())
  })

  it('closes only the modal on top when Escape is pressed with a modal over the drawer', async () => {
    await page.viewport(600, 800)
    renderInBrowser(<NavbarModalPage />)
    await userEvent.click(page.getByRole('button', { name: 'Abrir menu' }))
    await expect.element(page.getByRole('dialog', { name: 'Navegação mobile' })).toBeVisible()
    const opener = page.getByRole('button', { name: 'Abrir modal', includeHidden: true }).element() as HTMLButtonElement
    opener.inert = false
    opener.click()
    await expect.element(page.getByRole('dialog', { name: 'Sobre o menu' })).toBeVisible()

    await userEvent.keyboard('{Escape}')

    await expect.poll(() => page.getByRole('dialog', { name: 'Sobre o menu' }).elements().length).toBe(0)
    expect(page.getByRole('dialog', { name: 'Navegação mobile' }).elements()).toHaveLength(1)
  })

  it('slides in from the right edge in left-to-right and the left edge in right-to-left', async () => {
    await page.viewport(600, 800)
    renderInBrowser(<NavbarModalPage />)
    await userEvent.click(page.getByRole('button', { name: 'Abrir menu' }))
    await expect.poll(() => dialogOf('Navegação mobile').getAttribute('data-state')).toBe('open')
    await expect.poll(() => window.innerWidth - Math.round(dialogOf('Navegação mobile').getBoundingClientRect().right)).toBeLessThanOrEqual(12)
  })

  it('docks on the left edge in right-to-left', async () => {
    await page.viewport(600, 800)
    document.documentElement.dir = 'rtl'
    renderRtl(<NavbarModalPage />)
    await userEvent.click(page.getByRole('button', { name: 'Abrir menu' }))
    await expect.poll(() => dialogOf('Navegação mobile').getAttribute('data-state')).toBe('open')
    await expect.poll(() => Math.round(dialogOf('Navegação mobile').getBoundingClientRect().left)).toBeLessThanOrEqual(12)
  })
})

describe('Sidebar collapse in a real browser', () => {
  const CollapsePage = () => {
    const [collapsed, setCollapsed] = useState(false)

    return <Sidebar sections={demoSections} collapsed={collapsed} onToggleCollapsed={() => setCollapsed((value) => !value)} />
  }

  const asideOf = () => document.querySelector('[data-slot="sidebar"]') as HTMLElement

  it('transitions only the inline size, never the other layout properties', async () => {
    renderInBrowser(<CollapsePage />, 'auto')
    const style = getComputedStyle(asideOf())

    expect(style.transitionProperty).toBe('inline-size')
    expect(parseFloat(style.transitionDuration)).toBeGreaterThan(0)
  })

  it('reaches the collapsed width after the click', async () => {
    renderInBrowser(<CollapsePage />, 'auto')
    expect(Math.round(asideOf().getBoundingClientRect().width)).toBe(280)

    await userEvent.click(page.getByRole('button', { name: 'Recolher menu lateral' }))

    await expect.poll(() => Math.round(asideOf().getBoundingClientRect().width)).toBe(80)
  })

  it('keeps the className of the caller winning over the width even when its css loads first', async () => {
    addStyle('.mine { inline-size: 123px; }', 'start')
    renderInBrowser(<Sidebar sections={demoSections} className="mine" />)

    expect(Math.round(asideOf().getBoundingClientRect().width)).toBe(123)
  })

  it('shows the permanent sidebar on the right side in right-to-left inside the layout', async () => {
    document.documentElement.dir = 'rtl'
    renderRtl(
      <Layout pageTitle="Teste" navigationSections={demoSections}>
        <p>Conteúdo</p>
      </Layout>
    )

    expect(asideOf().getBoundingClientRect().left).toBeGreaterThan(page.getByRole('main').element().getBoundingClientRect().left)
  })
})
