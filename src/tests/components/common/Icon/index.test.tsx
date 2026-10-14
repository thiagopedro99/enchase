import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from '@tests/axe.ts'

import { AlertTriangleIcon } from '@components/common/Icon/icons/AlertTriangleIcon.tsx'
import { CheckIcon } from '@components/common/Icon/icons/CheckIcon.tsx'
import { EyeOffIcon } from '@components/common/Icon/icons/EyeOffIcon.tsx'
import { InfoIcon } from '@components/common/Icon/icons/InfoIcon.tsx'
import { EyeIcon } from '@components/common/Icon/icons/EyeIcon.tsx'
import { ChevronsRightIcon } from '@components/common/Icon/icons/ChevronsRightIcon.tsx'
import { ChevronsLeftIcon } from '@components/common/Icon/icons/ChevronsLeftIcon.tsx'
import { ExternalLinkIcon } from '@components/common/Icon/icons/ExternalLinkIcon.tsx'
import { ChevronRightIcon } from '@components/common/Icon/icons/ChevronRightIcon.tsx'
import { MoonIcon } from '@components/common/Icon/icons/MoonIcon.tsx'
import { SunIcon } from '@components/common/Icon/icons/SunIcon.tsx'
import { MenuOpenIcon } from '@components/common/Icon/icons/MenuOpenIcon.tsx'
import { CloseIcon } from '@components/common/Icon/icons/CloseIcon.tsx'
import { LogOutIcon } from '@components/common/Icon/icons/LogOutIcon.tsx'
import { MenuIcon } from '@components/common/Icon/icons/MenuIcon.tsx'
import { BookOpenIcon } from '@components/common/Icon/icons/BookOpenIcon.tsx'
import { HomeIcon } from '@components/common/Icon/icons/HomeIcon.tsx'
import { LayoutGridIcon } from '@components/common/Icon/icons/LayoutGridIcon.tsx'
import { RocketIcon } from '@components/common/Icon/icons/RocketIcon.tsx'
import { Icon } from '@components/common/Icon/index.tsx'

const icons = [
  ['menu', MenuIcon],
  ['menu-open', MenuOpenIcon],
  ['close', CloseIcon],
  ['chevron-right', ChevronRightIcon],
  ['chevrons-right', ChevronsRightIcon],
  ['chevrons-left', ChevronsLeftIcon],
  ['external-link', ExternalLinkIcon],
  ['log-out', LogOutIcon],
  ['check', CheckIcon],
  ['info', InfoIcon],
  ['alert-triangle', AlertTriangleIcon],
  ['eye', EyeIcon],
  ['eye-off', EyeOffIcon],
  ['sun', SunIcon],
  ['moon', MoonIcon],
  ['home', HomeIcon],
  ['book-open', BookOpenIcon],
  ['layout-grid', LayoutGridIcon],
  ['rocket', RocketIcon]
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

  it('lets a composing component rename the slot of its icon', () => {
    const { container } = render(<Icon name="dot" {...{ 'data-slot': 'card-icon' }}><circle cx="12" cy="12" r="1" /></Icon>)

    expect(svgOf(container)).toHaveAttribute('data-slot', 'card-icon')
  })

  it('marks its root with a data-slot and keeps the user class next to its own', () => {
    const { container } = render(<Icon name="dot" className="mine" style={{ color: 'red' }}><circle cx="12" cy="12" r="1" /></Icon>)
    const svg = svgOf(container)

    expect(svg).toHaveAttribute('data-slot', 'icon')
    expect(svg.getAttribute('class')).toMatch(/icon/)
    expect(svg).toHaveClass('mine')
    expect(svg.style.color).toBe('red')
  })

  it('becomes an image with an accessible name when given a title', () => {
    render(<Icon name="dot" title="Status"><circle cx="12" cy="12" r="1" /></Icon>)

    const image = screen.getByRole('img', { name: 'Status' })

    expect(image).not.toHaveAttribute('aria-hidden')
    expect(image.querySelector('title')).toHaveTextContent('Status')
  })

  it('flags only the directional icons', () => {
    const { container, rerender } = render(<ChevronRightIcon />)

    expect(svgOf(container)).toHaveAttribute('data-directional')

    rerender(<MenuIcon />)

    expect(svgOf(container)).not.toHaveAttribute('data-directional')
  })

  it('has no axe violations hidden or with a title', async () => {
    const { container } = render(
      <div>
        <button type="button">
          <CheckIcon />
          Salvar
        </button>
        <Icon name="dot" title="Status"><circle cx="12" cy="12" r="1" /></Icon>
      </div>
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})

describe.each(icons)('%s icon', (name, Component) => {
  it('renders its shapes with the shared base attributes', () => {
    const { container } = render(<Component size={20} />)
    const svg = svgOf(container)

    expect(svg).toHaveAttribute('data-icon', name)
    expect(svg).toHaveAttribute('width', '20')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg.querySelectorAll('path, rect, circle').length).toBeGreaterThan(0)
  })
})
