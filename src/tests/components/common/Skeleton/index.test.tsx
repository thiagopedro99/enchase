import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from '@tests/axe.ts'

import { Skeleton } from '@components/common/Skeleton/index.tsx'

describe('Skeleton', () => {
  it('is hidden from assistive technology', () => {
    const { container } = renderWithProviders(<Skeleton variant="circular" width="40px" />)

    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = renderWithProviders(<Skeleton />)

    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Skeleton contract', () => {
  it('marks the root with a slot and the variant and keeps the caller className and style', () => {
    renderWithProviders(<Skeleton variant="rectangular" className="mine" style={{ opacity: 0.4 }} data-testid="skeleton" />)
    const skeleton = screen.getByTestId('skeleton')

    expect(skeleton).toHaveAttribute('data-slot', 'skeleton')
    expect(skeleton).toHaveAttribute('data-variant', 'rectangular')
    expect(skeleton.className.split(' ').at(-1)).toBe('mine')
    expect(skeleton).toHaveStyle({ opacity: '0.4' })
  })

  it('maps width and height to css variables and uses one size for the circle', () => {
    renderWithProviders(
      <>
        <Skeleton width="120px" height="8px" data-testid="text" />
        <Skeleton variant="circular" width="32px" height="64px" data-testid="circle" />
      </>
    )

    expect(screen.getByTestId('text').style.getPropertyValue('--skeleton-width')).toBe('120px')
    expect(screen.getByTestId('text').style.getPropertyValue('--skeleton-height')).toBe('8px')
    expect(screen.getByTestId('circle').style.getPropertyValue('--skeleton-width')).toBe('32px')
    expect(screen.getByTestId('circle').style.getPropertyValue('--skeleton-height')).toBe('32px')
  })

  it('runs the shimmer by default and stops with animation false, the never mode or the off preset', () => {
    const { unmount } = renderWithProviders(
      <>
        <Skeleton data-testid="on" />
        <Skeleton animation={false} data-testid="false" />
        <Skeleton animation={{ recipe: 'fade' }} data-testid="other" />
      </>
    )

    expect(screen.getByTestId('on')).toHaveAttribute('data-motion', 'on')
    expect(screen.getByTestId('false')).toHaveAttribute('data-motion', 'off')
    expect(screen.getByTestId('other')).toHaveAttribute('data-motion', 'off')

    unmount()
    const never = renderWithProviders(<Skeleton data-testid="skeleton" />, { motion: { mode: 'never' } })

    expect(screen.getByTestId('skeleton')).toHaveAttribute('data-motion', 'off')

    never.unmount()
    renderWithProviders(<Skeleton data-testid="skeleton" />, { motion: { preset: 'off' } })

    expect(screen.getByTestId('skeleton')).toHaveAttribute('data-motion', 'off')
  })

  it('maps the tuning duration to a css variable', () => {
    renderWithProviders(<Skeleton animation={{ tuning: { duration: 2.5 } }} data-testid="skeleton" />)

    expect(screen.getByTestId('skeleton').style.getPropertyValue('--enchase-shimmer-duration')).toBe('2500ms')
  })

  it('does not animate background-position', () => {
    renderWithProviders(<Skeleton data-testid="skeleton" />)

    expect(screen.getByTestId('skeleton').getAttribute('style') ?? '').not.toContain('background')
  })
})
