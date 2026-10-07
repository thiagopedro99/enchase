import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
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
        <ButtonLink href="/a" $variant="primary">
          Primary
        </ButtonLink>
        <ButtonLink href="/b" $variant="outline">
          Outline
        </ButtonLink>
        <ButtonLink href="https://example.com" target="_blank" $variant="ghost">
          Externo
        </ButtonLink>
      </>
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})
