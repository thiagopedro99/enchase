import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'

import Layout from '@components/layout/index.tsx'
import Breadcrumbs from '@components/common/Breadcrumbs/index.tsx'
import Container from '@components/common/Container/index.tsx'
import Flex from '@components/common/Flex/index.tsx'
import { demoSections } from '@tests/shared/fixtures/layoutBranding.tsx'
import { renderInBrowser } from './harness.tsx'

const rectOf = (element: Element) => element.getBoundingClientRect()

const layout = (props: Partial<Parameters<typeof Layout>[0]> = {}) => (
  <Layout pageTitle="Teste" navigationSections={demoSections} {...props}>
    <h1>Conteúdo</h1>
  </Layout>
)

afterEach(() => {
  document.documentElement.removeAttribute('dir')
})

describe('Layout contract in a real browser', () => {
  it('exposes the slots of its parts', async () => {
    await page.viewport(1280, 800)
    const { container } = renderInBrowser(layout())

    for (const name of ['layout', 'layout-main', 'layout-sidebar', 'layout-footer', 'layout-header', 'layout-skip-link']) {
      expect(container.querySelector(`[data-slot="${name}"]`), name).not.toBeNull()
    }
  })

  it('lets the caller className and style win over the root rules', async () => {
    await page.viewport(1280, 800)
    const style = document.createElement('style')
    style.textContent = '.mine { min-block-size: 777px; }'
    document.head.prepend(style)
    const { container } = renderInBrowser(layout({ className: 'mine' }))
    const root = container.querySelector('[data-slot="layout"]') as HTMLElement

    expect(getComputedStyle(root).minHeight).toBe('777px')
    style.remove()
  })

  it('mirrors the grid when the page is right-to-left: the sidebar goes to the end', async () => {
    await page.viewport(1280, 800)
    document.documentElement.dir = 'rtl'
    renderInBrowser(layout())
    const nav = rectOf(page.getByRole('navigation', { name: 'Navegação principal' }).element())
    const main = rectOf(page.getByRole('main').element())

    expect(nav.left).toBeGreaterThanOrEqual(main.right - 1)
  })

  it('keeps the sidebar at the start in left-to-right', async () => {
    await page.viewport(1280, 800)
    renderInBrowser(layout())
    const nav = rectOf(page.getByRole('navigation', { name: 'Navegação principal' }).element())
    const main = rectOf(page.getByRole('main').element())

    expect(main.left).toBeGreaterThanOrEqual(nav.right - 1)
  })

  it('flows the app bar breadcrumb and the actions to the opposite side in right-to-left', async () => {
    await page.viewport(1280, 800)
    document.documentElement.dir = 'rtl'
    renderInBrowser(layout())
    const banner = page.getByRole('banner').element()
    const menu = rectOf(page.getByRole('button', { name: 'Recolher menu lateral' }).element())
    const theme = rectOf(page.getByRole('button', { name: 'Mudar para tema escuro' }).element())

    expect(menu.left).toBeGreaterThan(theme.left)
    expect(rectOf(banner).width).toBeGreaterThan(300)
  })
})

describe('layout primitives in a real browser', () => {
  it('uses logical padding in Container so rtl swaps the start side', () => {
    document.documentElement.dir = 'rtl'
    renderInBrowser(<Container padding="40px" maxWidth="full" data-testid="c" style={{ paddingInlineStart: '10px' }} />)
    const style = getComputedStyle(page.getByTestId('c').element())

    expect(style.paddingRight).toBe('10px')
    expect(style.paddingLeft).toBe('40px')
  })

  it('lets the caller className win on Flex and Breadcrumbs without a reset', () => {
    const style = document.createElement('style')
    style.textContent = '.mine { gap: 33px; } .trail { min-inline-size: 123px; }'
    document.head.prepend(style)
    renderInBrowser(
      <>
        <Flex className="mine" data-testid="f" />
        <Breadcrumbs className="trail" items={[{ id: 'a', label: 'A', href: '/' }, { id: 'b', label: 'B' }]} data-testid="b" />
      </>
    )

    expect(getComputedStyle(page.getByTestId('f').element()).gap).toBe('33px')
    expect(getComputedStyle(page.getByTestId('b').element()).minWidth).toBe('123px')
    style.remove()
  })
})
