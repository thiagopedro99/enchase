import { useState } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { Slider } from '@components/common/Slider/index.tsx'
import { contrastRatio } from '@styles/theme/contrast.ts'
import { unlessWebkit } from './browserSkips.ts'
import { renderInBrowser } from './harness.tsx'
import { hooked, part, style } from './hookProbes.ts'
import { setForcedColors, setReducedMotion } from './media.ts'
import { letGoOfTheMouse, parkMouse, pressMouse } from './pointer.ts'
import { frames } from './settle.ts'

import type { Probe } from './hookProbes.ts'

afterEach(async () => {
  await letGoOfTheMouse()
  await parkMouse()
  document.documentElement.removeAttribute('style')
  document.documentElement.removeAttribute('dir')
  await setForcedColors('none')
  await setReducedMotion('no-preference')
})

const thumb = () => part('slider-thumb')

const control = () => part('slider-control')

const track = () => part('slider-track')

const range = () => part('slider-range')

const root = () => part('slider')

const value = () => Number(thumb().getAttribute('aria-valuenow'))

const surface = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(`--enchase-color-${name}`).trim()

const surfaces = ['surface', 'background', 'surface-container-high'] as const

const at = (ratio: number) => {
  const inner = track().getBoundingClientRect()
  const outer = control().getBoundingClientRect()

  return { x: inner.left - outer.left + inner.width * ratio, y: outer.height / 2 }
}

const centerOfThumb = () => {
  const box = thumb().getBoundingClientRect()

  return box.left + box.width / 2
}

const px = (text: string) => parseFloat(text)

const canvas = () => {
  const probe = document.createElement('div')

  probe.style.backgroundColor = 'Canvas'
  document.body.append(probe)
  const color = getComputedStyle(probe).backgroundColor

  probe.remove()

  return color
}

const Recorded = ({ log, start = 0 }: { log: number[]; start?: number }) => {
  const [level, setLevel] = useState(start)

  return (
    <Slider
      ariaLabel="Volume"
      value={level}
      onValueChange={(next) => {
        log.push(next)
        setLevel(next)
      }}
    />
  )
}

describe('Slider in a real browser', () => {
  it('is exposed as a named slider with its range and its value', () => {
    renderInBrowser(<Slider label="Volume" min={10} max={50} step={5} defaultValue={30} />)
    const slider = page.getByRole('slider', { name: 'Volume' }).element()

    expect(slider).toBe(thumb())
    expect(slider.getAttribute('aria-valuemin')).toBe('10')
    expect(slider.getAttribute('aria-valuemax')).toBe('50')
    expect(slider.getAttribute('aria-valuenow')).toBe('30')
    expect(slider.hasAttribute('aria-valuetext')).toBe(false)
  })

  it.each([0, 40, 100])('draws the filled part and the thumb at %s%% of the track, from the start edge', (percent) => {
    renderInBrowser(<Slider ariaLabel="Volume" defaultValue={percent} />)
    const inner = track().getBoundingClientRect()

    expect(Math.abs(centerOfThumb() - (inner.left + (inner.width * percent) / 100))).toBeLessThanOrEqual(0.5)
    expect(Math.abs(range().getBoundingClientRect().width - (inner.width * percent) / 100)).toBeLessThanOrEqual(0.5)
    expect(range().getBoundingClientRect().left).toBeCloseTo(inner.left, 0)
  })

  it('keeps the thumb inside the control at both ends', () => {
    renderInBrowser(
      <>
        <Slider ariaLabel="Start" defaultValue={0} />
        <Slider ariaLabel="End" defaultValue={100} />
      </>
    )

    for (const index of [0, 1]) {
      const outer = part('slider-control', index).getBoundingClientRect()
      const knob = part('slider-thumb', index).getBoundingClientRect()

      expect(knob.left).toBeGreaterThanOrEqual(outer.left)
      expect(knob.right).toBeLessThanOrEqual(outer.right)
    }
  })

  it.each(['light', 'dark'] as const)('keeps the thumb and the filled part readable against the page and the track in the %s theme', (mode) => {
    renderInBrowser(<Slider label="Volume" showValue defaultValue={40} />, 'never', mode)

    for (const name of surfaces) {
      expect(contrastRatio(style('slider-thumb').borderTopColor, surface(name)), `thumb on ${name}`).toBeGreaterThanOrEqual(3)
      expect(contrastRatio(style('slider-range').backgroundColor, surface(name)), `range on ${name}`).toBeGreaterThanOrEqual(3)
    }

    expect(contrastRatio(style('slider-range').backgroundColor, style('slider-track').backgroundColor), 'range on the track').toBeGreaterThanOrEqual(3)
    expect(contrastRatio(style('slider-label').color, surface('background')), 'label').toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(style('slider-value').color, surface('background')), 'value').toBeGreaterThanOrEqual(4.5)
  })

  it('shows the label and the value on one line, with the value at the end', () => {
    renderInBrowser(<Slider label="Volume" showValue defaultValue={40} formatValue={(current) => `${current}%`} />)
    const label = part('slider-label').getBoundingClientRect()
    const shown = part('slider-value').getBoundingClientRect()

    expect(part('slider-value').textContent).toBe('40%')
    expect(Math.abs(label.top - shown.top)).toBeLessThanOrEqual(2)
    expect(label.left).toBeLessThan(shown.left)
    expect(Math.round(shown.right)).toBe(Math.round(part('slider-header').getBoundingClientRect().right))
  })

  it('wraps a very long value inside the header and keeps the label beside it', () => {
    renderInBrowser(
      <div style={{ inlineSize: 240 }}>
        <Slider label="Volume" showValue defaultValue={40} formatValue={() => 'x'.repeat(80)} />
      </div>
    )
    const header = part('slider-header').getBoundingClientRect()
    const shown = part('slider-value').getBoundingClientRect()

    expect(shown.right).toBeLessThanOrEqual(header.right + 0.5)
    expect(shown.width).toBeLessThanOrEqual(header.width * 0.6 + 0.5)
    expect(shown.height).toBeGreaterThan(part('slider-label').getBoundingClientRect().height)
    expect(root().scrollWidth).toBeLessThanOrEqual(root().clientWidth)
    expect(part('slider-label').getBoundingClientRect().width).toBeGreaterThan(20)
  })

  it('gives the control at least 24 by 24 px of hit area, and 40 by default', () => {
    renderInBrowser(<Slider ariaLabel="Volume" />)

    expect(control().getBoundingClientRect().height).toBe(40)
    document.documentElement.style.setProperty('--enchase-hit-size', '8px')
    expect(control().getBoundingClientRect().height).toBe(24)
  })
})

