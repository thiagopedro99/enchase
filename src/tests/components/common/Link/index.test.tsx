import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from '@tests/axe.ts'

import { Link } from '@components/common/Link/index.tsx'
import UIProvider from '@components/uiProvider/index.tsx'

const renderLink = (props: Partial<Parameters<typeof Link>[0]> = {}, navigate: ((href: string) => void) | null = vi.fn()) =>
  render(
    <UIProvider navigate={navigate ?? undefined}>
      <Link href="/docs" {...props}>
        Docs
      </Link>
    </UIProvider>
  )

const link = () => screen.getByRole('link', { name: 'Docs' })

describe('Link', () => {
  it('renders a real anchor with the href and the other attributes it receives', () => {
    renderLink({ className: 'custom', 'aria-label': undefined, 'data-testid': 'docs-link' } as never)

    expect(link()).toHaveAttribute('href', '/docs')
    expect(link()).toHaveClass('custom')
    expect(screen.getByTestId('docs-link')).toBe(link())
  })

  it('navigates through the provider on a plain click and cancels the browser navigation', () => {
    const navigate = vi.fn()
    renderLink({}, navigate)

    const notPrevented = fireEvent.click(link())

    expect(navigate).toHaveBeenCalledTimes(1)
    expect(navigate).toHaveBeenCalledWith('/docs')
    expect(notPrevented).toBe(false)
  })

  it('also navigates when the target is _self', () => {
    const navigate = vi.fn()
    renderLink({ target: '_self' }, navigate)

    fireEvent.click(link())

    expect(navigate).toHaveBeenCalledWith('/docs')
  })

  it.each([
    ['ctrl', { ctrlKey: true }],
    ['meta', { metaKey: true }],
    ['shift', { shiftKey: true }],
    ['alt', { altKey: true }],
    ['the middle button', { button: 1 }]
  ])('leaves the click to the browser with %s', (_name, init) => {
    const navigate = vi.fn()
    renderLink({}, navigate)

    const notPrevented = fireEvent.click(link(), init)

    expect(navigate).not.toHaveBeenCalled()
    expect(notPrevented).toBe(true)
  })

  it.each([
    ['a link that opens in a new tab', { target: '_blank' }],
    ['a download', { download: '' }],
    ['an external url', { href: 'https://example.com/docs' }],
    ['a protocol relative url', { href: '//example.com/docs' }],
    ['a section of the page', { href: '#intro' }],
    ['a mail link', { href: 'mailto:hello@example.com' }],
    ['a phone link', { href: 'tel:+5511999999999' }],
    ['a relative path', { href: 'docs' }]
  ])('leaves %s to the browser', (_name, props) => {
    const navigate = vi.fn()
    renderLink(props, navigate)

    const notPrevented = fireEvent.click(link())

    expect(navigate).not.toHaveBeenCalled()
    expect(notPrevented).toBe(true)
  })

  it('leaves the click to the browser when the link is native, without passing the prop to the page', () => {
    const navigate = vi.fn()
    renderLink({ native: true }, navigate)

    const notPrevented = fireEvent.click(link())

    expect(navigate).not.toHaveBeenCalled()
    expect(notPrevented).toBe(true)
    expect(link()).not.toHaveAttribute('native')
  })

  it('leaves the navigation to the browser when the provider has no navigate', () => {
    renderLink({}, null)

    expect(fireEvent.click(link())).toBe(true)
  })

  it('leaves the navigation to the browser without any provider', () => {
    render(<Link href="/docs">Docs</Link>)

    expect(fireEvent.click(link())).toBe(true)
  })

  it('runs the onClick of the caller first and respects its preventDefault', () => {
    const navigate = vi.fn()
    const onClick = vi.fn((event: { preventDefault: () => void }) => event.preventDefault())
    renderLink({ onClick }, navigate)

    fireEvent.click(link())

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(navigate).not.toHaveBeenCalled()
  })

  it('still navigates when the onClick of the caller does not cancel the event', () => {
    const navigate = vi.fn()
    const onClick = vi.fn()
    renderLink({ onClick }, navigate)

    fireEvent.click(link())

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(navigate).toHaveBeenCalledWith('/docs')
  })

  it('marks the root with a data-slot and merges the class and style of the caller', () => {
    renderLink({ className: 'mine', style: { color: 'red' } })

    expect(link()).toHaveAttribute('data-slot', 'link')
    expect(link().getAttribute('class')).toMatch(/link/)
    expect(link()).toHaveClass('mine')
    expect(link().style.color).toBe('red')
  })

  it('adds rel noopener noreferrer to a new tab link unless the caller sets one', () => {
    const { unmount } = renderLink({ target: '_blank' })

    expect(link()).toHaveAttribute('rel', 'noopener noreferrer')

    unmount()
    renderLink({ target: '_blank', rel: 'me' })

    expect(link()).toHaveAttribute('rel', 'me')
  })

  it('has no rel on a plain link', () => {
    renderLink()

    expect(link()).not.toHaveAttribute('rel')
  })

  it('has no axe violations', async () => {
    const { container } = renderLink()

    expect(await axe(container)).toHaveNoViolations()
  })

  it('lets a composing component rename the slot of its link', () => {
    render(<Link href="/x" {...{ 'data-slot': 'sidebar-item-control' }}>Item</Link>)

    expect(screen.getByRole('link', { name: 'Item' })).toHaveAttribute('data-slot', 'sidebar-item-control')
  })
})

describe('Link to a section of the current page', () => {
  const renderAt = (href: string, currentHref?: string) => {
    const navigate = vi.fn()

    render(
      <UIProvider navigate={navigate} currentHref={currentHref}>
        <Link href={href}>Docs</Link>
      </UIProvider>
    )

    return navigate
  }

  it.each([
    ['the home page with a hash', '/#recursos', '/'],
    ['a route with a hash that is the current page', '/sobre#equipe', '/sobre'],
    ['the current page written with a trailing slash and a query', '/sobre/?a=1#equipe', '/sobre'],
    ['the current page when the current href also has a hash', '/sobre#equipe', '/sobre#contato']
  ])('leaves %s to the browser', (_name, href, currentHref) => {
    const navigate = renderAt(href, currentHref)

    const notPrevented = fireEvent.click(link())

    expect(navigate).not.toHaveBeenCalled()
    expect(notPrevented).toBe(true)
  })

  it.each([
    ['another route with a hash', '/sobre#equipe', '/'],
    ['a nested route with a hash', '/docs/api#props', '/docs'],
    ['the current route without a hash', '/sobre', '/sobre']
  ])('still navigates through the provider for %s', (_name, href, currentHref) => {
    const navigate = renderAt(href, currentHref)

    const notPrevented = fireEvent.click(link())

    expect(navigate).toHaveBeenCalledWith(href)
    expect(notPrevented).toBe(false)
  })

  it('reads the current page from the browser when the provider has no currentHref', () => {
    window.history.replaceState(null, '', '/sobre')

    try {
      const same = renderAt('/sobre#equipe')

      fireEvent.click(link())
      cleanup()

      const other = renderAt('/outra#equipe')

      fireEvent.click(link())

      expect(same).not.toHaveBeenCalled()
      expect(other).toHaveBeenCalledWith('/outra#equipe')
    } finally {
      window.history.replaceState(null, '', '/')
    }
  })
})
