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
