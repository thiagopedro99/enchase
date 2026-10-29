import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'

import { backdropOf, supportsTranslucency, surfaceOf, worstContrast } from '../../support/translucency.ts'
import { setContrast, setForcedColors, setReducedTransparency } from '../../support/media.ts'
import { chromiumOnly, unlessFirefox, unlessWebkit } from '../../support/browserSkips.ts'
import Layout from '@components/layout/index.tsx'
import { renderInBrowser } from '../../support/harness.tsx'
import { waitForSettled } from '../../support/settle.ts'

import type { CSSProperties } from 'react'

const sections = [{ id: 'main', items: [{ id: 'home', label: 'Início', href: '/' }] }]

const tall = <div style={{ blockSize: '3000px', background: 'linear-gradient(red, blue)' }}>Conteúdo alto</div>

const barOf = (navigation: 'navbar' | 'sidebar') => document.querySelector(navigation === 'navbar' ? '[data-slot="navbar"]' : '[data-slot="layout-header"]') as HTMLElement

const trail = [
  { id: 'home', label: 'Início', href: '/' },
  { id: 'page', label: 'Página' }
]

const translucentIt = supportsTranslucency ? it : it.skip

const translucentLayout = (navigation: 'navbar' | 'sidebar', translucent = true) => (
  <Layout navigation={navigation} navigationSections={sections} brand="Marca" breadcrumbs={trail} translucent={translucent}>
    {tall}
  </Layout>
)

const surfaceRgb = (element: HTMLElement) => {
  const { r, g, b } = surfaceOf(element)

  return [r, g, b]
}

