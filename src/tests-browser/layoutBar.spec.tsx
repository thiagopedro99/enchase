import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'

import Layout from '@components/layout/index.tsx'
import { renderInBrowser } from './harness.tsx'

const sections = [{ id: 'main', items: [{ id: 'home', label: 'Início', href: '/' }] }]

const tall = <div style={{ blockSize: '3000px', background: 'linear-gradient(red, blue)' }}>Conteúdo alto</div>

const barOf = (navigation: 'navbar' | 'sidebar') => document.querySelector(navigation === 'navbar' ? '[data-slot="navbar"]' : '[data-slot="layout-header"]') as HTMLElement

afterEach(async () => {
  window.scrollTo(0, 0)
  await page.viewport(1280, 800)
})

describe('the top bar of the Layout while the page scrolls', () => {
  for (const navigation of ['navbar', 'sidebar'] as const) {
    it(`keeps the bar of the ${navigation} navigation at the top of the window`, async () => {
      await page.viewport(1280, 700)
      renderInBrowser(
        <Layout navigation={navigation} navigationSections={sections} brand="Marca">
          {tall}
        </Layout>
      )
      const height = barOf(navigation).getBoundingClientRect().height

      for (const scroll of [300, 1200, 2500]) {
        window.scrollTo(0, scroll)
        await expect.poll(() => Math.round(window.scrollY)).toBe(scroll)
        await expect.poll(() => Math.round(barOf(navigation).getBoundingClientRect().top)).toBe(0)
        expect(Math.round(barOf(navigation).getBoundingClientRect().height)).toBe(Math.round(height))
      }
    })
  }

  it('keeps the bar above the content that scrolls under it', async () => {
    await page.viewport(1280, 700)
    renderInBrowser(
      <Layout navigation="navbar" navigationSections={sections} brand="Marca">
        {tall}
      </Layout>
    )
    window.scrollTo(0, 900)
    await expect.poll(() => Math.round(window.scrollY)).toBe(900)
    const bar = barOf('navbar').getBoundingClientRect()
    const hit = document.elementFromPoint(bar.left + bar.width / 2, bar.top + bar.height / 2)

    expect(barOf('navbar').contains(hit)).toBe(true)
  })

  it('does not move the content when the bar sticks', async () => {
    await page.viewport(1280, 700)
    renderInBrowser(
      <Layout navigation="navbar" navigationSections={sections} brand="Marca">
        <div data-testid="content">{tall}</div>
      </Layout>
    )
    const content = () => (page.getByTestId('content').element() as HTMLElement).getBoundingClientRect().top + window.scrollY
    const before = content()

    window.scrollTo(0, 1000)
    await expect.poll(() => Math.round(window.scrollY)).toBe(1000)

    expect(Math.round(content())).toBe(Math.round(before))
  })
})
