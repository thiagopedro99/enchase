import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Grid } from '@components/common/Grid/index.tsx'
import { axe } from '@tests/axe.ts'

describe('Grid', () => {
  it('describes the columns with a variable', () => {
    render(<Grid data-testid="g" columns={3} />)
    const root = screen.getByTestId('g')

    expect(root).toHaveAttribute('data-slot', 'grid')
    expect(root.style.getPropertyValue('--enchase-grid-columns')).toBe('repeat(auto-fit, minmax(min(100%, max(var(--enchase-grid-min-column, 14rem), calc((100% - 2 * var(--enchase-grid-gap, var(--enchase-space-md))) / 3))), 1fr))')
  })

  it('uses auto-fit with a minimum width when asked and passes the gap through a variable', () => {
    render(<Grid data-testid="g" minColumnWidth="200px" gap="1rem" />)
    const root = screen.getByTestId('g')

    expect(root.style.getPropertyValue('--enchase-grid-columns')).toBe('repeat(auto-fit, minmax(200px, 1fr))')
    expect(root.style.getPropertyValue('--enchase-grid-gap')).toBe('1rem')
  })

  it('keeps the caller className and style', () => {
    render(<Grid data-testid="g" className="mine" style={{ color: 'red' }} />)

    expect(screen.getByTestId('g').className.split(' ').at(-1)).toBe('mine')
    expect(screen.getByTestId('g')).toHaveStyle({ color: 'rgb(255, 0, 0)' })
  })

  it('has no axe violations', async () => {
    const { container } = render(<Grid>Conteúdo</Grid>)

    expect(await axe(container)).toHaveNoViolations()
  })
})
