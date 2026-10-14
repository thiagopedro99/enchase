import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cdp } from 'vitest/browser'

import { ColorModeProvider } from '@components/colorMode/index.tsx'
import { darkTheme, lightTheme } from '@styles/tokens/index.ts'

const setScheme = (value: 'dark' | 'light') => cdp().send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value }] })

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
