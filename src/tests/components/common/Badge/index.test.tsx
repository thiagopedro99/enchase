import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from '@tests/axe.ts'

import { Badge } from '@components/common/Badge/index.tsx'

const variants = ['neutral', 'primary', 'success', 'warning', 'error', 'info'] as const

const sizes = ['sm', 'md'] as const

describe('Badge', () => {
  it('renders its content in a plain span with no role of its own', () => {
    renderWithProviders(<Badge>Novo</Badge>)
    const badge = screen.getByText('Novo')

    expect(badge.tagName).toBe('SPAN')
    expect(badge).not.toHaveAttribute('role')
  })

  it('is neutral and medium by default', () => {
    renderWithProviders(<Badge>Novo</Badge>)

    expect(screen.getByText('Novo')).toHaveAttribute('data-variant', 'neutral')
    expect(screen.getByText('Novo')).toHaveAttribute('data-size', 'md')
  })

  it.each(variants)('takes variant="%s"', (variant) => {
    renderWithProviders(<Badge variant={variant}>Estado</Badge>)

    expect(screen.getByText('Estado')).toHaveAttribute('data-variant', variant)
  })

  it.each(sizes)('takes size="%s"', (size) => {
    renderWithProviders(<Badge size={size}>Estado</Badge>)

    expect(screen.getByText('Estado')).toHaveAttribute('data-size', size)
  })

  it('does not pass variant and size to the page as attributes', () => {
    renderWithProviders(<Badge variant="error" size="sm">Erro</Badge>)

    expect(screen.getByText('Erro')).not.toHaveAttribute('variant')
    expect(screen.getByText('Erro')).not.toHaveAttribute('size')
  })

  it('keeps content other than text, such as an icon next to the label', () => {
    renderWithProviders(
      <Badge variant="success">
        <svg aria-hidden="true" data-testid="icon" />
        Pago
      </Badge>
    )

    expect(screen.getByTestId('icon')).toBeInTheDocument()
    expect(screen.getByText('Pago')).toContainElement(screen.getByTestId('icon'))
  })

  it('passes the other attributes to the span', () => {
    renderWithProviders(
      <Badge id="status" title="Pagamento confirmado" data-testid="badge">
        Pago
      </Badge>
    )
    const badge = screen.getByTestId('badge')

    expect(badge).toHaveAttribute('id', 'status')
    expect(badge).toHaveAttribute('title', 'Pagamento confirmado')
  })

  it('becomes part of the accessible name of the control that holds it', () => {
    renderWithProviders(
      <button type="button">
        Caixa de entrada <Badge variant="primary">3</Badge>
      </button>
    )

    expect(screen.getByRole('button', { name: 'Caixa de entrada 3' })).toBeInTheDocument()
  })

  it('has no axe violations in every variant and size', async () => {
    const { container } = renderWithProviders(
      <p>
        {variants.flatMap((variant) => sizes.map((size) => <Badge key={`${variant}-${size}`} variant={variant} size={size}>{`${variant} ${size}`}</Badge>))}
      </p>
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Badge contract', () => {
  it('marks the root with a data-slot', () => {
    renderWithProviders(<Badge>Novo</Badge>)

    expect(screen.getByText('Novo')).toHaveAttribute('data-slot', 'badge')
  })

  it('keeps the caller className last and lets the caller style win', () => {
    renderWithProviders(
      <Badge className="mine" style={{ color: 'red' }}>
        Novo
      </Badge>
    )
    const badge = screen.getByText('Novo')

    expect(badge.className.split(' ').at(-1)).toBe('mine')
    expect(badge.style.color).toBe('red')
  })

  it('keeps the data-slot of the library when the caller sends one', () => {
    renderWithProviders(<Badge data-slot="mine">Novo</Badge>)

    expect(screen.getByText('Novo')).toHaveAttribute('data-slot', 'badge')
  })
})
