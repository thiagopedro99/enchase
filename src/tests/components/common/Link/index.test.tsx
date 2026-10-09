import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

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
})
