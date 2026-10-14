import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { axe } from '@tests/axe.ts'

import { Card } from '@components/common/Card/index.tsx'

describe('Card', () => {
  it('renders every variant and passes through attributes', () => {
    renderWithProviders(
      <>
        <Card variant="default" data-testid="default">
          a
        </Card>
        <Card variant="elevated" data-testid="elevated">
          b
        </Card>
        <Card variant="outlined" data-testid="outlined">
          c
        </Card>
      </>
    )

    expect(screen.getByTestId('elevated')).toBeInTheDocument()
    expect(screen.getByTestId('outlined')).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = renderWithProviders(<Card variant="elevated">Conteúdo</Card>)

    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Card contract', () => {
  it('marks the root with a slot and the variant and keeps the caller className last', () => {
    renderWithProviders(
      <Card variant="outlined" className="mine" data-testid="card">
        a
      </Card>
    )
    const card = screen.getByTestId('card')

    expect(card).toHaveAttribute('data-slot', 'card')
    expect(card).toHaveAttribute('data-variant', 'outlined')
    expect(card.className.split(' ').at(-1)).toBe('mine')
  })

  it('merges the caller style over the padding prop', () => {
    renderWithProviders(
      <>
        <Card padding="2rem" data-testid="padded">
          a
        </Card>
        <Card padding="2rem" style={{ padding: '1px', color: 'red' }} data-testid="styled">
          b
        </Card>
      </>
    )

    expect(screen.getByTestId('padded')).toHaveStyle({ padding: '2rem' })
    expect(screen.getByTestId('styled')).toHaveStyle({ padding: '1px', color: 'rgb(255, 0, 0)' })
  })

  it('lifts only the elevated card and calls the motion lift', () => {
    renderWithProviders(
      <>
        <Card variant="elevated" data-testid="elevated">
          a
        </Card>
        <Card variant="default" data-testid="default">
          b
        </Card>
      </>
    )

    expect(screen.getByTestId('elevated')).toHaveAttribute('data-motion', 'lift')
    expect(screen.getByTestId('default')).toHaveAttribute('data-motion', 'off')
  })

  it('turns the lift off with animation false, never mode or the off preset', () => {
    renderWithProviders(
      <>
        <Card variant="elevated" animation={false} data-testid="false">
          a
        </Card>
        <Card variant="elevated" animation={{ recipe: 'fade' }} data-testid="other">
          b
        </Card>
      </>
    )

    expect(screen.getByTestId('false')).toHaveAttribute('data-motion', 'off')
    expect(screen.getByTestId('other')).toHaveAttribute('data-motion', 'off')
  })

  it('does not lift under the never mode or the off preset', () => {
    const { unmount } = renderWithProviders(<Card variant="elevated" data-testid="card">a</Card>, { motion: { mode: 'never' } })

    expect(screen.getByTestId('card')).toHaveAttribute('data-motion', 'off')

    unmount()
    renderWithProviders(<Card variant="elevated" data-testid="card">a</Card>, { motion: { preset: 'off' } })

    expect(screen.getByTestId('card')).toHaveAttribute('data-motion', 'off')
  })

  it('maps the tuning to css variables and scales by preset', () => {
    const { unmount } = renderWithProviders(
      <Card variant="elevated" animation={{ tuning: { duration: 0.3, distance: 6 } }} data-testid="card">
        a
      </Card>
    )

    expect(screen.getByTestId('card').style.getPropertyValue('--enchase-card-duration')).toBe('300ms')
    expect(screen.getByTestId('card').style.getPropertyValue('--enchase-card-lift')).toBe('6px')

    unmount()
    renderWithProviders(
      <Card variant="elevated" data-testid="card">
        a
      </Card>,
      { motion: { preset: 'expressive' } }
    )

    expect(screen.getByTestId('card').style.getPropertyValue('--enchase-card-lift')).toBe('3.2px')
  })

  it('does not use the motion library on the root', () => {
    renderWithProviders(
      <Card variant="elevated" data-testid="card">
        a
      </Card>
    )

    expect(screen.getByTestId('card').getAttribute('style') ?? '').not.toContain('transform')
  })
})
