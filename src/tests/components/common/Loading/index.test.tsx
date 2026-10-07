import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import { screen } from '@testing-library/react'
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