afterEach(async () => {
  window.scrollTo(0, 0)
  await setForcedColors('none')
  await setContrast('no-preference')
  await setReducedTransparency('no-preference').catch(() => undefined)
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

describe('the translucent top bar of the Layout', () => {
  translucentIt('shows 80% of the surface under the app bar, with its border and a blur of 12px', () => {
    renderInBrowser(translucentLayout('sidebar'))
    const bar = barOf('sidebar')

    expect(surfaceOf(bar).a).toBeCloseTo(0.8, 2)
    expect(surfaceRgb(bar)).toEqual([251, 248, 255])
    expect(backdropOf(bar)).toBe('blur(12px)')
    expect(getComputedStyle(bar).borderBlockEndWidth).toBe('1px')
    expect(getComputedStyle(bar).position).toBe('sticky')
  })

  translucentIt('shows 80% of the surface of the navbar under the navbar navigation', () => {
    renderInBrowser(translucentLayout('navbar'))
    const bar = barOf('navbar')

    expect(surfaceOf(bar).a).toBeCloseTo(0.8, 2)
    expect(surfaceRgb(bar)).toEqual([238, 234, 246])
    expect(backdropOf(bar)).toBe('blur(12px)')
  })

  translucentIt('follows the dark surfaces in the dark mode', () => {
    renderInBrowser(translucentLayout('sidebar'), 'never', 'dark')

    expect(surfaceRgb(barOf('sidebar'))).toEqual([19, 19, 26])
    expect(surfaceOf(barOf('sidebar')).a).toBeCloseTo(0.8, 2)
  })

  translucentIt('keeps the height of the opaque bar in both navigations, so the page below does not move', () => {
    for (const navigation of ['sidebar', 'navbar'] as const) {
      const heights = [false, true].map((translucent) => {
        const { unmount } = renderInBrowser(translucentLayout(navigation, translucent))
        const height = barOf(navigation).getBoundingClientRect().height

        unmount()

        return height
      })

      expect(heights[1], navigation).toBe(heights[0])
    }
  })

  translucentIt('stays translucent and at the top while the content scrolls under it', async () => {
    await page.viewport(1280, 700)

    for (const navigation of ['sidebar', 'navbar'] as const) {
      const { unmount } = renderInBrowser(translucentLayout(navigation))

      window.scrollTo(0, 1500)
      await expect.poll(() => Math.round(window.scrollY)).toBe(1500)
      await expect.poll(() => Math.round(barOf(navigation).getBoundingClientRect().top)).toBe(0)
      expect(backdropOf(barOf(navigation)), navigation).toBe('blur(12px)')
      unmount()
      window.scrollTo(0, 0)
    }
  })

  translucentIt('takes the background and the blur of the app bar from its own variables', () => {
    const sheet = document.createElement('style')

    sheet.textContent = '[data-slot="layout-header"] { --enchase-app-bar-background: rgb(10 20 30 / 50%); --enchase-app-bar-blur: 24px; }'
    document.head.append(sheet)
    renderInBrowser(translucentLayout('sidebar'))
    const bar = barOf('sidebar')

    expect(surfaceRgb(bar)).toEqual([10, 20, 30])
    expect(surfaceOf(bar).a).toBeCloseTo(0.5, 2)
    expect(backdropOf(bar)).toBe('blur(24px)')
    sheet.remove()
  })

  translucentIt('ignores those variables when the bar is not translucent', () => {
    const style = { '--enchase-app-bar-background': 'rgb(10 20 30 / 50%)', '--enchase-app-bar-blur': '24px' } as CSSProperties

    renderInBrowser(
      <Layout navigationSections={sections} brand="Marca" breadcrumbs={trail} style={style}>
        {tall}
      </Layout>
    )

    expect(surfaceOf(barOf('sidebar')).a).toBe(1)
    expect(backdropOf(barOf('sidebar'))).toBe('none')
  })

  translucentIt('keeps the text and the icon of the app bar readable over pure black or pure white, in both color modes', async () => {
    for (const mode of ['light', 'dark'] as const) {
      const { unmount } = renderInBrowser(translucentLayout('sidebar'), 'never', mode)

      await waitForSettled(() => barOf('sidebar'))

      const surface = surfaceOf(barOf('sidebar'))
      const link = getComputedStyle(document.querySelector('[data-slot="layout-header-trail"] a') as HTMLElement).color
      const current = getComputedStyle(document.querySelector('[data-slot="layout-header-trail"] [aria-current="page"]') as HTMLElement).color
      const icon = getComputedStyle(document.querySelector('[data-slot="layout-header-menu-button"]') as HTMLElement).color

      expect(worstContrast(link, surface), `${mode} link`).toBeGreaterThanOrEqual(4.5)
      expect(worstContrast(current, surface), `${mode} current page`).toBeGreaterThanOrEqual(4.5)
      expect(worstContrast(icon, surface), `${mode} menu icon`).toBeGreaterThanOrEqual(3)
      unmount()
    }
  })
})

describe('the translucent app bar falls back to the solid surface', () => {
  const expectSolid = async () => {
    await expect.poll(() => surfaceOf(barOf('sidebar')).a).toBe(1)

    expect(backdropOf(barOf('sidebar'))).toBe('none')
    expect(surfaceRgb(barOf('sidebar'))).toEqual([251, 248, 255])
  }

  const withContrast = supportsTranslucency && unlessFirefox('contrastEmulation') ? it : it.skip

  withContrast('when the system prefers more contrast', async () => {
    renderInBrowser(translucentLayout('sidebar'))

    await setContrast('more')
    await expectSolid()
    await setContrast('no-preference')
    await expect.poll(() => surfaceOf(barOf('sidebar')).a).toBeCloseTo(0.8, 2)
  })

  const withForcedColors = supportsTranslucency && unlessWebkit('forcedColors') ? it : it.skip

  withForcedColors('in forced colors', async () => {
    renderInBrowser(translucentLayout('sidebar'))

    await setForcedColors('active')
    await expect.poll(() => surfaceOf(barOf('sidebar')).a).toBe(1)
    expect(backdropOf(barOf('sidebar'))).toBe('none')
  })

  const withReducedTransparency = supportsTranslucency ? chromiumOnly('reducedTransparency') : it.skip

  withReducedTransparency('when the system asks for reduced transparency, even with a translucent color of the caller', async () => {
    const sheet = document.createElement('style')

    sheet.textContent = '[data-slot="layout-header"] { --enchase-app-bar-background: rgb(10 20 30 / 50%); }'
    document.head.append(sheet)
    renderInBrowser(translucentLayout('sidebar'))

    expect(surfaceOf(barOf('sidebar')).a).toBeCloseTo(0.5, 2)

    await setReducedTransparency('reduce')
    await expectSolid()
    sheet.remove()
  })
})
