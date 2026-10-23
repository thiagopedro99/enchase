import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Container } from '@components/common/Container/index.tsx'
import UIProvider from '@components/uiProvider/index.tsx'
import { structureTags } from '@utils/structureTag.ts'
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

describe('Container as', () => {
  it('renders a div unless told otherwise', () => {
    render(<Container data-testid="c" />)

    expect(screen.getByTestId('c').tagName).toBe('DIV')
  })

  it.each(structureTags)('renders a %s when asked, still marked with its slot', (tag) => {
    render(<Container as={tag} data-testid="c" />)
    const root = screen.getByTestId('c')

    expect(root.tagName.toLowerCase()).toBe(tag)
    expect(root).toHaveAttribute('data-slot', 'container')
  })

  it('gives a list the role of a list, so it stays one in Safari once the markers are gone, and no other tag gets a role', () => {
    render(
      <>
        <Container as="ul" data-testid="ul" />
        <Container as="ol" data-testid="ol" />
        <Container as="main" data-testid="main" />
        <Container data-testid="div" />
      </>
    )

    expect(screen.getByTestId('ul')).toHaveAttribute('role', 'list')
    expect(screen.getByTestId('ol')).toHaveAttribute('role', 'list')
    expect(screen.getByTestId('main')).not.toHaveAttribute('role')
    expect(screen.getByTestId('div')).not.toHaveAttribute('role')
  })

  it('lets the role of the caller win over the one of the list', () => {
    render(<Container as="ul" role="presentation" data-testid="c" />)

    expect(screen.getByTestId('c')).toHaveAttribute('role', 'presentation')
  })

  it('keeps the width, the padding and the attributes of the caller on the tag it renders', () => {
    render(<Container as="section" maxWidth="md" padding="2rem" center={false} aria-label="Intro" data-testid="c" />)
    const root = screen.getByTestId('c')

    expect(root).toHaveAttribute('data-max-width', 'md')
    expect(root).toHaveAttribute('data-center', 'false')
    expect(root.style.getPropertyValue('--enchase-container-padding')).toBe('2rem')
    expect(screen.getByRole('region', { name: 'Intro' })).toBe(root)
  })

  it('has no axe violations as the main landmark', async () => {
    const { container } = render(<Container as="main">Conteúdo</Container>)

    expect(await axe(container)).toHaveNoViolations()
  })
})
