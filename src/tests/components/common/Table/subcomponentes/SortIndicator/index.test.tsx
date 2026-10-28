import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import { describe, expect, it } from 'vitest'
import { axe } from '@tests/axe.ts'

import { SortIndicator } from '@components/common/Table/subcomponentes/SortIndicator/index.tsx'

const icon = (container: HTMLElement) => container.querySelector('[data-slot="table-sort-icon"]') as SVGElement

describe('SortIndicator', () => {
  it('is a decorative svg with two triangles, hidden from assistive technology and out of the tab order', () => {
    const { container } = renderWithProviders(<SortIndicator />)

    expect(icon(container).tagName).toBe('svg')
    expect(icon(container)).toHaveAttribute('aria-hidden', 'true')
    expect(icon(container)).toHaveAttribute('focusable', 'false')
    expect(icon(container).querySelectorAll('path')).toHaveLength(2)
  })

  it('says which way it points with data-direction, and none when there is no direction', () => {
    const { container, rerender } = renderWithProviders(<SortIndicator />)

    expect(icon(container)).toHaveAttribute('data-direction', 'none')

    rerender(<SortIndicator direction="ascending" />)
    expect(icon(container)).toHaveAttribute('data-direction', 'ascending')

    rerender(<SortIndicator direction="descending" />)
    expect(icon(container)).toHaveAttribute('data-direction', 'descending')
  })

  it('keeps className and style with the caller last, and passes other attributes on', () => {
    const { container } = renderWithProviders(<SortIndicator className="mine" style={{ margin: '3px' }} data-testid="icon" />)

    expect(icon(container).getAttribute('class')?.split(' ').at(-1)).toBe('mine')
    expect((icon(container) as unknown as HTMLElement).style.margin).toBe('3px')
    expect(icon(container)).toHaveAttribute('data-testid', 'icon')
  })

  it('does not pass its direction to the page as an attribute of its own', () => {
    const { container } = renderWithProviders(<SortIndicator direction="ascending" />)

    expect(icon(container)).not.toHaveAttribute('direction')
  })

  it('has no axe violations in any state', async () => {
    const { container } = renderWithProviders(
      <>
        <SortIndicator />
        <SortIndicator direction="ascending" />
        <SortIndicator direction="descending" />
      </>
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})
