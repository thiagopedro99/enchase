import { afterEach, describe, expect, it } from 'vitest'

import { contrastRatio } from '@styles/theme/contrast.ts'
import { Progress } from '@components/common/Progress/index.tsx'
import { renderInBrowser } from '../../../support/harness.tsx'
import { at, expectHooks, onRoot, part, setHooks, style } from '../../../support/hookProbes.ts'

import type { Probe } from '../../../support/hookProbes.ts'

const surfaces = ['surface', 'background', 'surface-container-high'] as const

const box = (name: string, index = 0) => part(name, index).getBoundingClientRect()

const surface = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(`--enchase-color-${name}`).trim()

afterEach(() => {
  document.documentElement.removeAttribute('style')
  document.documentElement.removeAttribute('dir')
})

describe('the value text of the Progress bar in a real browser', () => {
  it('writes nothing, and keeps the bar in a block, unless it is told to', () => {
    renderInBrowser(<Progress value={40} aria-label="Upload" />)

    expect(part('progress-value', 0)).toBeUndefined()
    expect(style('progress').display).toBe('block')
  })

  it('puts the text after the track, in the same row, a gap away, with the track taking the rest of the row', () => {
    renderInBrowser(
      <div style={{ inlineSize: 400 }}>
        <Progress value={40} showValue aria-label="Upload" />
      </div>
    )
    const [root, track, text] = [box('progress'), box('progress-track'), box('progress-value')]

    expect(style('progress').display).toBe('flex')
    expect(Math.abs(text.right - root.right)).toBeLessThanOrEqual(1)
    expect(Math.round(text.left - track.right)).toBe(8)
    expect(Math.abs(track.left - root.left)).toBeLessThanOrEqual(1)
    expect(Math.abs(text.top + text.height / 2 - (track.top + track.height / 2))).toBeLessThanOrEqual(1)
    expect(part('progress-value').textContent).toBe('40%')
  })

  it('keeps the track the same width from 0% to 100%, so the bar does not move with the number', () => {
    renderInBrowser(
      <div style={{ inlineSize: 400 }}>
        {[0, 5, 9, 10, 55, 99, 100].map((value) => (
          <Progress key={value} value={value} showValue aria-label={`Upload ${value}`} />
        ))}
      </div>
    )
    const widths = [0, 1, 2, 3, 4, 5, 6].map((index) => box('progress-track', index).width)

    expect(new Set(widths.map(Math.round)).size).toBe(1)
  })

  it('moves the text to the other end when the text runs from right to left', () => {
    document.documentElement.setAttribute('dir', 'rtl')
    renderInBrowser(
      <div style={{ inlineSize: 400 }}>
        <Progress value={40} showValue aria-label="Upload" />
      </div>
    )

    expect(box('progress-value').right).toBeLessThanOrEqual(box('progress-track').left)
  })

  it('takes the size of the text from the size of the bar, and its color from the secondary text color', () => {
    renderInBrowser(
      <>
        <Progress value={40} showValue size="sm" aria-label="Small" />
        <Progress value={40} showValue size="md" aria-label="Medium" />
        <Progress value={40} showValue size="lg" aria-label="Large" />
      </>
    )

    expect([0, 1, 2].map((index) => style('progress-value', index).fontSize)).toEqual(['12px', '14px', '16px'])
    expect(style('progress-value').color).toBe(getComputedStyle(part('progress-value')).color)
    expect(style('progress-value').fontVariantNumeric).toContain('tabular-nums')
  })

  it.each(surfaces)('keeps the text readable on %s', (name) => {
    renderInBrowser(<Progress value={40} showValue aria-label="Upload" />)

    expect(contrastRatio(style('progress-value').color, surface(name))).toBeGreaterThanOrEqual(4.5)
  })

  it('has a hook for the color, the weight, the gap, the least width and the size of each bar of the text', () => {
    const probes: Probe[] = [
      ['--enchase-progress-value-color', 'rgb(1, 2, 3)', at('progress-value'), 'color'],
      ['--enchase-progress-value-font-weight', '800', at('progress-value'), 'font-weight'],
      ['--enchase-progress-value-gap', '20px', at('progress'), 'column-gap'],
      ['--enchase-progress-value-min-width', '70px', at('progress-value'), 'min-inline-size'],
      ['--enchase-progress-value-font-size-md', '21px', at('progress-value'), 'font-size'],
      ['--enchase-progress-value-line-height', '2', at('progress-value'), 'line-height', '42px']
    ]

    setHooks(probes)
    renderInBrowser(<Progress value={40} showValue aria-label="Upload" />)

    expectHooks(probes)
  })

  it.each([
    ['sm', '--enchase-progress-value-font-size-sm'],
    ['lg', '--enchase-progress-value-font-size-lg']
  ] as const)('has a hook for the size of the text of the %s bar', (size, hook) => {
    onRoot({ [hook]: '23px' })
    renderInBrowser(<Progress value={40} showValue size={size} aria-label="Upload" />)

    expect(style('progress-value').fontSize).toBe('23px')
  })
})

describe('the value text of the Progress ring in a real browser', () => {
  it('writes nothing unless it is told to, and the ring does not change', () => {
    renderInBrowser(<Progress variant="circular" value={65} aria-label="Upload" />)

    expect(part('progress-ring-value', 0)).toBeUndefined()
    expect(box('progress').width).toBe(40)
  })

  it.each([
    ['sm', 24, '8px'],
    ['md', 40, '9px'],
    ['lg', 56, '13px']
  ] as const)('centers the text of the %s ring inside it, in a size that fits', (size, side, font) => {
    renderInBrowser(<Progress variant="circular" size={size} value={65} showValue aria-label="Upload" />)
    const [root, text] = [box('progress'), box('progress-ring-value')]

    expect([Math.round(root.width), Math.round(root.height)]).toEqual([side, side])
    expect(Math.abs(text.left + text.width / 2 - (root.left + root.width / 2))).toBeLessThanOrEqual(1)
    expect(Math.abs(text.top + text.height / 2 - (root.top + root.height / 2))).toBeLessThanOrEqual(1)
    expect(style('progress-ring-value').fontSize).toBe(font)
    expect(part('progress-ring-value').scrollWidth).toBeLessThanOrEqual(root.width + 1)
  })

  it('fits the largest number inside the circle that the md and lg rings leave free', () => {
    renderInBrowser(
      <>
        <Progress variant="circular" size="md" value={100} showValue aria-label="Medium" />
        <Progress variant="circular" size="lg" value={100} showValue aria-label="Large" />
      </>
    )
    const range = document.createRange()

    for (const index of [0, 1]) {
      range.selectNodeContents(part('progress-ring-value', index))
      const text = range.getBoundingClientRect()
      const free = (box('progress', index).width / 2) * 0.75

      expect(Math.hypot(text.width / 2, text.height / 2), `ring ${index}`).toBeLessThanOrEqual(free + 0.5)
    }
  })

  it.each([
    ['sm', '--enchase-progress-ring-value-font-size-sm'],
    ['md', '--enchase-progress-ring-value-font-size-md'],
    ['lg', '--enchase-progress-ring-value-font-size-lg']
  ] as const)('takes the size of the text of the %s ring from its own hook, and not from the one of the bar', (size, hook) => {
    onRoot({ [hook]: '13px', '--enchase-progress-value-font-size-sm': '31px', '--enchase-progress-value-font-size-md': '31px', '--enchase-progress-value-font-size-lg': '31px' })
    renderInBrowser(<Progress variant="circular" size={size} value={65} showValue aria-label="Upload" />)

    expect(style('progress-ring-value').fontSize).toBe('13px')
  })
})
