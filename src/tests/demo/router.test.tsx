import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { navigate } from '@demo/router.ts'
import App from '@demo/App.tsx'

const menu = () => screen.getByRole('navigation', { name: 'Navegação principal' })

const title = () => screen.getByRole('heading', { level: 1 })

const visit = (path: string) => window.history.replaceState(null, '', path)

beforeEach(() => {
  window.sessionStorage.clear()
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.resolve(new Response(JSON.stringify({ total_count: 0, items: [] }), { status: 200 })))
  )
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
})

afterEach(() => {
  visit('/')
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('Site routes', () => {
  it('opens the landing page at the root and starts in the shadcn style', () => {
    visit('/')
    render(<App />)

    expect(title()).toHaveTextContent('Componentes React')
    expect(screen.getByLabelText('O tema que você está vendo')).toHaveTextContent('style: shadcn')
  })

  it('opens each page by its address, with or without the trailing slash', () => {
    visit('/novidades/')

    const first = render(<App />)

    expect(title()).toHaveTextContent('O que mudou em cada versão')

    first.unmount()
    visit('/sugestoes')
    render(<App />)

    expect(title()).toHaveTextContent('O que você quer ver na Enchase?')
  })

  it('falls back to the landing page on an address it does not know', () => {
    visit('/nada')
    render(<App />)

    expect(title()).toHaveTextContent('Componentes React')
  })

  it('moves between the pages from the menu without reloading, and back with the browser', async () => {
    const user = userEvent.setup()

    visit('/')
    render(<App />)

    await user.click(within(menu()).getByRole('link', { name: 'Novidades' }))

    expect(window.location.pathname).toBe('/novidades')
    expect(title()).toHaveTextContent('O que mudou em cada versão')

    await user.click(within(menu()).getByRole('link', { name: 'Sugestões' }))

    expect(window.location.pathname).toBe('/sugestoes')
    expect(await screen.findByRole('heading', { name: 'Ainda não há sugestões' })).toBeInTheDocument()

    await user.click(within(menu()).getByRole('link', { name: 'Início' }))

    expect(window.location.pathname).toBe('/')
    expect(title()).toHaveTextContent('Componentes React')

    visit('/novidades')
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'))
    })

    expect(title()).toHaveTextContent('O que mudou em cada versão')
  })

  it('keeps the look picked on the landing page when the visitor comes back to it', async () => {
    const user = userEvent.setup()

    visit('/')
    render(<App />)

    await user.click(within(screen.getByRole('radiogroup', { name: 'Estilo' })).getByRole('radio', { name: 'Workbench' }))
    await user.click(within(menu()).getByRole('link', { name: 'Novidades' }))
    await user.click(within(menu()).getByRole('link', { name: 'Início' }))

    expect(screen.getByLabelText('O tema que você está vendo')).toHaveTextContent('style: workbench')
  })

  it('leaves an address of another app to the browser', () => {
    const assign = vi.fn()

    vi.stubGlobal('location', { ...window.location, href: window.location.href, assign })
    navigate('/docs/')

    expect(assign).toHaveBeenCalledWith('/docs/')
  })
})
