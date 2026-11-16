import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { axe } from '@tests/axe.ts'

import { defaultLook, docsUrl, repositoryUrl } from '@demo/pages/landing/defaultData.ts'
import Landing from '@demo/pages/landing/index.tsx'
import App from '@demo/App.tsx'

const renderLanding = (onLookChange = vi.fn()) => ({ ...renderWithProviders(<Landing look={defaultLook} onLookChange={onLookChange} />, { toasts: true }), onLookChange })

const headingLevels = () => screen.getAllByRole('heading').map((heading) => Number(heading.tagName.slice(1)))

describe('Landing page', () => {
  it('has no axe violations', async () => {
    const { container } = renderLanding()

    expect(await axe(container)).toHaveNoViolations()
  }, 30000)

  it('exposes exactly one h1 inside the main landmark', () => {
    renderLanding()

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('main')).toContainElement(screen.getByRole('heading', { level: 1 }))
  })

  it('never skips a heading level', () => {
    renderLanding()

    const levels = headingLevels()
    const skips = levels.filter((level, index) => index > 0 && level - levels[index - 1] > 1)

    expect(skips).toEqual([])
  })

  it('has banner, navigation, main and contentinfo landmarks and a skip link', () => {
    renderLanding()

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Navegação principal' })).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Pular para o conteúdo' })).toBeInTheDocument()
  })

  it('names every section of the page by its heading', () => {
    renderLanding()

    const names = ['Um kit, três visuais. Troque agora.', 'O trabalho chato já vem feito', 'Escreva CSS normal. Ele vence.', 'Antes de instalar', 'Instale e monte a primeira tela hoje']

    for (const name of names) expect(screen.getByRole('region', { name })).toBeInTheDocument()
  })
})

describe('Landing links', () => {
  it('sends Começar agora to the documentation as a real link', () => {
    renderLanding()

    const link = screen.getByRole('link', { name: 'Começar agora' })

    expect(link).toHaveAttribute('href', docsUrl)
    expect(screen.getByRole('main')).toContainElement(link)
  })

  it('opens the repository in a new tab and says so', () => {
    renderLanding()

    const link = screen.getByRole('link', { name: 'Ver no GitHub (abre em nova aba)' })

    expect(link).toHaveAttribute('href', repositoryUrl)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('links each item of the menu to a section that exists', () => {
    const { container } = renderLanding()
    const menu = screen.getByRole('navigation', { name: 'Navegação principal' })
    const anchors = within(menu)
      .getAllByRole('link')
      .map((link) => link.getAttribute('href') ?? '')
      .filter((href) => href.startsWith('#'))

    expect(anchors.length).toBeGreaterThan(0)

    for (const href of anchors) expect(container.querySelector(href)).not.toBeNull()
  })
})

describe('Landing playground', () => {
  it('asks for the look that the controls pick', async () => {
    const user = userEvent.setup()
    const { onLookChange } = renderLanding()

    await user.click(screen.getByRole('radio', { name: 'shadcn' }))
    await user.click(screen.getByRole('radio', { name: 'Verde' }))
    await user.click(screen.getByRole('radio', { name: 'Suave' }))
    await user.click(screen.getByRole('switch', { name: 'Densidade compacta' }))

    expect(onLookChange.mock.calls.map(([look]) => look)).toEqual([
      { ...defaultLook, style: 'shadcn' },
      { ...defaultLook, brand: '#0F766E' },
      { ...defaultLook, shape: 'soft' },
      { ...defaultLook, compact: true }
    ])
  })
})

describe('App', () => {
  it('renders the landing page and writes the theme that the controls pick', async () => {
    const user = userEvent.setup()

    render(<App />)

    const snippet = screen.getByLabelText('O tema que você está vendo')

    expect(snippet).not.toHaveTextContent('style: shadcn')

    await user.click(screen.getByRole('radio', { name: 'shadcn' }))
    await user.click(screen.getByRole('switch', { name: 'Densidade compacta' }))

    expect(snippet).toHaveTextContent('style: shadcn')
    expect(document.documentElement).toHaveAttribute('data-density', 'compact')

    await user.click(screen.getByRole('switch', { name: 'Densidade compacta' }))

    expect(document.documentElement).not.toHaveAttribute('data-density')
  })

  it('does not draw a breadcrumb trail', () => {
    render(<App />)

    expect(screen.queryByRole('navigation', { name: 'Trilha de navegação' })).not.toBeInTheDocument()
  })
})
