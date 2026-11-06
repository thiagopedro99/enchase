import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { axe } from '@tests/axe.ts'
import { createRef } from 'react'

import { Breadcrumbs } from '@components/common/Breadcrumbs/index.tsx'
import UIProvider from '@components/uiProvider/index.tsx'

import type { BreadcrumbItem } from '@components/common/Breadcrumbs/types.ts'

const short: BreadcrumbItem[] = [
  { value: 'home', label: 'Início', href: '/' },
  { value: 'docs', label: 'Docs', href: '/docs' },
  { value: 'api', label: 'API' }
]

const long: BreadcrumbItem[] = [
  { value: 'a', label: 'Nível A', href: '/a' },
  { value: 'b', label: 'Nível B', href: '/b' },
  { value: 'c', label: 'Nível C', href: '/c' },
  { value: 'd', label: 'Nível D', href: '/d' },
  { value: 'e', label: 'Nível E', href: '/e' },
  { value: 'f', label: 'Nível F' }
]

const withId: BreadcrumbItem[] = [
  { id: 'home', label: 'Início', href: '/' },
  { id: 'docs', label: 'Docs', href: '/docs' },
  { id: 'api', label: 'API' }
]

const withNeither: BreadcrumbItem[] = [
  { label: 'Início', href: '/' },
  { label: 'Docs', href: '/docs' },
  { label: 'API' }
]

const longWithNeither: BreadcrumbItem[] = [
  { label: 'Nível A', href: '/a' },
  { label: 'Nível B', href: '/b' },
  { label: 'Nível C', href: '/c' },
  { label: 'Nível D', href: '/d' },
  { label: 'Nível E', href: '/e' },
  { label: 'Nível F' }
]

const crumb = (name: 'value' | 'id', key: string, href: string | undefined): BreadcrumbItem => (name === 'value' ? { value: key, label: key, href } : { id: key, label: key, href })

const trailOf = (name: 'value' | 'id', keys: string[]) => keys.map((key, index) => crumb(name, key, index < keys.length - 1 ? `/${key}` : undefined))

const nodeOf = (label: string) => screen.getByText(label).closest('li')

const quiet = () => vi.spyOn(console, 'error').mockImplementation(() => undefined)

