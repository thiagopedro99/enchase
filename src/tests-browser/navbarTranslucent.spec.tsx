import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'

import { contrastRatio } from '@styles/theme/contrast.ts'
import { setContrast, setForcedColors, setReducedTransparency } from './media.ts'
import { chromiumOnly, unlessFirefox, unlessWebkit } from './browserSkips.ts'
import { parseComputedColor } from './color.ts'
import Navbar from '@components/navbar/index.tsx'
import { renderInBrowser } from './harness.tsx'
import { waitForSettled } from './settle.ts'

import type { Rgba } from './color.ts'
import type { CSSProperties, ReactElement } from 'react'

const sections = [
  {
    id: 'main',
    items: [
      { id: 'recursos', label: 'Recursos', href: '#recursos' },
      { id: 'contato', label: 'Contato', href: '#contato' }
    ]
  }
]

const supportsBlur = CSS.supports('backdrop-filter', 'blur(1px)') || CSS.supports('-webkit-backdrop-filter', 'blur(1px)')

const supportsColorMix = CSS.supports('color', 'color-mix(in srgb, red 50%, transparent)')

const translucentIt = supportsBlur && supportsColorMix ? it : it.skip

const header = () => document.querySelector('[data-slot="navbar"]') as HTMLElement

const slotOf = (name: string) => document.querySelector(`[data-slot="${name}"]`) as HTMLElement

const backdropOf = (element: HTMLElement) => {
  const style = getComputedStyle(element)

  return style.backdropFilter || style.getPropertyValue('-webkit-backdrop-filter') || 'none'
}

const surfaceOf = () => parseComputedColor(getComputedStyle(header()).backgroundColor)

const blended = (surface: Rgba, behind: number) => `rgb(${[surface.r, surface.g, surface.b].map((channel) => Math.round(channel * surface.a + behind * (1 - surface.a))).join(', ')})`

const worstContrast = (foreground: string, surface: Rgba) => Math.min(contrastRatio(foreground, blended(surface, 0)), contrastRatio(foreground, blended(surface, 255)))

const rootVariable = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()

const heightOf = (ui: ReactElement) => {
  const { unmount } = renderInBrowser(ui)
  const height = header().getBoundingClientRect().height

  unmount()

  return height
}

afterEach(async () => {
  await setForcedColors('none')
  await setContrast('no-preference')
  if (document.documentElement.dataset.theme === undefined) return
  await setReducedTransparency('no-preference').catch(() => undefined)
})

describe('Navbar without translucent', () => {
  it('keeps the solid surface and no blur in both color modes', () => {
    for (const mode of ['light', 'dark'] as const) {
      const { unmount } = renderInBrowser(<Navbar sections={sections} />, 'never', mode)

      expect(surfaceOf().a, mode).toBe(1)
      expect(backdropOf(header()), mode).toBe('none')
      expect(getComputedStyle(header()).boxShadow, mode).toBe('none')
      expect(getComputedStyle(header()).position).toBe('sticky')
      unmount()
    }
  })
})

describe('Navbar translucent', () => {
  translucentIt('shows 80% of the surface of the theme over a blur of 12px, with a hairline at the bottom', () => {
    renderInBrowser(<Navbar sections={sections} translucent />)
    const surface = surfaceOf()

    expect(surface.a).toBeCloseTo(0.8, 2)
    expect([surface.r, surface.g, surface.b]).toEqual([238, 234, 246])
    expect(backdropOf(header())).toBe('blur(12px)')
    expect(getComputedStyle(header()).boxShadow).toContain('inset')
    expect(getComputedStyle(header()).position).toBe('sticky')
  })

  translucentIt('follows the dark surface in the dark mode', () => {
    renderInBrowser(<Navbar sections={sections} translucent />, 'never', 'dark')
    const surface = surfaceOf()

    expect(surface.a).toBeCloseTo(0.8, 2)
    expect([surface.r, surface.g, surface.b]).toEqual([31, 31, 39])
    expect(backdropOf(header())).toBe('blur(12px)')
  })

  translucentIt('keeps the height of the opaque bar, so nothing below it moves', () => {
    expect(heightOf(<Navbar sections={sections} translucent />)).toBe(heightOf(<Navbar sections={sections} />))
  })

  translucentIt('takes the background and the blur from the variables of the caller', () => {
    const style = { '--enchase-navbar-background': 'rgb(10 20 30 / 50%)', '--enchase-navbar-blur': '24px' } as CSSProperties

    renderInBrowser(<Navbar sections={sections} translucent style={style} />)
    const surface = surfaceOf()

    expect([surface.r, surface.g, surface.b]).toEqual([10, 20, 30])
    expect(surface.a).toBeCloseTo(0.5, 2)
    expect(backdropOf(header())).toBe('blur(24px)')
  })

  translucentIt('ignores the variables when the bar is not translucent', () => {
    const style = { '--enchase-navbar-background': 'rgb(10 20 30 / 50%)', '--enchase-navbar-blur': '24px' } as CSSProperties

    renderInBrowser(<Navbar sections={sections} style={style} />)

    expect(surfaceOf().a).toBe(1)
    expect(backdropOf(header())).toBe('none')
  })

  translucentIt('lets the className of the caller win over the translucent background', () => {
    const sheet = document.createElement('style')

    sheet.textContent = '.mine { background-color: rgb(1 2 3); }'
    document.head.append(sheet)
    renderInBrowser(<Navbar sections={sections} translucent className="mine" />)

    expect(surfaceOf()).toEqual({ r: 1, g: 2, b: 3, a: 1 })
    sheet.remove()
  })

  translucentIt('keeps the text of the brand and of the menu at 4.5:1 over pure black or pure white, in both color modes', async () => {
    for (const mode of ['light', 'dark'] as const) {
      const { unmount } = renderInBrowser(<Navbar sections={sections} translucent />, 'never', mode)

      await waitForSettled(header)

      const surface = surfaceOf()
      const brand = getComputedStyle(slotOf('navbar-logo')).color
      const menu = getComputedStyle(slotOf('navbar-menu').querySelector('a') as HTMLElement).color
      const hover = rootVariable('--enchase-color-primary')

      expect(worstContrast(brand, surface), `${mode} brand`).toBeGreaterThanOrEqual(4.5)
      expect(worstContrast(menu, surface), `${mode} menu`).toBeGreaterThanOrEqual(4.5)
      expect(worstContrast(hover, surface), `${mode} brand on hover`).toBeGreaterThanOrEqual(3)
      unmount()
    }
  })
})

