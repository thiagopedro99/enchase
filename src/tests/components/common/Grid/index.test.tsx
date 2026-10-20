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

  it('keeps the numeric columns exactly as before, without the new attributes', () => {
    render(<Grid data-testid="g" columns={3} />)
    const root = screen.getByTestId('g')

    expect(root).not.toHaveAttribute('data-responsive')
    expect(root).not.toHaveAttribute('data-center-last')
    expect(root.style.getPropertyValue('--enchase-grid-n')).toBe('')
  })

  it('writes the columns of every breakpoint when it gets an object, carrying the smaller value up', () => {
    render(<Grid data-testid="g" columns={{ xs: 1, md: 3, xxl: 5 }} />)
    const root = screen.getByTestId('g')
    const counts = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'].map((name) => root.style.getPropertyValue(`--enchase-grid-n-${name}`))

    expect(root).toHaveAttribute('data-responsive', '')
    expect(counts).toEqual(['1', '1', '3', '3', '3', '5'])
    expect(root.style.getPropertyValue('--enchase-grid-columns')).toBe('')
  })

  it('starts from one column when the first breakpoint given is a bigger one', () => {
    render(<Grid data-testid="g" columns={{ lg: 4 }} />)
    const root = screen.getByTestId('g')

    expect(['xs', 'sm', 'md', 'lg', 'xl', 'xxl'].map((name) => root.style.getPropertyValue(`--enchase-grid-n-${name}`))).toEqual(['1', '1', '1', '4', '4', '4'])
  })

  it('brings the numbers to whole values of at least one, and ignores what is not a number', () => {
    render(<Grid data-testid="g" columns={{ xs: 2.9, sm: 0, md: -3, lg: Number.NaN, xl: Infinity, xxl: '4' as unknown as number }} />)
    const root = screen.getByTestId('g')

    expect(['xs', 'sm', 'md', 'lg', 'xl', 'xxl'].map((name) => root.style.getPropertyValue(`--enchase-grid-n-${name}`))).toEqual(['2', '1', '1', '1', '1', '1'])
  })

  it('accepts an empty object and null without breaking', () => {
    render(
      <>
        <Grid data-testid="empty" columns={{}} />
        <Grid data-testid="none" columns={null as unknown as number} />
      </>
    )

    expect(screen.getByTestId('empty').style.getPropertyValue('--enchase-grid-n-xxl')).toBe('1')
    expect(screen.getByTestId('none')).not.toHaveAttribute('data-responsive')
  })

  it('brings a numeric columns to a whole value of at least one', () => {
    render(<Grid data-testid="g" columns={0} />)

    expect(screen.getByTestId('g').style.getPropertyValue('--enchase-grid-columns')).toContain('calc((100% - 0 * var(--enchase-grid-gap, var(--enchase-space-md))) / 1)')
  })

  it('lets the minimum column width win over the columns of any shape', () => {
    render(<Grid data-testid="g" columns={{ xs: 2, md: 4 }} minColumnWidth="12rem" centerLastRow />)
    const root = screen.getByTestId('g')

    expect(root.style.getPropertyValue('--enchase-grid-columns')).toBe('repeat(auto-fit, minmax(12rem, 1fr))')
    expect(root.style.getPropertyValue('--enchase-grid-n-xs')).toBe('')
    expect(root).not.toHaveAttribute('data-responsive')
    expect(root).not.toHaveAttribute('data-center-last')
  })

  it('marks the grid that centers its last row and gives the flex layout the number of columns', () => {
    render(
      <>
        <Grid data-testid="number" columns={4} centerLastRow />
        <Grid data-testid="object" columns={{ xs: 2, lg: 4 }} centerLastRow />
      </>
    )

    expect(screen.getByTestId('number')).toHaveAttribute('data-center-last', '')
    expect(screen.getByTestId('number').style.getPropertyValue('--enchase-grid-n')).toBe('4')
    expect(screen.getByTestId('object')).toHaveAttribute('data-center-last', '')
    expect(screen.getByTestId('object')).toHaveAttribute('data-responsive', '')
  })

  it('does not hand its own props to the DOM', () => {
    render(<Grid data-testid="g" columns={{ xs: 2 }} centerLastRow minColumnWidth={undefined} />)
    const root = screen.getByTestId('g')

    for (const name of ['columns', 'centerlastrow', 'mincolumnwidth', 'gap']) expect(root, name).not.toHaveAttribute(name)
  })

  it('keeps the caller className and style', () => {
    render(<Grid data-testid="g" className="mine" style={{ color: 'red' }} />)

    expect(screen.getByTestId('g').className.split(' ').at(-1)).toBe('mine')
    expect(screen.getByTestId('g')).toHaveStyle({ color: 'rgb(255, 0, 0)' })
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <>
        <Grid>Conteúdo</Grid>
        <Grid columns={{ xs: 1, md: 3 }} centerLastRow>
          <p>Um</p>
          <p>Dois</p>
        </Grid>
      </>
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})
