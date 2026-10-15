import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Container } from '@components/common/Container/index.tsx'
import UIProvider from '@components/uiProvider/index.tsx'
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
    expect(screen.getByTestId('c').getAttribute('style')).not.toMatch(/left|right|padding/)

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

  it('takes the maximum width from the configured breakpoints', () => {
    const { rerender } = render(<Container data-testid="c" maxWidth="lg" />)

    expect(screen.getByTestId('c').style.getPropertyValue('--enchase-container-max')).toBe('992px')

    rerender(<Container data-testid="c" maxWidth="xxl" />)

    expect(screen.getByTestId('c').style.getPropertyValue('--enchase-container-max')).toBe('1400px')
    expect(screen.getByTestId('c')).toHaveAttribute('data-max-width', 'xxl')
  })

  it('accepts the old 2xl name as xxl', () => {
    render(<Container data-testid="c" maxWidth="2xl" />)

    expect(screen.getByTestId('c')).toHaveAttribute('data-max-width', 'xxl')
    expect(screen.getByTestId('c').style.getPropertyValue('--enchase-container-max')).toBe('1400px')
  })

  it('follows the breakpoints given to the provider', () => {
    render(
      <UIProvider breakpoints={{ md: '800px' }}>
        <Container data-testid="c" maxWidth="md" />
      </UIProvider>
    )

    expect(screen.getByTestId('c').style.getPropertyValue('--enchase-container-max')).toBe('800px')
  })

  it('sets no maximum for the full width', () => {
    render(<Container data-testid="c" maxWidth="full" />)

    expect(screen.getByTestId('c').style.getPropertyValue('--enchase-container-max')).toBe('')
    expect(screen.getByTestId('c')).toHaveAttribute('data-max-width', 'full')
  })

  it('has no axe violations', async () => {
    const { container } = render(<Container>Conteúdo</Container>)

    expect(await axe(container)).toHaveNoViolations()
  })
})
