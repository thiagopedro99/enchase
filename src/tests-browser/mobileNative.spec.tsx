import { useState } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp, page, userEvent } from 'vitest/browser'

import { Button } from '@components/common/Button/index.tsx'
import { Checkbox } from '@components/common/Checkbox/index.tsx'
import { Input } from '@components/common/Input/index.tsx'
import { Link } from '@components/common/Link/index.tsx'
import { Modal } from '@components/common/Modal/index.tsx'
import { Popover } from '@components/common/Popover/index.tsx'
import { Select } from '@components/common/Select/index.tsx'
import { Sidebar } from '@components/common/Sidebar/index.tsx'
import ThemeToggle from '@components/common/ThemeToggle/index.tsx'
import { ToastProvider, useToast } from '@components/toast/index.ts'
import Layout from '@components/layout/index.tsx'
import Navbar from '@components/navbar/index.tsx'
import { demoSections } from '@tests/shared/fixtures/layoutBranding.tsx'
import { chromiumOnly } from './browserSkips.ts'

const supportsOverscroll = CSS.supports('overscroll-behavior', 'contain')

const overscrollSuite = supportsOverscroll ? describe : describe.skip

const supportsTapHighlight = CSS.supports('-webkit-tap-highlight-color', 'transparent') && getComputedStyle(document.documentElement).getPropertyValue('-webkit-tap-highlight-color') !== ''
import { renderInBrowser } from './harness.tsx'

const noHighlight = 'rgba(0, 0, 0, 0)'

const bodyLockProps = () => document.body.style.overscrollBehavior

const ToastButton = () => {
  const toast = useToast()

  return <button onClick={() => toast.success('Salvo', 60000)}>avisar</button>
}

const ModalPage = ({ body = 'Texto' }: { body?: string }) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)}>Abrir</button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Título">
        <p>{body}</p>
      </Modal>
    </>
  )
}

const DrawerPage = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)}>Abrir menu</button>
      <Sidebar variant="modal" open={open} onClose={() => setOpen(false)} sections={demoSections} />
    </>
  )
}

afterEach(async () => {
  await page.viewport(1280, 800)
})

describe('touch handling on the interactive controls', () => {
  it('kills the tap highlight and the double-tap zoom delay on every control', async () => {
    await page.viewport(390, 844)
    renderInBrowser(
      <>
        <Button>Salvar</Button>
        <Link href="/x">Ir</Link>
        <Checkbox label="Aceito" />
        <Select label="País" options={[{ value: 'br', label: 'Brasil' }]} />
        <Input label="Senha" type="password" />
        <ThemeToggle />
        <ToastProvider>
          <ToastButton />
        </ToastProvider>
        <ModalPage />
        <DrawerPage />
      </>
    )
    await userEvent.click(page.getByRole('button', { name: 'avisar' }))
    await expect.poll(() => document.querySelector('[data-slot="toast-close"]')).toBeTruthy()
    await userEvent.click(page.getByRole('button', { name: 'Abrir' }))
    await expect.poll(() => document.querySelector('[data-slot="modal-close"]')).toBeTruthy()

    const controls = [
      page.getByRole('button', { name: 'Salvar' }).element(),
      page.getByRole('link', { name: 'Ir' }).element(),
      document.querySelector('[data-slot="checkbox"]') as HTMLElement,
      document.querySelector('[data-slot="select-field"]') as HTMLElement,
      document.querySelector('[data-slot="input-toggle"]') as HTMLElement,
      document.querySelector('[data-slot="toast-close"]') as HTMLElement,
      document.querySelector('[data-slot="modal-close"]') as HTMLElement
    ]

    for (const control of controls) {
      expect(control, 'control rendered').toBeTruthy()
      expect(getComputedStyle(control).touchAction, control.outerHTML.slice(0, 60)).toBe('manipulation')
      if (supportsTapHighlight) expect(getComputedStyle(control).getPropertyValue('-webkit-tap-highlight-color'), control.outerHTML.slice(0, 60)).toBe(noHighlight)
    }
  })

  it('applies the same handling to the menu items of the sidebar and the navbar links', async () => {
    renderInBrowser(
      <>
        <Navbar sections={demoSections} />
        <Layout navigationSections={demoSections}>
          <p>Conteúdo</p>
        </Layout>
      </>
    )

    const items = [...document.querySelectorAll<HTMLElement>('[data-slot="sidebar-item-control"], [data-slot="navbar"] a')]

    expect(items.length).toBeGreaterThan(0)
    for (const item of items) {
      expect(getComputedStyle(item).touchAction).toBe('manipulation')
      if (supportsTapHighlight) expect(getComputedStyle(item).getPropertyValue('-webkit-tap-highlight-color')).toBe(noHighlight)
    }
  })

  it('keeps the text of the fields at 16px or more so iOS does not zoom the page', async () => {
    renderInBrowser(
      <div style={{ ['--enchase-font-size-base' as string]: '14px' }}>
        <Input label="Nome" />
        <Select label="País" options={[{ value: 'br', label: 'Brasil' }]} />
      </div>
    )
    const fields = [document.querySelector('[data-slot="input-field"]'), document.querySelector('[data-slot="select-field"]')] as HTMLElement[]

    expect(fields.map((field) => getComputedStyle(field).fontSize)).toEqual(['14px', '14px'])
  })
})

