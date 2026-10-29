import { afterEach, describe, expect, it } from 'vitest'

import { contrastRatio } from '@styles/theme/contrast.ts'
import { Progress } from '@components/common/Progress/index.tsx'
import { renderInBrowser } from '../../../support/harness.tsx'
import { at, expectHooks, part, setHooks, style } from '../../../support/hookProbes.ts'

import type { Probe } from '../../../support/hookProbes.ts'
import type { ReactElement } from 'react'
import { unlessWebkit } from '../../../support/browserSkips.ts'
import { setForcedColors, setReducedMotion } from '../../../support/media.ts'
import { soak } from '../../../support/settle.ts'

const added: HTMLStyleElement[] = []

const addStyle = (css: string) => {
  const element = document.createElement('style')
  element.textContent = css
  document.head.prepend(element)
  added.push(element)
}

afterEach(async () => {
  document.documentElement.removeAttribute('style')
  added.splice(0).forEach((element) => element.remove())
  await setReducedMotion('no-preference')
  await setForcedColors('none')
})

const box = (name: string, index = 0) => part(name, index).getBoundingClientRect()

const scaleOf = (name = 'progress-indicator') => new DOMMatrix(getComputedStyle(part(name)).transform).a

const dash = (name = 'progress-indicator') => parseFloat(getComputedStyle(part(name)).strokeDasharray)

const hookedWithMotion = (probes: Probe[], ui: ReactElement) => {
  setHooks(probes)
  renderInBrowser(ui, 'auto')
  expectHooks(probes)
}

