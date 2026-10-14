import { describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { Tooltip } from '@components/common/Tooltip/index.tsx'
import Layout from '@components/layout/index.tsx'
import { demoSections } from '@tests/shared/fixtures/layoutBranding.tsx'
import { renderInBrowser } from './harness.tsx'

const layout = () => (
  <Layout pageTitle="Teste" navigationSections={demoSections}>
    <h1>Conteúdo</h1>
  </Layout>
)

const rectOf = (element: Element) => element.getBoundingClientRect()

describe('Layout grid in a real browser', () => {
  it('puts a permanent sidebar beside the main area on a wide viewport', async () => {
    await page.viewport(1280, 800)
    renderInBrowser(layout())
    const nav = page.getByRole('navigation', { name: 'Navegação principal' }).element()
    const main = page.getByRole('main').element()

    expect(rectOf(nav).width).toBeGreaterThan(40)
    expect(rectOf(main).left).toBeGreaterThanOrEqual(rectOf(nav).right - 1)
    expect(page.getByRole('button', { name: 'Abrir menu' }).elements()).toHaveLength(0)
  })

  it('swaps the permanent sidebar for a drawer on a narrow viewport', async () => {
    await page.viewport(600, 800)
    renderInBrowser(layout())

    expect(page.getByRole('navigation', { name: 'Navegação principal' }).elements()).toHaveLength(0)
    expect(rectOf(page.getByRole('main').element()).left).toBeLessThan(8)
    await expect.element(page.getByRole('button', { name: 'Abrir menu' })).toBeVisible()
  })

  it('stacks the app bar, main and footer in the document order of the grid', async () => {
    renderInBrowser(layout())
    const banner = rectOf(page.getByRole('banner').element())
    const main = rectOf(page.getByRole('main').element())
    const footer = rectOf(page.getByRole('contentinfo').element())

    expect(banner.bottom).toBeLessThanOrEqual(main.top + 1)
    expect(main.bottom).toBeLessThanOrEqual(footer.top + 1)
  })
})

describe('Tooltip in a real browser', () => {
  it('is not clipped by a scrolling container and sits on a fixed layer', async () => {
    renderInBrowser(
      <div data-testid="scroller" style={{ height: 60, width: 200, overflow: 'auto', margin: '200px auto', border: '1px solid' }}>
        <div style={{ height: 300 }}>
          <Tooltip text="Dica longa" position="top">
            <button>Alvo</button>
          </Tooltip>
        </div>
      </div>
    )
    await userEvent.hover(page.getByRole('button', { name: 'Alvo' }))
    const findBubble = () => [...document.body.querySelectorAll<HTMLElement>('body *')].find((node) => node.textContent === 'Dica longa' && !node.hidden && !node.closest('[hidden]'))
    await expect.poll(findBubble).toBeTruthy()
    const bubble = findBubble() as HTMLElement
    const scroller = rectOf(page.getByTestId('scroller').element())
    const box = rectOf(bubble)
    const centerHit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2)

    expect(getComputedStyle(bubble).position).toBe('fixed')
    expect(box.top).toBeLessThan(scroller.top)
    expect(bubble.contains(centerHit)).toBe(true)
  })
})
