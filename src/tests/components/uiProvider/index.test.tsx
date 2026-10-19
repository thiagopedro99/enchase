import { render, screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { ColorModeProvider } from '@components/colorMode/index.tsx'
import Layout from '@components/layout/index.tsx'
import { useCurrentHref } from '@hooks/useCurrentHref.ts'
import { useNavigator } from '@hooks/useNavigator.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import UIProvider from '@components/uiProvider/index.tsx'
import { en, ptBR } from '@locales/index.ts'

const renders = { navigator: 0, currentHref: 0, config: 0 }

const NavigatorProbe = () => {
  const navigate = useNavigator()

  renders.navigator += 1

  return <button onClick={() => navigate?.('/probe')}>go</button>
}

const CurrentHrefProbe = () => {
  const currentHref = useCurrentHref()

  renders.currentHref += 1

  return <output data-testid="current">{currentHref ?? 'none'}</output>
}

const ConfigProbe = () => {
  const { labels } = useUIConfig()

  renders.config += 1

  return <output data-testid="label">{labels.closeModal}</output>
}

const LocaleProbe = () => {
  const { locale } = useUIConfig()

  return <output data-testid="locale">{locale}</output>
}

const probes = (
  <>
    <NavigatorProbe />
    <CurrentHrefProbe />
    <ConfigProbe />
  </>
)

const reset = () => {
  renders.navigator = 0
  renders.currentHref = 0
  renders.config = 0
}

describe('UIProvider navigation', () => {
  it('has no navigate and no current location by default', () => {
    reset()
    render(<UIProvider>{probes}</UIProvider>)

    expect(screen.getByTestId('current')).toHaveTextContent('none')
  })

  it('hands the navigate and the current location to the components', () => {
    reset()
    const navigate = vi.fn()
    render(
      <UIProvider navigate={navigate} currentHref="/docs">
        {probes}
      </UIProvider>
    )

    screen.getByRole('button', { name: 'go' }).click()

    expect(navigate).toHaveBeenCalledWith('/probe')
    expect(screen.getByTestId('current')).toHaveTextContent('/docs')
  })

  it('keeps a stable navigate even when the function it receives changes identity', () => {
    reset()
    const first = vi.fn()
    const second = vi.fn()
    const view = render(<UIProvider navigate={first}>{probes}</UIProvider>)
    const initial = { ...renders }

    view.rerender(<UIProvider navigate={second}>{probes}</UIProvider>)
    screen.getByRole('button', { name: 'go' }).click()

    expect(renders.navigator).toBe(initial.navigator)
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledWith('/probe')
  })

  it('re-renders only who reads the current location when the route changes', () => {
    reset()
    const navigate = vi.fn()
    const view = render(
      <UIProvider navigate={navigate} currentHref="/docs">
        {probes}
      </UIProvider>
    )
    const initial = { ...renders }

    view.rerender(
      <UIProvider navigate={navigate} currentHref="/docs/intro">
        {probes}
      </UIProvider>
    )

    expect(screen.getByTestId('current')).toHaveTextContent('/docs/intro')
    expect(renders.currentHref).toBe(initial.currentHref + 1)
    expect(renders.navigator).toBe(initial.navigator)
    expect(renders.config).toBe(initial.config)
  })

  it('keeps the labels and the motion settings working', () => {
    reset()
    render(<UIProvider labels={{ closeModal: 'Close dialog' }}>{probes}</UIProvider>)

    expect(screen.getByTestId('label')).toHaveTextContent('Close dialog')
  })
})

describe('UIProvider locale', () => {
  it('exposes the language tag of the locale, English without one', () => {
    const { unmount } = render(
      <UIProvider>
        <LocaleProbe />
      </UIProvider>
    )

    expect(screen.getByTestId('locale')).toHaveTextContent('en')
    unmount()

    render(
      <UIProvider locale={ptBR}>
        <LocaleProbe />
      </UIProvider>
    )

    expect(screen.getByTestId('locale')).toHaveTextContent('pt-BR')
  })

  it('takes the tag of a locale of your own and keeps the labels working', () => {
    render(
      <UIProvider locale={{ ...en, locale: 'de-DE' }} labels={{ closeModal: 'Schließen' }}>
        <LocaleProbe />
        <ConfigProbe />
      </UIProvider>
    )

    expect(screen.getByTestId('locale')).toHaveTextContent('de-DE')
    expect(screen.getByTestId('label')).toHaveTextContent('Schließen')
  })
})

describe('UIProvider on the server', () => {
  it('writes the responsive rules of the layout and the navbar from the configured breakpoints', () => {
    const html = renderToString(
      <UIProvider breakpoints={{ md: '1000px' }}>
        <p>x</p>
      </UIProvider>
    )

    expect(html).toContain("[data-slot='layout'][data-layout='auto'][data-breakpoint='md']")
    expect(html).toContain('@media not all and (min-width: 1000px)')
    expect(html).toContain("[data-slot='navbar'][data-layout='auto'][data-breakpoint='lg']")
    expect(html).toContain('@media (min-width: 992px)')
  })

  it('renders the layout with the wide default and an automatic layout marker', () => {
    const html = renderToString(
      <ColorModeProvider>
        <UIProvider>
          <Layout navigationSections={[{ id: 'n', items: [{ id: 'a', label: 'Home', href: '/' }] }]}>x</Layout>
        </UIProvider>
      </ColorModeProvider>
    )

    expect(html).toContain('data-layout="auto"')
    expect(html).toContain('data-slot="layout-sidebar"')
    expect(html).toContain('data-sidebar')
  })
})