describe('Progress as a bar in a real browser', () => {
  it('is a pill of 4, 8 or 12 pixels by size, across the width of its parent', () => {
    renderInBrowser(
      <div style={{ inlineSize: 300 }}>
        <Progress size="sm" value={50} aria-label="sm" />
        <Progress value={50} aria-label="md" />
        <Progress size="lg" value={50} aria-label="lg" />
      </div>
    )

    expect([0, 1, 2].map((index) => box('progress-track', index).height)).toEqual([4, 8, 12])
    expect([0, 1, 2].map((index) => box('progress-track', index).width)).toEqual([300, 300, 300])
    expect(parseFloat(style('progress-track').borderTopLeftRadius)).toBeGreaterThan(100)
  })

  it.each([0, 0.45, 1])('fills %s of the track', (fraction) => {
    renderInBrowser(
      <div style={{ inlineSize: 400 }}>
        <Progress value={fraction * 100} aria-label="x" />
      </div>,
      'never'
    )

    expect(scaleOf()).toBeCloseTo(fraction, 3)
    expect(box('progress-indicator').width).toBeCloseTo(400 * fraction, 0)
  })

  it('grows from the start of the line, which is the right side in a right to left page', () => {
    renderInBrowser(
      <>
        <div dir="ltr" style={{ inlineSize: 400 }}>
          <Progress value={25} aria-label="ltr" />
        </div>
        <div dir="rtl" style={{ inlineSize: 400 }}>
          <Progress value={25} aria-label="rtl" />
        </div>
      </>,
      'never'
    )
    const [ltrTrack, rtlTrack] = [box('progress-track', 0), box('progress-track', 1)]
    const [ltr, rtl] = [box('progress-indicator', 0), box('progress-indicator', 1)]

    expect(ltr.left).toBeCloseTo(ltrTrack.left, 0)
    expect(rtl.right).toBeCloseTo(rtlTrack.right, 0)
    expect(rtl.left).toBeGreaterThan(rtlTrack.left + 100)
  })

  it('eases to a new value, and does not when motion is off', async () => {
    const view = renderInBrowser(
      <div style={{ inlineSize: 400 }}>
        <Progress value={0} aria-label="x" />
      </div>,
      'auto'
    )

    expect(style('progress-indicator').transitionProperty).toBe('transform')
    expect(style('progress-indicator').transitionDuration).toBe('0.25s')

    view.rerender(
      <div style={{ inlineSize: 400 }}>
        <Progress value={100} aria-label="x" />
      </div>
    )

    await expect.poll(() => scaleOf()).toBeCloseTo(1, 2)
    view.unmount()

    renderInBrowser(
      <div style={{ inlineSize: 400 }}>
        <Progress value={0} aria-label="x" />
      </div>,
      'never'
    )

    expect(style('progress-indicator').transitionDuration).toBe('0s')
  })

  it('slides a part of the bar across the track while indeterminate, and stops sliding without a loop', async () => {
    renderInBrowser(
      <div style={{ inlineSize: 400 }}>
        <Progress aria-label="x" />
        <Progress animation={false} aria-label="y" />
      </div>,
      'auto'
    )
    const first = box('progress-indicator', 0)

    expect(first.width).toBeCloseTo(160, 0)
    expect(style('progress-indicator').animationName).not.toBe('none')
    expect(style('progress-indicator').animationIterationCount).toBe('infinite')
    expect(style('progress-indicator').animationDuration).toBe('1.5s')

    await expect.poll(() => box('progress-indicator', 0).left).not.toBe(first.left)

    const still = getComputedStyle(part('progress-indicator', 1))

    expect(still.animationName).toBe('none')
    expect(box('progress-indicator', 1).width).toBe(400)
    expect(still.opacity).toBe('0.5')
  })

  it('slides the other way in a right to left page', async () => {
    renderInBrowser(
      <>
        <div dir="ltr" style={{ inlineSize: 400 }}>
          <Progress aria-label="ltr" />
        </div>
        <div dir="rtl" style={{ inlineSize: 400 }}>
          <Progress aria-label="rtl" />
        </div>
      </>,
      'auto'
    )

    expect(style('progress-indicator', 0).animationName).not.toBe('none')
    expect(style('progress-indicator', 0).animationName).not.toBe(style('progress-indicator', 1).animationName)

    const [ltr, rtl] = [box('progress-indicator', 0), box('progress-indicator', 1)]

    await soak(200)

    expect(box('progress-indicator', 0).left).toBeGreaterThan(ltr.left)
    expect(box('progress-indicator', 1).left).toBeLessThan(rtl.left)
  })

  it('becomes a pulse of the whole bar under reduced motion, and stops easing', async () => {
    await setReducedMotion('reduce')
    renderInBrowser(
      <div style={{ inlineSize: 400 }}>
        <Progress aria-label="busy" />
        <Progress value={30} aria-label="partial" />
      </div>,
      'auto'
    )

    expect(box('progress-indicator', 0).width).toBe(400)
    expect(style('progress-indicator', 0).animationName).toMatch(/pulse/)
    expect(style('progress-indicator', 1).transitionDuration).toBe('0s')
  })

  it.each(['light', 'dark'] as const)('keeps the bar apart from its track by at least 3 to 1 in the %s theme', (mode) => {
    renderInBrowser(
      <div style={{ inlineSize: 400 }}>
        <Progress value={50} aria-label="x" />
      </div>,
      'never',
      mode
    )

    expect(contrastRatio(style('progress-indicator').backgroundColor, style('progress-track').backgroundColor)).toBeGreaterThanOrEqual(3)
  })

  it('reads its size, its colors and its easing from hooks', () => {
    hookedWithMotion(
      [
        ['--enchase-progress-track-height-md', '14px', at('progress-track'), 'height'],
        ['--enchase-progress-track-radius', '3px', at('progress-track'), 'border-top-left-radius'],
        ['--enchase-progress-track-background', 'rgb(1, 2, 3)', at('progress-track'), 'background-color'],
        ['--enchase-progress-indicator-background', 'rgb(4, 5, 6)', at('progress-indicator'), 'background-color'],
        ['--enchase-progress-duration', '900ms', at('progress-indicator'), 'transition-duration', '0.9s'],
        ['--enchase-progress-ease', 'linear', at('progress-indicator'), 'transition-timing-function']
      ],
      <div style={{ inlineSize: 400 }}>
        <Progress value={50} aria-label="x" />
      </div>
    )
  })

  it('reads the height of the other sizes, the width of the moving part and the cycle from hooks', () => {
    hookedWithMotion(
      [
        ['--enchase-progress-track-height-sm', '6px', at('progress-track', 0), 'height'],
        ['--enchase-progress-track-height-lg', '20px', at('progress-track', 1), 'height'],
        ['--enchase-progress-indicator-width', '25%', at('progress-indicator', 2), 'width', '100px'],
        ['--enchase-progress-indicator-duration', '3s', at('progress-indicator', 2), 'animation-duration'],
        ['--enchase-progress-loop-ease', 'linear', at('progress-indicator', 2), 'animation-timing-function']
      ],
      <div style={{ inlineSize: 400 }}>
        <Progress size="sm" value={50} aria-label="a" />
        <Progress size="lg" value={50} aria-label="b" />
        <Progress aria-label="c" />
      </div>
    )
  })

  it('lets the caller class win on the width and the colors even when its css loads before the library', () => {
    addStyle('.mine { inline-size: 123px; } .mine [data-slot="progress-track"] { background-color: rgb(0, 128, 0); }')
    renderInBrowser(<Progress className="mine" value={50} aria-label="x" />)

    expect(box('progress').width).toBe(123)
  })
})

