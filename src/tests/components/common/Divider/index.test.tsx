import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from '@tests/axe.ts'

import { Divider } from '@components/common/Divider/index.tsx'

describe('Divider', () => {
  it('is a horizontal separator on an hr by default', () => {
    renderWithProviders(<Divider />)
    const divider = screen.getByRole('separator')

    expect(divider.tagName).toBe('HR')
    expect(divider).toHaveAttribute('data-orientation', 'horizontal')
    expect(divider).not.toHaveAttribute('aria-orientation')
  })

  it('announces a vertical separator as vertical', () => {
    renderWithProviders(<Divider orientation="vertical" />)
    const divider = screen.getByRole('separator')

    expect(divider).toHaveAttribute('data-orientation', 'vertical')
    expect(divider).toHaveAttribute('aria-orientation', 'vertical')
  })

  it('leaves assistive technology out of a decorative divider', () => {
    const { container } = renderWithProviders(<Divider decorative orientation="vertical" />)
    const divider = container.querySelector('hr') as HTMLElement

    expect(screen.queryByRole('separator')).not.toBeInTheDocument()
    expect(divider).toHaveAttribute('role', 'none')
    expect(divider).not.toHaveAttribute('aria-orientation')
    expect(divider).toHaveAttribute('data-orientation', 'vertical')
  })

  it('does not pass orientation and decorative to the page as attributes', () => {
    renderWithProviders(<Divider orientation="vertical" decorative />)
    const divider = document.querySelector('hr') as HTMLElement

    expect(divider).not.toHaveAttribute('orientation')
    expect(divider).not.toHaveAttribute('decorative')
  })

  it('passes the other attributes to the hr', () => {
    renderWithProviders(<Divider id="between" title="Between the sections" data-testid="divider" />)
    const divider = screen.getByTestId('divider')

    expect(divider).toHaveAttribute('id', 'between')
    expect(divider).toHaveAttribute('title', 'Between the sections')
  })

  it('has no axe violations in each orientation, decorative or not', async () => {
    const { container } = renderWithProviders(
      <div>
        <Divider />
        <Divider orientation="vertical" />
        <Divider decorative />
        <Divider decorative orientation="vertical" />
      </div>
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Divider contract', () => {
  it('marks the root with a data-slot', () => {
    renderWithProviders(<Divider />)

    expect(screen.getByRole('separator')).toHaveAttribute('data-slot', 'divider')
  })

  it('keeps the caller className last and lets the caller style win', () => {
    renderWithProviders(<Divider className="mine" style={{ borderColor: 'red' }} />)
    const divider = screen.getByRole('separator')

    expect(divider.className.split(' ').at(-1)).toBe('mine')
    expect(divider.style.borderColor).toBe('red')
  })

  it('keeps the data-slot of the library when the caller sends one', () => {
    renderWithProviders(<Divider data-slot="mine" />)

    expect(screen.getByRole('separator')).toHaveAttribute('data-slot', 'divider')
  })

  it('lets the caller role win over the one of a decorative divider', () => {
    renderWithProviders(<Divider decorative role="presentation" />)

    expect(document.querySelector('hr')).toHaveAttribute('role', 'presentation')
  })
})
