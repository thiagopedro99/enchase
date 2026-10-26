import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from '@tests/axe.ts'

import { en } from '@locales/en.ts'
import { Progress } from '@components/common/Progress/index.tsx'

const sizes = ['sm', 'md', 'lg'] as const

const bar = () => screen.getByRole('progressbar')

describe('Progress', () => {
  it('is a progressbar named after the loading label of the locale', () => {
    renderWithProviders(<Progress value={30} />, { locale: en })

    expect(screen.getByRole('progressbar', { name: 'Loading' })).toHaveAttribute('data-slot', 'progress')
  })

  it('takes a name from the caller, with aria-label or aria-labelledby', () => {
    renderWithProviders(
      <>
        <span id="upload">Uploading photos</span>
        <Progress value={30} aria-label="Sending" />
        <Progress value={60} aria-labelledby="upload" />
      </>
    )

    expect(screen.getByRole('progressbar', { name: 'Sending' })).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Uploading photos' })).toBeInTheDocument()
  })

  it('reports the value against a range of 0 to 100 by default', () => {
    renderWithProviders(<Progress value={45} />)

    expect(bar()).toHaveAttribute('aria-valuenow', '45')
    expect(bar()).toHaveAttribute('aria-valuemin', '0')
    expect(bar()).toHaveAttribute('aria-valuemax', '100')
    expect(bar()).toHaveAttribute('data-state', 'loading')
    expect(bar().style.getPropertyValue('--progress')).toBe('0.45')
  })

  it('takes the end of the range from max', () => {
    renderWithProviders(<Progress value={3} max={12} />)

    expect(bar()).toHaveAttribute('aria-valuenow', '3')
    expect(bar()).toHaveAttribute('aria-valuemax', '12')
    expect(bar().style.getPropertyValue('--progress')).toBe('0.25')
  })

  it('keeps the value inside the range', () => {
    const { rerender } = renderWithProviders(<Progress value={-20} />)

    expect(bar()).toHaveAttribute('aria-valuenow', '0')
    expect(bar().style.getPropertyValue('--progress')).toBe('0')

    rerender(<Progress value={140} />)

    expect(bar()).toHaveAttribute('aria-valuenow', '100')
    expect(bar().style.getPropertyValue('--progress')).toBe('1')
  })

  it('falls back to 100 for a max that is not a positive number', () => {
    const { rerender } = renderWithProviders(<Progress value={50} max={0} />)

    expect(bar()).toHaveAttribute('aria-valuemax', '100')

    rerender(<Progress value={50} max={-5} />)
    expect(bar()).toHaveAttribute('aria-valuemax', '100')

    rerender(<Progress value={50} max={Number.NaN} />)
    expect(bar()).toHaveAttribute('aria-valuemax', '100')
  })

  it('has the state loading while it runs and complete when it reaches the end', () => {
    const { rerender } = renderWithProviders(<Progress value={0} />)

    expect(bar()).toHaveAttribute('data-state', 'loading')
    expect(bar()).toHaveAttribute('aria-valuenow', '0')

    rerender(<Progress value={100} />)

    expect(bar()).toHaveAttribute('data-state', 'complete')
  })

  it('is indeterminate without a value, and leaves aria-valuenow out', () => {
    renderWithProviders(<Progress />)

    expect(bar()).toHaveAttribute('data-state', 'indeterminate')
    expect(bar()).not.toHaveAttribute('aria-valuenow')
    expect(bar()).toHaveAttribute('aria-valuemax', '100')
  })

  it('is indeterminate for a value that is not a number', () => {
    renderWithProviders(<Progress value={Number.NaN} />)

    expect(bar()).toHaveAttribute('data-state', 'indeterminate')
    expect(bar()).not.toHaveAttribute('aria-valuenow')
  })

  it('is linear and medium by default, with a track and an indicator inside', () => {
    renderWithProviders(<Progress value={30} />)

    expect(bar()).toHaveAttribute('data-variant', 'linear')
    expect(bar()).toHaveAttribute('data-size', 'md')
    expect(bar().querySelector('[data-slot="progress-track"] > [data-slot="progress-indicator"]')).not.toBeNull()
    expect(bar().querySelector('svg')).toBeNull()
  })

  it('draws a ring of two circles, hidden from assistive technology, when it is circular', () => {
    renderWithProviders(<Progress variant="circular" value={25} />)
    const ring = bar().querySelector('svg') as SVGElement
    const arc = bar().querySelector('[data-slot="progress-indicator"]') as SVGElement

    expect(bar()).toHaveAttribute('data-variant', 'circular')
    expect(ring).toHaveAttribute('aria-hidden', 'true')
    expect(bar().querySelector('[data-slot="progress-track"]')?.tagName.toLowerCase()).toBe('circle')
    expect(arc.getAttribute('pathLength')).toBe('100')
    expect(arc.style.strokeDasharray).toBe('25 100')
  })

  it('draws the whole ring when a circular progress is complete', () => {
    renderWithProviders(<Progress variant="circular" value={100} />)

    expect((bar().querySelector('[data-slot="progress-indicator"]') as SVGElement).style.strokeDasharray).toBe('100 100')
    expect(bar()).toHaveAttribute('data-state', 'complete')
  })

  it('leaves the length of the arc to the css when a circular progress is indeterminate', () => {
    renderWithProviders(<Progress variant="circular" />)

    expect((bar().querySelector('[data-slot="progress-indicator"]') as SVGElement).style.strokeDasharray).toBe('')
    expect(bar()).toHaveAttribute('data-state', 'indeterminate')
  })

  it.each(sizes)('takes size="%s"', (size) => {
    renderWithProviders(<Progress value={10} size={size} />)

    expect(bar()).toHaveAttribute('data-size', size)
  })

  it('does not pass value, max, variant, size and animation to the page as attributes', () => {
    renderWithProviders(<Progress value={10} max={20} variant="circular" size="lg" animation={false} />)

    for (const name of ['value', 'max', 'variant', 'size', 'animation']) expect(bar()).not.toHaveAttribute(name)
  })

  it('passes the other attributes to the root', () => {
    renderWithProviders(<Progress value={10} id="upload-progress" title="Upload" />)

    expect(bar().tagName).toBe('DIV')
    expect(bar()).toHaveAttribute('id', 'upload-progress')
    expect(bar()).toHaveAttribute('title', 'Upload')
  })

  it('has no axe violations in each shape, determinate or not, and in each size', async () => {
    const { container } = renderWithProviders(
      <div>
        <Progress value={40} aria-label="Linear" />
        <Progress aria-label="Linear indeterminate" />
        <Progress variant="circular" value={40} aria-label="Circular" />
        <Progress variant="circular" aria-label="Circular indeterminate" />
        {sizes.map((size) => (
          <Progress key={size} size={size} value={70} aria-label={`Size ${size}`} />
        ))}
      </div>
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Progress motion', () => {
  it('runs its loop by default', () => {
    renderWithProviders(<Progress />)

    expect(bar()).toHaveAttribute('data-motion', 'on')
  })

  it('stops with animation={false}, with the motion mode never and with the preset off', () => {
    const { unmount } = renderWithProviders(<Progress animation={false} />)

    expect(bar()).toHaveAttribute('data-motion', 'off')
    unmount()

    const never = renderWithProviders(<Progress />, { motion: { mode: 'never' } })

    expect(bar()).toHaveAttribute('data-motion', 'off')
    never.unmount()

    renderWithProviders(<Progress />, { motion: { preset: 'off' } })

    expect(bar()).toHaveAttribute('data-motion', 'off')
  })

  it('takes the duration of one cycle from the tuning, in the variable of the part that moves', () => {
    const { unmount } = renderWithProviders(<Progress animation={{ tuning: { duration: 2 } }} />)

    expect(bar().style.getPropertyValue('--enchase-progress-indicator-duration')).toBe('2000ms')
    unmount()

    renderWithProviders(<Progress variant="circular" animation={{ tuning: { duration: 3 } }} />)

    expect(bar().style.getPropertyValue('--enchase-progress-ring-duration')).toBe('3000ms')
  })

  it('follows the spin recipe when it is circular and the shimmer recipe when it is linear', () => {
    const { unmount } = renderWithProviders(<Progress variant="circular" animation={{ recipe: 'spin' }} />)

    expect(bar()).toHaveAttribute('data-motion', 'on')
    unmount()

    renderWithProviders(<Progress animation={{ recipe: 'spin' }} />)

    expect(bar()).toHaveAttribute('data-motion', 'off')
  })
})

describe('Progress contract', () => {
  it('keeps the caller className last and lets the caller style win', () => {
    renderWithProviders(<Progress value={10} className="mine" style={{ color: 'red' }} />)

    expect(bar().className.split(' ').at(-1)).toBe('mine')
    expect(bar().style.color).toBe('red')
    expect(bar().style.getPropertyValue('--progress')).toBe('0.1')
  })

  it('keeps the data-slot of the library when the caller sends one', () => {
    renderWithProviders(<Progress value={10} data-slot="mine" />)

    expect(bar()).toHaveAttribute('data-slot', 'progress')
  })
})
