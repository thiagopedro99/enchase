import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from '@tests/axe.ts'

import { docsUrl } from '@components/layout/defaultData.ts'
import { repositoryUrl } from '@pages/home/defaultData.ts'
import ComponentsDemo from '@pages/componentsDemo/index.tsx'
import GettingStarted from '@pages/gettingStarted/index.tsx'
import NotFound from '@pages/notFound/index.tsx'
import Home from '@pages/home/index.tsx'

const pages = [
  ['Home', Home],
  ['GettingStarted', GettingStarted],
  ['ComponentsDemo', ComponentsDemo],
  ['NotFound', NotFound]
] as const

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

describe('GettingStarted layout', () => {
  it('stacks and centers the page header and the closing call to action', () => {
    renderWithProviders(<GettingStarted />)

    const header = screen.getByRole('heading', { level: 1 }).parentElement as HTMLElement
    const closing = screen.getByRole('heading', { name: 'Pronto para começar?' }).parentElement as HTMLElement

    for (const element of [header, closing]) {
      expect(getComputedStyle(element).flexDirection).toBe('column')
      expect(getComputedStyle(element).alignItems).toBe('center')
    }
  })
})
