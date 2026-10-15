import { setColorScheme } from './media.ts'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'

import { ColorModeProvider } from '@components/colorMode/index.tsx'
import UIProvider from '@components/uiProvider/index.tsx'
import Layout from '@components/layout/index.tsx'
import Navbar from '@components/navbar/index.tsx'
import { darkTheme, lightTheme } from '@styles/tokens/index.ts'

import type { UIProviderProps } from '@components/uiProvider/types.ts'
import type { ReactElement } from 'react'

const setScheme = setColorScheme

const mount = () => {
  const host = document.createElement('div')

  host.innerHTML = renderToString(
    <ColorModeProvider>
      <p data-probe style={{ backgroundColor: 'var(--enchase-color-background)' }}>
        x
      </p>
    </ColorModeProvider>
  )
  document.body.append(host)

  return host
}

const backgroundOf = (host: HTMLElement) => getComputedStyle(host.querySelector('[data-probe]') as HTMLElement).backgroundColor

const toRgb = (hex: string) => {
  const probe = document.createElement('span')

  probe.style.color = hex
  document.body.append(probe)
  const rgb = getComputedStyle(probe).color
  probe.remove()

  return rgb
}

beforeEach(() => {
  delete document.documentElement.dataset.theme
})

afterEach(async () => {
  document.body.innerHTML = ''
  await setScheme('light')
  await page.viewport(1280, 800)
})

const mountPage = (element: ReactElement, breakpoints?: UIProviderProps['breakpoints']) => {
  const host = document.createElement('div')

  host.innerHTML = renderToString(
    <ColorModeProvider>
      <UIProvider breakpoints={breakpoints}>{element}</UIProvider>
    </ColorModeProvider>
  )
  document.body.append(host)

  return host
}

const shown = (host: HTMLElement, selector: string) => {
  const element = host.querySelector(selector) as HTMLElement | null

  return element !== null && getComputedStyle(element).display !== 'none'
}

const sections = [{ id: 'n', items: [{ id: 'a', label: 'Início', href: '/' }] }]

describe('layout and navbar in the server html, without hydration', () => {
  it('shows the permanent sidebar from the md breakpoint up and hides it below', async () => {
    await page.viewport(1100, 800)
    const wide = mountPage(<Layout navigationSections={sections}>x</Layout>)

    expect(shown(wide, "[data-slot='layout-sidebar']")).toBe(true)
    wide.remove()

    await page.viewport(500, 800)
    const narrow = mountPage(<Layout navigationSections={sections}>x</Layout>)

    expect(shown(narrow, "[data-slot='layout-sidebar']")).toBe(false)
    expect(getComputedStyle(narrow.querySelector("[data-slot='layout']") as HTMLElement).gridTemplateColumns.split(' ')).toHaveLength(1)
  })

  it('follows a configured breakpoint before hydration', async () => {
    await page.viewport(900, 800)
    const host = mountPage(<Layout navigationSections={sections}>x</Layout>, { md: '1000px' })

    expect(shown(host, "[data-slot='layout-sidebar']")).toBe(false)
    host.remove()

    await page.viewport(1100, 800)

    expect(shown(mountPage(<Layout navigationSections={sections}>x</Layout>, { md: '1000px' }), "[data-slot='layout-sidebar']")).toBe(true)
  })

  it('shows the navbar menu on wide screens and the menu button on narrow ones', async () => {
    await page.viewport(1100, 800)
    const wide = mountPage(<Navbar sections={sections} />)

    expect(shown(wide, "[data-slot='navbar-menu']")).toBe(true)
    expect(shown(wide, "[data-slot='navbar-menu-button']")).toBe(false)
    wide.remove()

    await page.viewport(500, 800)
    const narrow = mountPage(<Navbar sections={sections} />)

    expect(shown(narrow, "[data-slot='navbar-menu']")).toBe(false)
    expect(shown(narrow, "[data-slot='navbar-menu-button']")).toBe(true)
  })
})

describe('server html before any javascript runs', () => {
  it('paints the dark colors when the system prefers dark and no theme attribute was set yet', async () => {
    await setScheme('dark')
    const host = mount()

    expect(backgroundOf(host)).toBe(toRgb(darkTheme.colors.background))
  })

  it('paints the light colors when the system prefers light', async () => {
    await setScheme('light')
    const host = mount()

    expect(backgroundOf(host)).toBe(toRgb(lightTheme.colors.background))
  })

  it('lets an explicit data-theme beat the system preference', async () => {
    await setScheme('dark')
    document.documentElement.dataset.theme = 'light'
    const host = mount()

    expect(backgroundOf(host)).toBe(toRgb(lightTheme.colors.background))
  })
})
