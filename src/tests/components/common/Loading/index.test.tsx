import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from '@tests/axe.ts'

import { InlineLoading, Loading } from '@components/common/Loading/index.tsx'

describe('Loading', () => {
  it('announces a status with a default accessible label and hides the spinner graphic', () => {
    const { container } = renderWithProviders(<Loading />)

    expect(screen.getByRole('status')).toHaveTextContent('Carregando')
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
  })

  it('uses the visible text as the status message', () => {
    renderWithProviders(<Loading text="Salvando..." />)

    expect(screen.getByRole('status')).toHaveTextContent('Salvando...')
  })

  it('uses configurable labels', () => {
    renderWithProviders(<Loading />, { labels: { loading: 'Loading' } })

    expect(screen.getByRole('status')).toHaveTextContent('Loading')
  })

  it('makes the page inert behind a blocking overlay and restores it on unmount', () => {
    const { container, unmount } = renderWithProviders(<Loading overlay text="Processing" />)

    expect(container).toHaveAttribute('inert')

    unmount()

    expect(container).not.toHaveAttribute('inert')
  })

  it('exposes inline loading as a labelled status', () => {
    renderWithProviders(<InlineLoading label="Enviando" />)

    expect(screen.getByRole('status')).toHaveTextContent('Enviando')
  })

  it('has no axe violations', async () => {
    const { container } = renderWithProviders(
      <>
        <Loading text="Carregando dados" />
        <InlineLoading />
      </>
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Loading contract', () => {
  it('marks the root, the spinner and the text with slots and keeps the caller className and style', () => {
    renderWithProviders(<Loading text="Salvando" className="mine" style={{ color: 'red' }} data-testid="loading" />)
    const root = screen.getByTestId('loading')

    expect(root).toHaveAttribute('data-slot', 'loading')
    expect(root).toHaveAttribute('role', 'status')
    expect(root.className.split(' ').at(-1)).toBe('mine')
    expect(root).toHaveStyle({ color: 'rgb(255, 0, 0)' })
    expect(root.querySelector('[data-slot="loading-spinner"]')).toHaveAttribute('data-size', 'md')
    expect(root.querySelector('[data-slot="loading-text"]')).toHaveTextContent('Salvando')
  })

  it('maps the color to a css variable and the sizes to data-size', () => {
    renderWithProviders(<Loading size="xl" color="rebeccapurple" data-testid="loading" />)
    const spinner = screen.getByTestId('loading').querySelector('[data-slot="loading-spinner"]') as HTMLElement

    expect(spinner).toHaveAttribute('data-size', 'xl')
    expect(spinner.style.getPropertyValue('--spinner-color')).toBe('rebeccapurple')
  })

  it('spins by default and stops with animation false, the never mode or the off preset', () => {
    const { unmount } = renderWithProviders(
      <>
        <Loading data-testid="on" />
        <Loading animation={false} data-testid="false" />
        <Loading animation={{ recipe: 'fade' }} data-testid="other" />
      </>
    )
    const motionOf = (id: string) => screen.getByTestId(id).querySelector('[data-slot="loading-spinner"]')

    expect(motionOf('on')).toHaveAttribute('data-motion', 'on')
    expect(motionOf('false')).toHaveAttribute('data-motion', 'off')
    expect(motionOf('other')).toHaveAttribute('data-motion', 'off')

    unmount()
    const never = renderWithProviders(<Loading data-testid="loading" />, { motion: { mode: 'never' } })

    expect(motionOf('loading')).toHaveAttribute('data-motion', 'off')

    never.unmount()
    renderWithProviders(<Loading data-testid="loading" />, { motion: { preset: 'off' } })

    expect(motionOf('loading')).toHaveAttribute('data-motion', 'off')
  })

  it('maps the tuning duration to the spinner duration variable', () => {
    renderWithProviders(<Loading animation={{ tuning: { duration: 1.2 } }} data-testid="loading" />)
    const spinner = screen.getByTestId('loading').querySelector('[data-slot="loading-spinner"]') as HTMLElement

    expect(spinner.style.getPropertyValue('--enchase-spinner-duration')).toBe('1200ms')
  })

  it('does not put the motion library on the spinner', () => {
    renderWithProviders(<Loading data-testid="loading" />)
    const spinner = screen.getByTestId('loading').querySelector('[data-slot="loading-spinner"]') as HTMLElement

    expect(spinner.getAttribute('style') ?? '').not.toContain('transform')
  })

  it('renders the blocking overlay in a portal with slots, a state and the caller className', async () => {
    renderWithProviders(<Loading overlay text="Processando" className="mine" data-testid="overlay" />)
    const root = screen.getByTestId('overlay')

    expect(root.parentElement).toBe(document.body)
    expect(root).toHaveAttribute('data-slot', 'loading')
    expect(root.className.split(' ').at(-1)).toBe('mine')
    expect(root.querySelector('[data-slot="loading-backdrop"]')).toHaveAttribute('aria-hidden', 'true')
    expect(root.querySelector('[data-slot="loading-content"]')).toHaveAttribute('role', 'status')
    await waitFor(() => expect(root).toHaveAttribute('data-state', 'open'))
  })

  it('locks the page scroll while the overlay is mounted and restores it afterwards', () => {
    document.body.style.overflow = 'auto'
    const { unmount } = renderWithProviders(<Loading overlay text="Processando" />)

    expect(document.body.style.overflow).toBe('hidden')

    unmount()

    expect(document.body.style.overflow).toBe('auto')
  })

  it('marks the inline loading with slots, a status and the caller className', () => {
    renderWithProviders(<InlineLoading label="Enviando" className="mine" data-testid="inline" />)
    const root = screen.getByTestId('inline')

    expect(root).toHaveAttribute('data-slot', 'inline-loading')
    expect(root).toHaveAttribute('role', 'status')
    expect(root.className.split(' ').at(-1)).toBe('mine')
    expect(root.querySelector('[data-slot="inline-loading-spinner"]')).toHaveAttribute('data-size', 'sm')
  })
})
