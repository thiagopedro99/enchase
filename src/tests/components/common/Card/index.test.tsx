import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'

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
})
