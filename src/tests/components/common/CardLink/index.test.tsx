import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { axe } from '@tests/axe.ts'

import { CardLink } from '@components/common/CardLink/index.tsx'
import { Card } from '@components/common/Card/index.tsx'
import { Grid } from '@components/common/Grid/index.tsx'

describe('CardLink', () => {
  it('renders a real link with the given destination', () => {
    renderWithProviders(<CardLink href="/projects/enchase">Enchase</CardLink>)

    const link = screen.getByRole('link', { name: 'Enchase' })

    expect(link).toHaveAttribute('href', '/projects/enchase')
    expect(link).not.toHaveAttribute('target')
    expect(link).not.toHaveAttribute('rel')
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('is reached with the keyboard', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CardLink href="/projects">Projects</CardLink>)

    await user.tab()

    expect(screen.getByRole('link', { name: 'Projects' })).toHaveFocus()
  })

  it('takes its name from everything inside it, headings and text included', () => {
    renderWithProviders(
      <CardLink href="/projects/enchase">
        <h3>Enchase</h3>
        <p>Component library</p>
      </CardLink>
    )

    expect(screen.getByRole('link', { name: 'Enchase Component library' })).toBeInTheDocument()
  })

  it('warns that it opens in a new tab and protects the opener, with no icon of its own', () => {
    renderWithProviders(
      <CardLink href="https://github.com/thiagopedro99/enchase" target="_blank">
        Repository
      </CardLink>
    )

    const link = screen.getByRole('link', { name: 'Repository (abre em nova aba)' })

    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(link.querySelector('svg')).toBeNull()
  })

  it('keeps a custom rel and uses the configurable new tab label', () => {
    renderWithProviders(
      <CardLink href="https://example.com" target="_blank" rel="noopener">
        Site
      </CardLink>,
      { labels: { opensInNewTab: '(opens in a new tab)' } }
    )

    expect(screen.getByRole('link', { name: 'Site (opens in a new tab)' })).toHaveAttribute('rel', 'noopener')
  })

  it('adds nothing to the name of a link that stays in the page', () => {
    renderWithProviders(<CardLink href="/docs">Docs</CardLink>)

    expect(screen.getByRole('link')).toHaveAccessibleName('Docs')
    expect(screen.getByRole('link')).toHaveTextContent(/^Docs$/)
  })

  it('has no axe violations across variants and when it opens a new tab', async () => {
    const { container } = renderWithProviders(
      <>
        <CardLink href="/a">Default</CardLink>
        <CardLink href="/b" variant="elevated">
          Elevated
        </CardLink>
        <CardLink href="/c" variant="outlined">
          Outlined
        </CardLink>
        <CardLink href="https://example.com" target="_blank">
          External
        </CardLink>
      </>
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('CardLink contract', () => {
  it('marks the root with its own slot and the surface of a Card', () => {
    renderWithProviders(
      <>
        <CardLink href="/a" variant="outlined" data-testid="tile">
          a
        </CardLink>
        <Card variant="outlined" data-testid="card">
          b
        </Card>
      </>
    )
    const tile = screen.getByTestId('tile')
    const card = screen.getByTestId('card')

    expect(tile).toHaveAttribute('data-slot', 'card-link')
    expect(tile).toHaveAttribute('data-variant', 'outlined')
    expect(tile).toHaveAttribute('data-motion', 'off')
    expect(card.className.split(' ').every((name) => tile.classList.contains(name))).toBe(true)
  })

  it('uses the default variant of the Card when none is given', () => {
    renderWithProviders(
      <CardLink href="/a" data-testid="tile">
        a
      </CardLink>
    )

    expect(screen.getByTestId('tile')).toHaveAttribute('data-variant', 'default')
  })

  it('keeps the caller className last and merges the caller style over the padding', () => {
    renderWithProviders(
      <>
        <CardLink href="/a" padding="2rem" className="mine" data-testid="padded">
          a
        </CardLink>
        <CardLink href="/b" padding="2rem" style={{ padding: '1px', color: 'red' }} data-testid="styled">
          b
        </CardLink>
      </>
    )

    expect(screen.getByTestId('padded')).toHaveStyle({ padding: '2rem' })
    expect(screen.getByTestId('padded').className.split(' ').at(-1)).toBe('mine')
    expect(screen.getByTestId('styled')).toHaveStyle({ padding: '1px', color: 'rgb(255, 0, 0)' })
  })

  it('lifts only the elevated tile, and animation false turns the lift off', () => {
    renderWithProviders(
      <>
        <CardLink href="/a" variant="elevated" data-testid="lift">
          a
        </CardLink>
        <CardLink href="/b" variant="default" data-testid="flat">
          b
        </CardLink>
        <CardLink href="/c" variant="elevated" animation={false} data-testid="off">
          c
        </CardLink>
      </>
    )

    expect(screen.getByTestId('lift')).toHaveAttribute('data-motion', 'lift')
    expect(screen.getByTestId('flat')).toHaveAttribute('data-motion', 'off')
    expect(screen.getByTestId('off')).toHaveAttribute('data-motion', 'off')
  })

  it('does not hand the props of the tile to the element', () => {
    renderWithProviders(
      <CardLink href="/a" native variant="elevated" padding="1rem" animation={false} data-testid="tile">
        a
      </CardLink>
    )
    const tile = screen.getByTestId('tile')

    for (const name of ['native', 'variant', 'padding', 'animation']) expect(tile, name).not.toHaveAttribute(name)
  })

  it('sits in a list: a link inside the li of a grid that is a ul', async () => {
    const { container } = renderWithProviders(
      <Grid as="ul" columns={2} aria-label="Projects">
        <li>
          <CardLink href="/a">Enchase</CardLink>
        </li>
        <li>
          <CardLink href="/b">Portfolio</CardLink>
        </li>
      </Grid>
    )

    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual(['/a', '/b'])
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('CardLink navigation', () => {
  const link = () => screen.getByRole('link', { name: /^Docs/ })

  const renderLink = (props: Partial<Parameters<typeof CardLink>[0]> = {}, route = '/') =>
    renderWithProviders(
      <CardLink href="/docs" {...props}>
        Docs
      </CardLink>,
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

  it('leaves the browser alone for a modified click, a new tab, a download and the native option', () => {
    const { navigate, unmount } = renderLink()

    fireEvent.click(link(), { ctrlKey: true })
    fireEvent.click(link(), { metaKey: true })
    fireEvent.click(link(), { shiftKey: true })
    fireEvent.click(link(), { button: 1 })

    expect(navigate).not.toHaveBeenCalled()

    unmount()

    for (const props of [{ target: '_blank' }, { download: true }, { native: true }]) {
      const { navigate: other, unmount: leave } = renderLink(props)

      fireEvent.click(link())

      expect(other, JSON.stringify(props)).not.toHaveBeenCalled()

      leave()
    }
  })

  it('leaves an address outside the app to the browser', () => {
    const { navigate } = renderLink({ href: 'https://example.com/docs' })

    fireEvent.click(link())

    expect(navigate).not.toHaveBeenCalled()
  })
})
