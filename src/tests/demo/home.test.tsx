import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from '@tests/axe.ts'

import { docsUrl, repositoryUrl } from '@demo/pages/home/defaultData.tsx'
import App from '@demo/App.tsx'
import Home from '@demo/pages/home/index.tsx'

const pages = [['Home', Home]] as const

const headingLevels = () => screen.getAllByRole('heading').map((heading) => Number(heading.tagName.slice(1)))

describe.each(pages)('%s page', (_, Page) => {
  it('has no axe violations', async () => {
    const { container } = renderWithProviders(<Page />)

    expect(await axe(container)).toHaveNoViolations()
  }, 20000)

  it('exposes exactly one h1 inside the main landmark', () => {
    renderWithProviders(<Page />)

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('main')).toContainElement(screen.getByRole('heading', { level: 1 }))
  })

  it('never skips a heading level', () => {
    renderWithProviders(<Page />)

    const levels = headingLevels()
    const skips = levels.filter((level, index) => index > 0 && level - levels[index - 1] > 1)

    expect(skips).toEqual([])
  })

  it('has banner, navigation, main and contentinfo landmarks and a skip link', () => {
    renderWithProviders(<Page />)

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Navegação principal' })).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Pular para o conteúdo' })).toBeInTheDocument()
  })
})

describe('Home links', () => {
  it('sends Começar to the documentation as a real link', () => {
    renderWithProviders(<Home />)

    const link = screen.getByRole('link', { name: 'Começar' })

    expect(link).toHaveAttribute('href', docsUrl)
    expect(screen.getByRole('main')).toContainElement(link)
  })

  it('opens the repository in a new tab and says so', () => {
    renderWithProviders(<Home />)

    const link = screen.getByRole('link', { name: 'Repositório (abre em nova aba)' })

    expect(link).toHaveAttribute('href', repositoryUrl)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })
})

describe('App navigation state', () => {
  it('does not repeat the home item in a breadcrumb trail', () => {
    render(<App />)

    expect(screen.queryByRole('navigation', { name: 'Trilha de navegação' })).not.toBeInTheDocument()
  })

  it('marks the home link of the menu as the current page', () => {
    render(<App />)

    const links = screen.getAllByRole('link', { name: 'Início' })

    expect(links.filter((link) => link.getAttribute('aria-current') === 'page')).toHaveLength(1)
  })
})
