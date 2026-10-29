import { afterEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { Grid } from '@components/common/Grid/index.tsx'
import { Modal } from '@components/common/Modal/index.tsx'
import Layout from '@components/layout/index.tsx'
import Navbar from '@components/navbar/index.tsx'
import UIProvider from '@components/uiProvider/index.tsx'
import { ToastProvider, useToast } from '@components/toast/index.ts'
import { useBreakpoint } from '@hooks/useBreakpoint.ts'
import { renderInBrowser } from '../support/harness.tsx'

const sections = [{ id: 'n', items: [{ id: 'a', label: 'Início', href: '/' }] }]

const layoutOf = (selector: string) => document.querySelector<HTMLElement>(selector)?.getAttribute('data-layout')

afterEach(() => page.viewport(1280, 800))

describe('configurable breakpoints in a real browser', () => {
  it('switches the Layout from drawer to permanent sidebar exactly at the configured breakpoint', async () => {
    const ui = (
      <UIProvider breakpoints={{ md: '1000px' }}>
        <Layout navigationSections={sections} brand="Marca">
          <h1>Oi</h1>
        </Layout>
      </UIProvider>
    )

    await page.viewport(900, 800)
    const narrow = renderInBrowser(ui)
    await expect.poll(() => layoutOf('[data-slot="layout"]')).toBe('compact')
    expect(document.querySelector('[data-slot="layout-sidebar"]')).toBeNull()
    narrow.unmount()

    await page.viewport(1100, 800)
    renderInBrowser(ui)
    await expect.poll(() => layoutOf('[data-slot="layout"]')).toBe('wide')
    expect(document.querySelector('[data-slot="layout-sidebar"]')).not.toBeNull()
  })

  it('keeps the default breakpoint at 768px when nothing is configured', async () => {
    await page.viewport(760, 800)
    const narrow = renderInBrowser(
      <Layout navigationSections={sections}>
        <h1>Oi</h1>
      </Layout>
    )
    await expect.poll(() => layoutOf('[data-slot="layout"]')).toBe('compact')
    narrow.unmount()

    await page.viewport(780, 800)
    renderInBrowser(
      <Layout navigationSections={sections}>
        <h1>Oi</h1>
      </Layout>
    )
    await expect.poll(() => layoutOf('[data-slot="layout"]')).toBe('wide')
  })

  it('moves the Navbar between links and menu button at the chosen breakpoint prop', async () => {
    await page.viewport(900, 800)
    renderInBrowser(<Navbar sections={sections} breakpoint="lg" />)

    await expect.poll(() => layoutOf('[data-slot="navbar"]')).toBe('compact')
    expect(getComputedStyle(document.querySelector('[data-slot="navbar-menu"]') as HTMLElement).display).toBe('none')
    expect(getComputedStyle(document.querySelector('[data-slot="navbar-menu-button"]') as HTMLElement).display).not.toBe('none')

    await page.viewport(1000, 800)

    await expect.poll(() => layoutOf('[data-slot="navbar"]')).toBe('wide')
    expect(getComputedStyle(document.querySelector('[data-slot="navbar-menu"]') as HTMLElement).display).not.toBe('none')
    expect(getComputedStyle(document.querySelector('[data-slot="navbar-menu-button"]') as HTMLElement).display).toBe('none')
  })

  it('reports the current breakpoint from the hook and follows resizes', async () => {
    const Probe = () => {
      const { current, up } = useBreakpoint()

      return <p data-testid="probe">{`${current}:${up('md')}`}</p>
    }

    await page.viewport(700, 800)
    renderInBrowser(<Probe />)
    await expect.poll(() => page.getByTestId('probe').element().textContent).toBe('sm:false')

    await page.viewport(1000, 800)
    await expect.poll(() => page.getByTestId('probe').element().textContent).toBe('lg:true')
  })
})

describe('intrinsic layouts without media queries in a real browser', () => {
  const columnsOf = () => getComputedStyle(page.getByTestId('grid').element()).gridTemplateColumns.split(' ').length

  it('collapses the Grid columns by available width', async () => {
    renderInBrowser(
      <Grid data-testid="grid" columns={3}>
        <div>a</div>
        <div>b</div>
        <div>c</div>
      </Grid>
    )

    await page.viewport(1200, 800)
    await expect.poll(columnsOf).toBe(3)

    await page.viewport(320, 800)
    await expect.poll(columnsOf).toBe(1)
  })

  it('fits the Modal inside a 320px viewport', async () => {
    await page.viewport(320, 640)
    renderInBrowser(
      <Modal isOpen onClose={() => undefined} title="Título" size="xl">
        <p>Conteúdo</p>
      </Modal>
    )
    await expect.poll(() => document.querySelector('[data-slot="modal-panel"]')).toBeTruthy()
    const box = (document.querySelector('[data-slot="modal-panel"]') as HTMLElement).getBoundingClientRect()

    expect(box.left).toBeGreaterThanOrEqual(0)
    expect(box.right).toBeLessThanOrEqual(320)
    expect(box.width).toBeGreaterThan(200)
  })

  it('fits the toast inside a 320px viewport', async () => {
    const Launcher = () => {
      const toast = useToast()

      return <button onClick={() => toast.success('Uma mensagem razoavelmente longa para caber', 60000)}>disparar</button>
    }

    await page.viewport(320, 640)
    renderInBrowser(
      <ToastProvider>
        <Launcher />
      </ToastProvider>
    )
    await userEvent.click(page.getByRole('button', { name: 'disparar' }))
    await expect.poll(() => document.querySelector('[data-slot="toast"]')).toBeTruthy()
    const box = (document.querySelector('[data-slot="toast"]') as HTMLElement).getBoundingClientRect()

    expect(box.left).toBeGreaterThanOrEqual(0)
    expect(box.right).toBeLessThanOrEqual(320)
  })
})
