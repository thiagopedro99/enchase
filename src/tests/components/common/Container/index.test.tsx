import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Container } from '@components/common/Container/index.tsx'
import { axe } from '@tests/axe.ts'

describe('Container', () => {
  it('marks its root with a slot and the default width', () => {
    render(<Container data-testid="c">Conteúdo</Container>)

    expect(screen.getByTestId('c')).toHaveAttribute('data-slot', 'container')
    expect(screen.getByTestId('c')).toHaveAttribute('data-max-width', 'lg')
  })

  it('turns padding and centering into attributes and variables instead of physical inline styles', () => {
    const { rerender } = render(<Container data-testid="c" padding={false} center={false} />)

    expect(screen.getByTestId('c')).toHaveAttribute('data-padding', 'none')
    expect(screen.getByTestId('c')).toHaveAttribute('data-center', 'false')
    expect(screen.getByTestId('c').getAttribute('style')).toBeNull()

    rerender(<Container data-testid="c" padding="3rem" />)

    expect(screen.getByTestId('c').style.getPropertyValue('--enchase-container-padding')).toBe('3rem')
    expect(screen.getByTestId('c').getAttribute('style')).not.toMatch(/left|right/)
  })

  it('keeps the caller className, style and attributes next to its own', () => {
    render(<Container data-testid="c" className="mine" style={{ color: 'red' }} id="x" />)
    const root = screen.getByTestId('c')

    expect(root.className.split(' ').at(-1)).toBe('mine')
    expect(root).toHaveStyle({ color: 'rgb(255, 0, 0)' })
    expect(root).toHaveAttribute('id', 'x')
  })

  it('has no axe violations', async () => {
    const { container } = render(<Container>Conteúdo</Container>)

    expect(await axe(container)).toHaveNoViolations()
  })
})