describe('Navbar translucent falls back to the solid surface', () => {
  const expectSolid = async () => {
    await expect.poll(() => surfaceOf().a).toBe(1)

    expect(backdropOf(header())).toBe('none')
    expect(getComputedStyle(header()).boxShadow).toBe('none')
  }

  const contrast = supportsBlur && supportsColorMix && unlessFirefox('contrastEmulation') ? it : it.skip

  contrast('when the system prefers more contrast', async () => {
    renderInBrowser(<Navbar sections={sections} translucent />)

    expect(surfaceOf().a).toBeCloseTo(0.8, 2)

    await setContrast('more')
    await expectSolid()
    expect([surfaceOf().r, surfaceOf().g, surfaceOf().b]).toEqual([238, 234, 246])

    await setContrast('no-preference')
    await expect.poll(() => surfaceOf().a).toBeCloseTo(0.8, 2)
  })

  const forced = supportsBlur && supportsColorMix && unlessWebkit('forcedColors') ? it : it.skip

  forced('in forced colors', async () => {
    renderInBrowser(<Navbar sections={sections} translucent style={{ '--enchase-navbar-background': 'rgb(10 20 30 / 50%)' } as CSSProperties} />)

    await setForcedColors('active')
    await expectSolid()
    await setForcedColors('none')
    await expect.poll(() => surfaceOf().a).toBeCloseTo(0.5, 2)
  })

  const reduced = supportsBlur && supportsColorMix ? chromiumOnly('reducedTransparency') : it.skip

  reduced('when the system asks for reduced transparency, even with a translucent color of the caller', async () => {
    renderInBrowser(<Navbar sections={sections} translucent style={{ '--enchase-navbar-background': 'rgb(10 20 30 / 50%)' } as CSSProperties} />)

    expect(surfaceOf().a).toBeCloseTo(0.5, 2)

    await setReducedTransparency('reduce')
    expect(window.matchMedia('(prefers-reduced-transparency: reduce)').matches).toBe(true)
    await expectSolid()
    expect([surfaceOf().r, surfaceOf().g, surfaceOf().b]).toEqual([238, 234, 246])

    await setReducedTransparency('no-preference')
    await expect.poll(() => surfaceOf().a).toBeCloseTo(0.5, 2)
  })
})

describe('Navbar translucent over scrolling content', () => {
  translucentIt('stays at the top while the content scrolls under it and keeps the links readable', async () => {
    await page.viewport(1280, 600)
    renderInBrowser(
      <div style={{ blockSize: '20rem', overflowY: 'auto' }} data-testid="scroller">
        <Navbar sections={sections} translucent />
        <div style={{ blockSize: '60rem', background: 'linear-gradient(black 0 50%, white 50% 100%)' }} />
      </div>
    )
    const scroller = document.querySelector('[data-testid="scroller"]') as HTMLElement
    const link = slotOf('navbar-menu').querySelector('a') as HTMLElement

    scroller.scrollTop = 600

    await expect.poll(() => Math.round(header().getBoundingClientRect().top - scroller.getBoundingClientRect().top)).toBe(0)
    expect(link.getBoundingClientRect().height).toBeGreaterThan(0)
    expect(backdropOf(header())).toBe('blur(12px)')
  })
})