describe('viewport units and safe areas', () => {
  it('sizes the page, the sidebar and the drawers with the dynamic viewport height', async () => {
    await page.viewport(1280, 700)
    renderInBrowser(
      <Layout navigationSections={demoSections}>
        <p>Conteúdo</p>
      </Layout>
    )
    const wrapper = document.querySelector('[data-slot="layout"]') as HTMLElement
    const sidebar = document.querySelector('[data-slot="sidebar"]') as HTMLElement

    expect(getComputedStyle(wrapper).minHeight).toBe(`${window.innerHeight}px`)
    expect(getComputedStyle(sidebar).height).toBe(`${window.innerHeight}px`)
  })

  chromiumOnly('touchEmulation')('pads the fixed surfaces by the safe area insets', async () => {
    await cdp().send('Emulation.setSafeAreaInsetsOverride', { insets: { top: 47, bottom: 34, left: 0, right: 0 } })

    try {
      await page.viewport(390, 844)
      renderInBrowser(
        <ToastProvider>
          <ToastButton />
          <DrawerPage />
        </ToastProvider>
      )
      await userEvent.click(page.getByRole('button', { name: 'avisar' }))
      await expect.poll(() => document.querySelector('[data-slot="toast-viewport"]')).toBeTruthy()
      await userEvent.click(page.getByRole('button', { name: 'Abrir menu' }))
      await expect.poll(() => document.querySelector('[data-slot="sidebar-panel"]')).toBeTruthy()

      const viewport = document.querySelector('[data-slot="toast-viewport"]') as HTMLElement
      const panel = document.querySelector('[data-slot="sidebar-panel"]') as HTMLElement

      expect(parseFloat(getComputedStyle(viewport).top)).toBeGreaterThanOrEqual(47)
      expect(parseFloat(getComputedStyle(panel).paddingTop)).toBeGreaterThanOrEqual(47)
      expect(parseFloat(getComputedStyle(panel).paddingBottom)).toBeGreaterThanOrEqual(34)
    } finally {
      await cdp().send('Emulation.setSafeAreaInsetsOverride', { insets: { top: 0, bottom: 0, left: 0, right: 0 } })
    }
  })
})

overscrollSuite('scrolling inside the overlays', () => {
  const overscrollOf = (slot: string) => getComputedStyle(document.querySelector(`[data-slot="${slot}"]`) as HTMLElement).overscrollBehaviorY

  it('contains the overscroll inside the modal body', async () => {
    renderInBrowser(<ModalPage body={'linha '.repeat(2000)} />)
    await userEvent.click(page.getByRole('button', { name: 'Abrir' }))
    await expect.poll(() => document.querySelector('[data-slot="modal-body"]')).toBeTruthy()

    expect(overscrollOf('modal-body')).toBe('contain')
  })

  it('contains the overscroll inside the sidebar drawer', async () => {
    renderInBrowser(<DrawerPage />)
    await userEvent.click(page.getByRole('button', { name: 'Abrir menu' }))
    await expect.poll(() => document.querySelector('[data-slot="sidebar-nav"]')).toBeTruthy()

    expect(overscrollOf('sidebar-nav')).toBe('contain')
  })

  it('contains the overscroll inside the popover', async () => {
    renderInBrowser(
      <Popover content={<p>{'texto '.repeat(500)}</p>} defaultOpen>
        <button>Gatilho</button>
      </Popover>
    )
    await expect.poll(() => document.querySelector('[data-slot="popover-content"]')).toBeTruthy()

    expect(overscrollOf('popover-content')).toBe('contain')
  })

  it('stops the page from chaining scroll while a modal locks it and restores everything after', async () => {
    renderInBrowser(
      <>
        <ModalPage />
        <div style={{ height: 4000 }}>conteúdo longo</div>
      </>
    )
    window.scrollTo(0, 0)

    await userEvent.click(page.getByRole('button', { name: 'Abrir' }))
    await expect.poll(() => document.body.style.overflow).toBe('hidden')

    expect(bodyLockProps()).toBe('none')
    expect(window.scrollY).toBe(0)

    await userEvent.keyboard('{Escape}')
    await expect.poll(() => document.body.style.overflow).not.toBe('hidden')

    expect(bodyLockProps()).toBe('')
    expect(window.scrollY).toBe(0)
  })
})