describe('Progress as a ring in a real browser', () => {
  it('is a square of 24, 40 or 56 pixels by size, with the drawing as large as the square', () => {
    renderInBrowser(
      <>
        <Progress variant="circular" size="sm" value={50} aria-label="sm" />
        <Progress variant="circular" value={50} aria-label="md" />
        <Progress variant="circular" size="lg" value={50} aria-label="lg" />
      </>
    )

    expect([0, 1, 2].map((index) => box('progress', index).width)).toEqual([24, 40, 56])
    expect([0, 1, 2].map((index) => box('progress', index).height)).toEqual([24, 40, 56])
    expect([0, 1, 2].map((index) => box('progress-ring', index).width)).toEqual([24, 40, 56])
  })

  it.each([0, 30, 100])('draws %s percent of the ring', (percent) => {
    renderInBrowser(<Progress variant="circular" value={percent} aria-label="x" />, 'never')

    expect(dash()).toBeCloseTo(percent, 1)
  })

  it('starts at the top of the ring', () => {
    renderInBrowser(<Progress variant="circular" value={30} aria-label="x" />, 'never')
    const matrix = new DOMMatrix(getComputedStyle(part('progress-ring')).transform)

    expect(Math.round((Math.atan2(matrix.b, matrix.a) * 180) / Math.PI)).toBe(-90)
  })

  it('eases the ring to a new value, and does not when motion is off', () => {
    const { unmount } = renderInBrowser(<Progress variant="circular" value={10} aria-label="x" />, 'auto')

    expect(style('progress-indicator').transitionProperty).toBe('stroke-dasharray')
    expect(style('progress-indicator').transitionDuration).toBe('0.25s')
    unmount()

    renderInBrowser(<Progress variant="circular" value={10} aria-label="x" />, 'never')

    expect(style('progress-indicator').transitionDuration).toBe('0s')
  })

  it('turns a quarter of a ring while indeterminate, and stays still without a loop', async () => {
    renderInBrowser(
      <>
        <Progress variant="circular" aria-label="x" />
        <Progress variant="circular" animation={false} aria-label="y" />
      </>,
      'auto'
    )

    expect(dash()).toBeCloseTo(25, 1)
    expect(style('progress-ring', 0).animationName).not.toBe('none')
    expect(style('progress-ring', 0).animationDuration).toBe('0.8s')

    const angle = () => {
      const matrix = new DOMMatrix(getComputedStyle(part('progress-ring', 0)).transform)

      return Math.atan2(matrix.b, matrix.a)
    }
    const first = angle()

    await expect.poll(angle).not.toBeCloseTo(first, 2)

    expect(style('progress-ring', 1).animationName).toBe('none')
    expect(parseFloat(getComputedStyle(part('progress-indicator', 1)).strokeDasharray)).toBe(100)
    expect(getComputedStyle(part('progress-indicator', 1)).opacity).toBe('0.5')
  })

  it('pulses the whole ring under reduced motion', async () => {
    await setReducedMotion('reduce')
    renderInBrowser(<Progress variant="circular" aria-label="x" />, 'auto')

    expect(style('progress-ring').animationName).toMatch(/pulse/)
    expect(dash()).toBe(100)
  })

  it.each(['light', 'dark'] as const)('keeps the arc apart from its track by at least 3 to 1 in the %s theme', (mode) => {
    renderInBrowser(<Progress variant="circular" value={50} aria-label="x" />, 'never', mode)

    expect(contrastRatio(style('progress-indicator').stroke, style('progress-track').stroke)).toBeGreaterThanOrEqual(3)
  })

  it('reads its size, its thickness, its colors and its easing from hooks', () => {
    hookedWithMotion(
      [
        ['--enchase-progress-size-md', '3rem', at('progress'), 'width', '48px'],
        ['--enchase-progress-thickness', '6', at('progress-track'), 'stroke-width', '6px'],
        ['--enchase-progress-track-background', 'rgb(1, 2, 3)', at('progress-track'), 'stroke'],
        ['--enchase-progress-indicator-background', 'rgb(4, 5, 6)', at('progress-indicator'), 'stroke'],
        ['--enchase-progress-duration', '900ms', at('progress-indicator'), 'transition-duration', '0.9s']
      ],
      <Progress variant="circular" value={50} aria-label="x" />
    )
  })

  it('reads the cycle of the ring from a hook and the size of the other steps', () => {
    hookedWithMotion(
      [
        ['--enchase-progress-size-sm', '2rem', at('progress', 0), 'width', '32px'],
        ['--enchase-progress-size-lg', '4rem', at('progress', 1), 'width', '64px'],
        ['--enchase-progress-ring-duration', '2s', at('progress-ring', 2), 'animation-duration']
      ],
      <>
        <Progress variant="circular" size="sm" value={50} aria-label="a" />
        <Progress variant="circular" size="lg" value={50} aria-label="b" />
        <Progress variant="circular" aria-label="c" />
      </>
    )
  })
})