describe('Slider keyboard in a real browser', () => {
  it('takes the focus once with Tab, shows a visible ring and leaves with the next Tab', async () => {
    renderInBrowser(
      <>
        <button>Before</button>
        <Slider ariaLabel="Volume" />
        <button>After</button>
      </>
    )

    await userEvent.tab()
    await userEvent.tab()

    const ring = style('slider-thumb')

    expect(document.activeElement).toBe(thumb())
    expect(ring.outlineStyle).toBe('solid')
    expect(px(ring.outlineWidth)).toBeGreaterThanOrEqual(2)
    expect(px(ring.outlineOffset)).toBeGreaterThan(0)

    for (const name of surfaces) expect(contrastRatio(ring.outlineColor, surface(name)), name).toBeGreaterThanOrEqual(3)

    await userEvent.tab()
    expect(document.activeElement).toBe(page.getByRole('button', { name: 'After' }).element())
  })

  it('moves by a step, by a tenth of the range and to the ends with the keys', async () => {
    renderInBrowser(<Slider ariaLabel="Volume" defaultValue={50} />)

    await userEvent.tab()

    for (const [key, expected] of [
      ['{ArrowRight}', 51],
      ['{ArrowUp}', 52],
      ['{ArrowLeft}', 51],
      ['{ArrowDown}', 50],
      ['{PageUp}', 60],
      ['{PageDown}', 50],
      ['{End}', 100],
      ['{Home}', 0]
    ] as const) {
      await userEvent.keyboard(key)
      await expect.poll(value, { message: key }).toBe(expected)
      expect(Math.abs(centerOfThumb() - (track().getBoundingClientRect().left + (track().getBoundingClientRect().width * expected) / 100))).toBeLessThanOrEqual(1)
    }
  })

  it('does not scroll the page with the keys that move the thumb', async () => {
    renderInBrowser(
      <div style={{ blockSize: 3000 }}>
        <Slider ariaLabel="Volume" />
      </div>
    )

    await userEvent.tab()
    await userEvent.keyboard('{PageDown}{ArrowDown}{End}{Home}')

    expect(window.scrollY).toBe(0)
  })

  it('inverts the left and right arrows and fills from the right in right-to-left text', async () => {
    document.documentElement.setAttribute('dir', 'rtl')
    renderInBrowser(<Slider ariaLabel="Volume" defaultValue={25} />)
    const inner = track().getBoundingClientRect()

    expect(Math.abs(centerOfThumb() - (inner.right - inner.width * 0.25))).toBeLessThanOrEqual(0.5)
    expect(Math.abs(range().getBoundingClientRect().right - inner.right)).toBeLessThanOrEqual(0.5)

    await userEvent.tab()
    await userEvent.keyboard('{ArrowLeft}')
    expect(value()).toBe(26)

    await userEvent.keyboard('{ArrowRight}{ArrowRight}')
    expect(value()).toBe(24)
  })
})

