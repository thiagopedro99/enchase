import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ChevronRightIcon } from '@components/common/Icon/icons/ChevronRightIcon.tsx'
import { MenuOpenIcon } from '@components/common/Icon/icons/MenuOpenIcon.tsx'
import { CloseIcon } from '@components/common/Icon/icons/CloseIcon.tsx'
import { MenuIcon } from '@components/common/Icon/icons/MenuIcon.tsx'
import { Icon } from '@components/common/Icon/index.tsx'

const icons = [
  ['menu', MenuIcon],
  ['menu-open', MenuOpenIcon],
  ['close', CloseIcon],
  ['chevron-right', ChevronRightIcon]
] as const

const svgOf = (container: HTMLElement) => container.querySelector('svg') as SVGSVGElement

describe('Icon', () => {
  it('draws a 24px stroked icon that follows the text color', () => {
    const { container } = render(<Icon name="dot"><circle cx="12" cy="12" r="1" /></Icon>)
    const svg = svgOf(container)

    expect(svg).toHaveAttribute('width', '24')
    expect(svg).toHaveAttribute('height', '24')
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24')
    expect(svg).toHaveAttribute('fill', 'none')
    expect(svg).toHaveAttribute('stroke', 'currentColor')
    expect(svg).toHaveAttribute('stroke-width', '2')
    expect(svg).toHaveAttribute('data-icon', 'dot')
  })

  it('is hidden from assistive technology and not focusable by default', () => {
    const { container } = render(<Icon name="dot"><circle cx="12" cy="12" r="1" /></Icon>)

    expect(svgOf(container)).toHaveAttribute('aria-hidden', 'true')
    expect(svgOf(container)).toHaveAttribute('focusable', 'false')
  })

  it('accepts a size and lets the caller override the defaults', () => {
    const { container } = render(<Icon name="dot" size={16} className="mine" aria-hidden={undefined} aria-label="Dot" role="img"><circle cx="12" cy="12" r="1" /></Icon>)
    const svg = svgOf(container)

    expect(svg).toHaveAttribute('width', '16')
    expect(svg).toHaveAttribute('height', '16')
    expect(svg).toHaveClass('mine')
    expect(svg).not.toHaveAttribute('aria-hidden')
    expect(svg).toHaveAttribute('aria-label', 'Dot')
  })
})

describe.each(icons)('%s icon', (name, Component) => {
  it('renders its paths with the shared base attributes', () => {
    const { container } = render(<Component size={20} />)
    const svg = svgOf(container)

    expect(svg).toHaveAttribute('data-icon', name)
    expect(svg).toHaveAttribute('width', '20')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg.querySelectorAll('path').length).toBeGreaterThan(0)
  })
})