describe('Breadcrumbs', () => {
  it('renders a labelled navigation with an ordered list', () => {
    renderWithProviders(<Breadcrumbs items={short} />)
    const nav = screen.getByRole('navigation', { name: 'Trilha de navegação' })

    expect(within(nav).getByRole('list')).toBeInTheDocument()
    expect(within(nav).getAllByRole('listitem')).toHaveLength(3)
    expect(nav.querySelector('ol')).not.toBeNull()
  })

  it('links every item except the last, which is the current page', () => {
    renderWithProviders(<Breadcrumbs items={short} />)

    expect(screen.getByRole('link', { name: 'Início' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute('href', '/docs')
    expect(screen.queryByRole('link', { name: 'API' })).not.toBeInTheDocument()
    expect(screen.getByText('API')).toHaveAttribute('aria-current', 'page')
  })

  it('does not link the last item even when it has a destination', () => {
    renderWithProviders(<Breadcrumbs items={[{ value: 'a', label: 'A', href: '/a' }, { value: 'b', label: 'B', href: '/b' }]} />)

    expect(screen.queryByRole('link', { name: 'B' })).not.toBeInTheDocument()
    expect(screen.getByText('B')).toHaveAttribute('aria-current', 'page')
  })

  it('navigates through the provider when a crumb is clicked', () => {
    const navigate = vi.fn()
    render(
      <UIProvider navigate={navigate}>
        <Breadcrumbs items={short} />
      </UIProvider>
    )

    const notPrevented = fireEvent.click(screen.getByRole('link', { name: 'Docs' }))

    expect(navigate).toHaveBeenCalledWith('/docs')
    expect(notPrevented).toBe(false)
  })

  it('leaves native crumbs to the browser', () => {
    const navigate = vi.fn()
    render(
      <UIProvider navigate={navigate}>
        <Breadcrumbs items={[{ value: 'a', label: 'Docs', href: '/docs/', native: true }, { value: 'b', label: 'Atual' }]} />
      </UIProvider>
    )

    fireEvent.click(screen.getByRole('link', { name: 'Docs' }))

    expect(navigate).not.toHaveBeenCalled()
  })

  it('supports in-page anchors and items without a destination', () => {
    renderWithProviders(
      <Breadcrumbs
        items={[
          { value: 'a', label: 'Âncora', href: '#secao' },
          { value: 'b', label: 'Sem destino' },
          { value: 'c', label: 'Atual' }
        ]}
      />
    )

    expect(screen.getByRole('link', { name: 'Âncora' })).toHaveAttribute('href', '#secao')
    expect(screen.queryByRole('link', { name: 'Sem destino' })).not.toBeInTheDocument()
    expect(screen.getByText('Sem destino')).toBeInTheDocument()
  })

  it('hides the separators from assistive technology', () => {
    const { container } = renderWithProviders(<Breadcrumbs items={short} />)

    expect(container.querySelectorAll('span[aria-hidden="true"]')).toHaveLength(2)
    expect(container.querySelectorAll('li > span[aria-hidden="true"] svg')).toHaveLength(2)
  })

  it('renders nothing for an empty trail', () => {
    renderWithProviders(<Breadcrumbs items={[]} />)

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('collapses a long trail to first, ellipsis and the last items', () => {
    renderWithProviders(<Breadcrumbs items={long} maxItems={4} />)

    expect(screen.getByRole('link', { name: 'Nível A' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mostrar caminho completo' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Nível B' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Nível C' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Nível E' })).toBeInTheDocument()
    expect(screen.getByText('Nível F')).toHaveAttribute('aria-current', 'page')
  })

  it('keeps short trails intact', () => {
    renderWithProviders(<Breadcrumbs items={short} maxItems={4} />)

    expect(screen.queryByRole('button', { name: 'Mostrar caminho completo' })).not.toBeInTheDocument()
  })

  it('reveals the full trail from the ellipsis and moves focus to the first revealed item', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Breadcrumbs items={long} maxItems={4} />)

    await user.click(screen.getByRole('button', { name: 'Mostrar caminho completo' }))

    expect(screen.queryByRole('button', { name: 'Mostrar caminho completo' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Nível B' })).toHaveFocus()
    expect(screen.getByRole('link', { name: 'Nível C' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Nível D' })).toBeInTheDocument()
  })

  it('is reachable by keyboard', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Breadcrumbs items={short} />)

    await user.tab()
    expect(screen.getByRole('link', { name: 'Início' })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveFocus()
  })

  it('accepts a custom and a configurable accessible name', () => {
    const { unmount } = renderWithProviders(<Breadcrumbs items={short} ariaLabel="Caminho" />)

    expect(screen.getByRole('navigation', { name: 'Caminho' })).toBeInTheDocument()

    unmount()
    renderWithProviders(<Breadcrumbs items={short} />, { labels: { breadcrumb: 'You are here' } })

    expect(screen.getByRole('navigation', { name: 'You are here' })).toBeInTheDocument()
  })

  it('marks the root and its parts with slots and keeps the caller className, style and attributes', () => {
    renderWithProviders(<Breadcrumbs items={short} className="mine" style={{ color: 'red' }} id="trail" />)
    const nav = screen.getByRole('navigation', { name: 'Trilha de navegação' })

    expect(nav).toHaveAttribute('data-slot', 'breadcrumbs')
    expect(nav.className.split(' ').at(-1)).toBe('mine')
    expect(nav).toHaveStyle({ color: 'rgb(255, 0, 0)' })
    expect(nav).toHaveAttribute('id', 'trail')
    expect(nav.querySelector('[data-slot="breadcrumbs-list"]')).not.toBeNull()
    expect(nav.querySelectorAll('[data-slot="breadcrumbs-item"]')).toHaveLength(3)
    expect(screen.getByRole('link', { name: 'Início' })).toHaveAttribute('data-slot', 'breadcrumbs-link')
    expect(screen.getByText('API')).toHaveAttribute('data-slot', 'breadcrumbs-current')
  })

  it('has no axe violations collapsed or expanded', async () => {
    const user = userEvent.setup()
    const { container } = renderWithProviders(<Breadcrumbs items={long} maxItems={4} />)

    expect(await axe(container)).toHaveNoViolations()

    await user.click(screen.getByRole('button', { name: 'Mostrar caminho completo' }))

    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Breadcrumbs ref', () => {
  it('gives the ref the root element and clears it on unmount', () => {
    const ref = createRef<HTMLElement>()
    const { unmount } = renderWithProviders(<Breadcrumbs ref={ref} items={[{ value: 'home', label: 'Home', href: '/' }, { value: 'page', label: 'Page' }]} />)

    expect(ref.current).toBe(document.querySelector('[data-slot="breadcrumbs"]'))
    expect(ref.current).toBeInstanceOf(HTMLElement)
    expect(ref.current?.tagName).toBe('NAV')

    unmount()

    expect(ref.current).toBeNull()
  })
})

describe('Breadcrumbs item name', () => {
  afterEach(() => vi.restoreAllMocks())

  it('renders the same trail whether the items are named by value, by id or not at all, without a key warning', () => {
    const error = quiet()
    const markup = (items: BreadcrumbItem[]) => {
      const { unmount } = renderWithProviders(<Breadcrumbs items={items} />)
      const html = screen.getByRole('navigation').outerHTML

      unmount()

      return html
    }

    expect(markup(withId)).toBe(markup(short))
    expect(markup(withNeither)).toBe(markup(short))
    expect(error).not.toHaveBeenCalled()
  })

  it('keeps value and id off the page', () => {
    renderWithProviders(<Breadcrumbs items={[{ value: 'home', id: 'old', label: 'Início', href: '/' }, { id: 'docs', label: 'Docs', href: '/docs' }, { value: 'api', label: 'API' }]} />)

    expect(screen.getByRole('navigation').querySelectorAll('[id], [value]')).toHaveLength(0)
  })

  it('keys an item by its value before its id, so an id that repeats does not clash', () => {
    const error = quiet()

    renderWithProviders(<Breadcrumbs items={[{ value: 'a', id: 'same', label: 'A', href: '/a' }, { value: 'b', id: 'same', label: 'B', href: '/b' }, { value: 'c', label: 'C' }]} />)

    expect(screen.getAllByRole('listitem')).toHaveLength(3)
    expect(error).not.toHaveBeenCalled()
  })

  it('takes a trail that mixes both names with items that have neither, without a key warning', () => {
    const error = quiet()

    renderWithProviders(<Breadcrumbs items={[{ value: 'home', label: 'Início', href: '/' }, { id: 'docs', label: 'Docs', href: '/docs' }, { label: 'Guia', href: '/guia' }, { label: 'API' }]} />)

    expect(screen.getAllByRole('listitem')).toHaveLength(4)
    expect(screen.getByText('API')).toHaveAttribute('aria-current', 'page')
    expect(error).not.toHaveBeenCalled()
  })

  it('keeps the node of an item with neither name when the collapsed trail opens', async () => {
    const user = userEvent.setup()

    render(
      <UIProvider>
        <Breadcrumbs items={longWithNeither} maxItems={4} />
      </UIProvider>
    )
    const [first, fifth, last] = ['Nível A', 'Nível E', 'Nível F'].map(nodeOf)

    await user.click(document.querySelector('[data-slot="breadcrumbs-ellipsis"]') as HTMLElement)

    expect(screen.getAllByRole('listitem')).toHaveLength(6)
    expect(nodeOf('Nível A')).toBe(first)
    expect(nodeOf('Nível E')).toBe(fifth)
    expect(nodeOf('Nível F')).toBe(last)
  })

  describe.each(['value', 'id'] as const)('named by %s', (name) => {
    it('keeps the node of an item when another one comes in before the last', () => {
      const view = (keys: string[]) => (
        <UIProvider>
          <Breadcrumbs items={trailOf(name, keys)} />
        </UIProvider>
      )
      const { rerender } = render(view(['home', 'docs', 'api']))
      const [home, docs, api] = ['home', 'docs', 'api'].map(nodeOf)

      rerender(view(['home', 'docs', 'guide', 'api']))

      expect(screen.getAllByRole('listitem')).toHaveLength(4)
      expect(nodeOf('home')).toBe(home)
      expect(nodeOf('docs')).toBe(docs)
      expect(nodeOf('api')).toBe(api)
    })
  })
})