describe('Slider pointer in a real browser', () => {
  it('sets the value where the track is clicked and takes the focus, with no ring for a mouse', async () => {
    renderInBrowser(<Slider ariaLabel="Volume" />)

    await userEvent.click(control(), { position: at(0.75) })

    await expect.poll(value).toBe(75)
    expect(document.activeElement).toBe(thumb())
    expect(style('slider-thumb').outlineStyle).toBe('none')

    await userEvent.keyboard('{ArrowRight}')
    expect(value()).toBe(76)
    expect(style('slider-thumb').outlineStyle).toBe('solid')
  })

  it('shows no ring after a drag either, until the thumb is left and reached again with Tab', async () => {
    renderInBrowser(
      <>
        <button>Before</button>
        <Slider ariaLabel="Volume" />
      </>
    )

    await userEvent.dragAndDrop(control(), control(), { sourcePosition: at(0.2), targetPosition: at(0.6), steps: 4 })
    await expect.poll(value).toBe(60)
    expect(style('slider-thumb').outlineStyle).toBe('none')

    await userEvent.click(page.getByRole('button', { name: 'Before' }))
    await userEvent.tab()

    expect(document.activeElement).toBe(thumb())
    expect(style('slider-thumb').outlineStyle).toBe('solid')
  })

  it('snaps what the pointer sets to the step and keeps it inside the range', async () => {
    renderInBrowser(<Slider ariaLabel="Level" min={10} max={20} step={4} />)

    await userEvent.click(control(), { position: at(0.45) })
    await expect.poll(value).toBe(14)

    await userEvent.click(control(), { position: at(1) })
    await expect.poll(value).toBe(18)
  })

  it('follows a drag from one point to another and reports each value once', async () => {
    const log: number[] = []

    renderInBrowser(<Recorded log={log} />)

    await userEvent.dragAndDrop(control(), control(), { sourcePosition: at(0.2), targetPosition: at(0.7), steps: 8 })

    await expect.poll(value).toBe(70)
    expect(log[0]).toBe(20)
    expect(log.at(-1)).toBe(70)
    expect(log).toEqual([...log].sort((a, b) => a - b))
    expect(new Set(log).size).toBe(log.length)
    expect(root().hasAttribute('data-dragging')).toBe(false)
  })

  it('keeps following the pointer outside the control and holds the value at the ends', async () => {
    renderInBrowser(<Slider ariaLabel="Volume" defaultValue={40} />)

    await pressMouse('[data-slot="slider-thumb"]')
    expect(root().hasAttribute('data-dragging')).toBe(true)
    expect(document.activeElement).toBe(thumb())

    await parkMouse()
    await expect.poll(value).toBe(0)
    expect(root().hasAttribute('data-dragging')).toBe(true)

    await letGoOfTheMouse()
    await expect.poll(() => root().hasAttribute('data-dragging')).toBe(false)
    expect(value()).toBe(0)
  })

  it('holds the value at the ends when the drag goes past them, to either side and below', async () => {
    renderInBrowser(
      <div style={{ inlineSize: 400, marginBlock: 100, marginInline: 200 }}>
        <Slider ariaLabel="Volume" defaultValue={50} />
      </div>
    )

    await userEvent.dragAndDrop(control(), control(), { sourcePosition: at(0.5), targetPosition: { x: 400 + 150, y: 90 }, force: true, steps: 5 })
    await expect.poll(value).toBe(100)

    await userEvent.dragAndDrop(control(), control(), { sourcePosition: at(1), targetPosition: { x: -150, y: 90 }, force: true, steps: 5 })
    await expect.poll(value).toBe(0)
  })

  it('does not select the text around it while it is dragged', async () => {
    renderInBrowser(
      <>
        <p>Text before the slider that a careless drag would select</p>
        <Slider label="Volume" showValue />
        <p>Text after the slider that a careless drag would select</p>
      </>
    )

    await userEvent.dragAndDrop(control(), control(), { sourcePosition: at(0.1), targetPosition: at(0.9), steps: 6 })

    expect(getSelection()?.toString()).toBe('')
    expect(style('slider').userSelect).toBe('none')
  })

  it('reads the pointer from the right edge in right-to-left text', async () => {
    document.documentElement.setAttribute('dir', 'rtl')
    renderInBrowser(<Slider ariaLabel="Volume" />)

    await userEvent.click(control(), { position: at(0.25) })
    await expect.poll(value).toBe(75)
  })

  it('shows the hover halo on the thumb, a stronger one when pressed, and none when disabled', async () => {
    renderInBrowser(
      <>
        <Slider ariaLabel="Volume" defaultValue={40} />
        <Slider ariaLabel="Brightness" defaultValue={40} disabled />
      </>
    )

    expect(style('slider-thumb', 0).boxShadow).toBe('none')

    await userEvent.hover(thumb())
    await expect.poll(() => style('slider-thumb', 0).boxShadow).not.toBe('none')

    const hovered = style('slider-thumb', 0).boxShadow

    await pressMouse('[data-slot="slider-thumb"]')
    await expect.poll(() => style('slider-thumb', 0).boxShadow).not.toBe(hovered)
    await letGoOfTheMouse()

    await userEvent.hover(part('slider-thumb', 1))
    await frames(4)
    expect(style('slider-thumb', 1).boxShadow).toBe('none')

    await pressMouse('[data-slot="slider"][data-disabled] [data-slot="slider-thumb"]')
    await frames(4)
    expect(style('slider-thumb', 1).boxShadow).toBe('none')
  })

  it('does nothing with the pointer or the keyboard when it is disabled', async () => {
    renderInBrowser(
      <>
        <button>Before</button>
        <Slider ariaLabel="Volume" defaultValue={30} disabled />
        <button>After</button>
      </>
    )

    await userEvent.tab()
    await userEvent.tab()

    expect(document.activeElement).toBe(page.getByRole('button', { name: 'After' }).element())

    await userEvent.keyboard('{ArrowRight}{End}')
    await userEvent.click(control(), { position: at(0.8) })

    expect(value()).toBe(30)
    expect(document.activeElement).not.toBe(thumb())
    expect(style('slider-control').cursor).toBe('not-allowed')
    expect(style('slider-control').opacity).toBe('0.38')
  })
})