describe('Progress in forced colors', () => {
  const run = unlessWebkit('forcedColors') ? it : it.skip

  const canvas = () => {
    const probe = document.createElement('div')

    probe.style.backgroundColor = 'Canvas'
    document.body.append(probe)
    const color = getComputedStyle(probe).backgroundColor

    probe.remove()

    return color
  }

  run('keeps the bar and its track visible against the page', async () => {
    renderInBrowser(
      <div style={{ inlineSize: 400 }}>
        <Progress value={50} aria-label="x" />
      </div>,
      'never'
    )
    await setForcedColors('active')

    expect(style('progress-track').borderTopStyle).toBe('solid')
    expect(contrastRatio(style('progress-track').borderTopColor, canvas())).toBeGreaterThanOrEqual(3)
    expect(contrastRatio(style('progress-indicator').backgroundColor, canvas())).toBeGreaterThanOrEqual(3)
  })

  run('keeps the arc and its track visible against the page', async () => {
    renderInBrowser(<Progress variant="circular" value={50} aria-label="x" />, 'never')
    await setForcedColors('active')

    expect(contrastRatio(style('progress-indicator').stroke, canvas())).toBeGreaterThanOrEqual(3)
    expect(contrastRatio(style('progress-track').stroke, canvas())).toBeGreaterThanOrEqual(3)
  })
})
