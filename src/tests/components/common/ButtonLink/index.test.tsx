import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { axe } from '@tests/axe.ts'

import { ButtonLink } from '@components/common/ButtonLink/index.tsx'

describe('ButtonLink', () => {
  it('renders a real link with the given destination', () => {
    renderWithProviders(<ButtonLink href="/docs/">Começar</ButtonLink>)

    const link = screen.getByRole('link', { name: 'Começar' })

    expect(link).toHaveAttribute('href', '/docs/')
    expect(link).not.toHaveAttribute('target')
    expect(link).not.toHaveAttribute('rel')
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('shares the button style through the same data attributes', () => {
    renderWithProviders(
      <>
        <ButtonLink href="/a">Padrão</ButtonLink>
        <ButtonLink href="/b" variant="secondary" size="sm" fullWidth className="custom">
          Custom
        </ButtonLink>
      </>
    )

    const plain = screen.getByRole('link', { name: 'Padrão' })
    const custom = screen.getByRole('link', { name: 'Custom' })

    expect(plain).toHaveAttribute('data-variant', 'primary')
    expect(plain).toHaveAttribute('data-size', 'md')
    expect(plain).not.toHaveAttribute('data-full-width')
    expect(custom).toHaveAttribute('data-variant', 'secondary')
    expect(custom).toHaveAttribute('data-size', 'sm')
    expect(custom).toHaveAttribute('data-full-width')
    expect(custom).toHaveClass('custom')
    expect(custom).not.toHaveAttribute('variant')
  })

  it('is reached with the keyboard', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ButtonLink href="/docs/">Começar</ButtonLink>)

    await user.tab()

    expect(screen.getByRole('link', { name: 'Começar' })).toHaveFocus()
  })

  it('warns that an external link opens in a new tab and protects the opener', () => {
    renderWithProviders(
      <ButtonLink href="https://github.com/thiagopedro99/enchase" target="_blank">
        Repositório
      </ButtonLink>
    )

    const link = screen.getByRole('link', { name: 'Repositório (abre em nova aba)' })

    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('keeps a custom rel and uses the configurable new tab label', () => {
    renderWithProviders(
      <ButtonLink href="https://example.com" target="_blank" rel="noopener">
        Site
      </ButtonLink>,
      { labels: { opensInNewTab: '(opens in a new tab)' } }
    )

    const link = screen.getByRole('link', { name: 'Site (opens in a new tab)' })

    expect(link).toHaveAttribute('rel', 'noopener')
  })

  it('accepts animation={false} and still renders a working link', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <ButtonLink href="/docs/" animation={false}>
        Começar
      </ButtonLink>
    )

    await user.tab()

    expect(screen.getByRole('link', { name: 'Começar' })).toHaveFocus()
  })

  it('has no axe violations across variants', async () => {
    const { container } = renderWithProviders(
      <>
        <ButtonLink href="/a" variant="primary">
          Primary
        </ButtonLink>
        <ButtonLink href="/b" variant="outline">
          Outline
        </ButtonLink>
        <ButtonLink href="https://example.com" target="_blank" variant="ghost">
          Externo
        </ButtonLink>
      </>
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('ButtonLink contract', () => {
  it('marks the root and the icon with slots and keeps the caller className and style', () => {
    renderWithProviders(
      <ButtonLink href="https://example.com" target="_blank" className="mine" style={{ color: 'red' }}>
        Site
      </ButtonLink>
    )
    const link = screen.getByRole('link', { name: 'Site (abre em nova aba)' })

    expect(link).toHaveAttribute('data-slot', 'button-link')
    expect(link.className.split(' ').at(-1)).toBe('mine')
    expect(link).toHaveStyle({ color: 'rgb(255, 0, 0)' })
    expect(link.querySelector('[data-slot="button-link-icon"]')).toBeInTheDocument()
  })

  it('follows the same motion mapping as the button', () => {
    renderWithProviders(
      <>
        <ButtonLink href="/a">Press</ButtonLink>
        <ButtonLink href="/b" animation={false}>
          Off
        </ButtonLink>
        <ButtonLink href="/c" animation={{ recipe: 'lift', tuning: { distance: 4 } }}>
          Lift
        </ButtonLink>
      </>
    )

    expect(screen.getByRole('link', { name: 'Press' })).toHaveAttribute('data-motion', 'press')
    expect(screen.getByRole('link', { name: 'Off' })).toHaveAttribute('data-motion', 'off')
    expect(screen.getByRole('link', { name: 'Lift' }).style.getPropertyValue('--enchase-button-distance')).toBe('4px')
  })
})

describe('ButtonLink navigation', () => {
  const link = () => screen.getByRole('link', { name: /^Docs/ })

  const renderLink = (props: Partial<Parameters<typeof ButtonLink>[0]> = {}, route = '/') =>
    renderWithProviders(
      <ButtonLink href="/docs" {...props}>
        Docs
      </ButtonLink>,
      { route }
    )

  it('navigates through the provider on a plain click and cancels the browser navigation', () => {
    const { navigate } = renderLink()

    const notPrevented = fireEvent.click(link())

    expect(navigate).toHaveBeenCalledTimes(1)
    expect(navigate).toHaveBeenCalledWith('/docs')
    expect(notPrevented).toBe(false)
  })

  it('runs the click handler of the caller first and respects its preventDefault', () => {
    const onClick = vi.fn((event: { preventDefault: () => void }) => event.preventDefault())
    const { navigate } = renderLink({ onClick })

    fireEvent.click(link())

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(navigate).not.toHaveBeenCalled()
  })

  it.each([
    ['ctrl', { ctrlKey: true }],
    ['meta', { metaKey: true }],
    ['shift', { shiftKey: true }],
    ['alt', { altKey: true }],
    ['the middle button', { button: 1 }]
  ])('leaves the click to the browser with %s', (_name, init) => {
    const { navigate } = renderLink()

    const notPrevented = fireEvent.click(link(), init)

    expect(navigate).not.toHaveBeenCalled()
    expect(notPrevented).toBe(true)
  })

  it.each([
    ['a link that opens in a new tab', { target: '_blank' }, '/'],
    ['a download', { download: '' }, '/'],
    ['an external url', { href: 'https://example.com/docs' }, '/'],
    ['a section of the page', { href: '#intro' }, '/'],
    ['a hash of the current page', { href: '/docs#intro' }, '/docs'],
    ['a relative path', { href: 'docs' }, '/']
  ])('leaves %s to the browser', (_name, props, route) => {
    const { navigate } = renderLink(props, route)

    const notPrevented = fireEvent.click(link())

    expect(navigate).not.toHaveBeenCalled()
    expect(notPrevented).toBe(true)
  })

  it('navigates to a hash of another page', () => {
    const { navigate } = renderLink({ href: '/docs#intro' }, '/')

    fireEvent.click(link())

    expect(navigate).toHaveBeenCalledWith('/docs#intro')
  })

  it('leaves the click to the browser when the link is native, without passing the prop to the page', () => {
    const { navigate } = renderLink({ native: true })

    const notPrevented = fireEvent.click(link())

    expect(navigate).not.toHaveBeenCalled()
    expect(notPrevented).toBe(true)
    expect(link()).not.toHaveAttribute('native')
  })

  it('keeps the download attribute on the anchor', () => {
    renderLink({ download: 'manual.pdf' })

    expect(link()).toHaveAttribute('download', 'manual.pdf')
  })
})