describe('Slider motion in a real browser', () => {
  it('eases the filled part to the new value after a key and lands on it', async () => {
    renderInBrowser(<Slider ariaLabel="Volume" />, 'auto')
    await userEvent.tab()

    const widths: number[] = []
    const sampling = (async () => {
      for (let index = 0; index < 45; index += 1) {
        widths.push(range().getBoundingClientRect().width)
        await frames(1)
      }
    })()

    await userEvent.keyboard('{End}')
    await sampling

    const full = track().getBoundingClientRect().width

    expect(widths[0]).toBe(0)
    expect(widths.some((width) => width > full * 0.05 && width < full * 0.95)).toBe(true)
    expect(Math.abs(widths.at(-1)! - full)).toBeLessThanOrEqual(0.5)
  })

  it('follows the pointer with no easing while it is dragged and eases again afterwards', async () => {
    renderInBrowser(<Slider ariaLabel="Volume" defaultValue={40} />, 'auto')

    expect(style('slider-range').transitionProperty).toBe('inline-size')

    await pressMouse('[data-slot="slider-thumb"]')

    expect(style('slider-range').transitionProperty).toBe('none')
    expect(style('slider-thumb').transitionProperty).toBe('box-shadow')
    expect(getComputedStyle(part('slider-thumb').parentElement!).transitionProperty).toBe('none')

    await letGoOfTheMouse()
    await expect.poll(() => style('slider-range').transitionProperty).toBe('inline-size')
    expect(getComputedStyle(part('slider-thumb').parentElement!).transitionProperty).toBe('inset-inline-start')
  })

  it('drops the easing of the filled part with reduced motion', async () => {
    renderInBrowser(<Slider ariaLabel="Volume" />, 'auto')
    await setReducedMotion('reduce')

    await expect.poll(() => style('slider-range').transitionProperty).toBe('none')
    expect(getComputedStyle(part('slider-thumb').parentElement!).transitionProperty).toBe('none')
  })

  it('has no easing with animation={false}', () => {
    renderInBrowser(<Slider ariaLabel="Volume" animation={false} />, 'auto')

    expect(style('slider-range').transitionDuration).toBe('0s')
  })
})

describe('Slider in forced colors in a real browser', () => {
  const forced = unlessWebkit('forcedColors') ? it : it.skip

  forced('draws the track as an outline, the filled part and the thumb solid, all visible against the page', async () => {
    renderInBrowser(<Slider ariaLabel="Volume" defaultValue={40} />)
    await setForcedColors('active')

    await expect.poll(() => style('slider-track').borderTopStyle).toBe('solid')

    expect(contrastRatio(style('slider-track').borderTopColor, canvas())).toBeGreaterThanOrEqual(3)
    expect(contrastRatio(style('slider-range').backgroundColor, canvas())).toBeGreaterThanOrEqual(3)
    expect(contrastRatio(style('slider-thumb').borderTopColor, canvas())).toBeGreaterThanOrEqual(3)
    expect(px(style('slider-thumb').borderTopWidth)).toBeGreaterThan(0)
    expect(style('slider-thumb').backgroundColor).toBe(canvas())
    expect(range().getBoundingClientRect().height).toBeGreaterThan(0)
  })
})

describe('Slider from the hooks', () => {
  it('takes the geometry of the track, the thumb and the control from their hooks', () => {
    const probes: Probe[] = [
      ['--enchase-slider-track-height', '10px', () => track(), 'block-size'],
      ['--enchase-slider-track-radius', '3px', () => track(), 'border-top-left-radius'],
      ['--enchase-slider-thumb-size', '30px', () => thumb(), 'inline-size'],
      ['--enchase-slider-thumb-size', '30px', () => thumb(), 'block-size'],
      ['--enchase-slider-thumb-border-width', '5px', () => thumb(), 'border-top-width'],
      ['--enchase-slider-thumb-radius', '4px', () => thumb(), 'border-top-left-radius'],
      ['--enchase-slider-control-padding-inline', '25px', () => control(), 'padding-inline-start'],
      ['--enchase-slider-gap', '17px', () => root(), 'row-gap'],
      ['--enchase-slider-header-gap', '13px', () => part('slider-header'), 'column-gap']
    ]

    hooked(probes, <Slider label="Volume" showValue />)
  })

  it('takes the colors of the track, the filled part and the thumb from their hooks', () => {
    const probes: Probe[] = [
      ['--enchase-slider-track-background', 'rgb(1, 2, 3)', () => track(), 'background-color'],
      ['--enchase-slider-range-background', 'rgb(4, 5, 6)', () => range(), 'background-color'],
      ['--enchase-slider-thumb-background', 'rgb(7, 8, 9)', () => thumb(), 'background-color'],
      ['--enchase-slider-thumb-border-color', 'rgb(10, 11, 12)', () => thumb(), 'border-top-color']
    ]

    hooked(probes, <Slider ariaLabel="Volume" defaultValue={50} />)
  })

  it('takes the type of the label and of the value from their hooks, and the disabled color of both', () => {
    const probes: Probe[] = [
      ['--enchase-slider-label-font-size', '19px', () => part('slider-label'), 'font-size'],
      ['--enchase-slider-label-font-weight', '800', () => part('slider-label'), 'font-weight'],
      ['--enchase-slider-label-color', 'rgb(13, 14, 15)', () => part('slider-label'), 'color'],
      ['--enchase-slider-value-font-size', '21px', () => part('slider-value'), 'font-size'],
      ['--enchase-slider-value-color', 'rgb(16, 17, 18)', () => part('slider-value'), 'color']
    ]

    hooked(probes, <Slider label="Volume" showValue />)
  })

  it('takes the disabled color of the label and the disabled opacity from their hooks', () => {
    const probes: Probe[] = [
      ['--enchase-slider-label-color-disabled', 'rgb(19, 20, 21)', () => part('slider-label'), 'color'],
      ['--enchase-slider-opacity-disabled', '0.7', () => control(), 'opacity']
    ]

    hooked(probes, <Slider label="Volume" disabled />)
  })

  it('takes the duration of the easing from the animation prop', () => {
    renderInBrowser(<Slider ariaLabel="Volume" animation={{ tuning: { duration: 0.9 } }} />, 'auto')

    expect(style('slider-range').transitionDuration).toBe('0.9s')
    expect(style('slider-thumb').transitionDuration).toBe('0.9s')
    expect(getComputedStyle(part('slider-thumb').parentElement!).transitionDuration).toBe('0.9s')
  })
})
