import { useState } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { Checkbox } from '@components/common/Checkbox/index.tsx'
import { contrastRatio } from '@styles/theme/contrast.ts'
import { setForcedColors } from './media.ts'
import { unlessWebkit } from './browserSkips.ts'
import { renderInBrowser } from './harness.tsx'
import { onRoot, part, style } from './hookProbes.ts'
import { capture } from './pixels.ts'

import type { Rgba } from './color.ts'

const tolerance = 8

const near = (first: Rgba, second: Rgba) => [first.r - second.r, first.g - second.g, first.b - second.b].every((difference) => Math.abs(difference) <= tolerance)

const markColors = { '--enchase-checkbox-box-background-checked': 'rgb(200, 40, 40)', '--enchase-checkbox-box-border-color-checked': 'rgb(200, 40, 40)', '--enchase-checkbox-icon-color': 'rgb(250, 250, 250)' }

const red = { r: 200, g: 40, b: 40, a: 1 }

const white = { r: 250, g: 250, b: 250, a: 1 }

const inputs = () => [...document.body.querySelectorAll<HTMLInputElement>('[data-slot="checkbox-input"]')]

const center = (box: HTMLElement) => {
  const rect = box.getBoundingClientRect()

  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
}

const Clearing = () => {
  const [state, setState] = useState<'some' | 'all'>('some')

  return <Checkbox label="Some" checked={state === 'all'} indeterminate={state === 'some'} onChange={() => setState('all')} />
}

afterEach(async () => {
  document.documentElement.removeAttribute('style')
  await setForcedColors('none')
})

describe('Checkbox in a real browser', () => {
  it('breaks a label that has no room to wrap instead of overflowing the container', () => {
    const word = 'Benachrichtigungseinstellungsverwaltungsseite'

    renderInBrowser(
      <div style={{ inlineSize: 140 }}>
        <Checkbox label={word} />
      </div>
    )
    const container = part('checkbox-field').parentElement as HTMLElement

    expect(container.scrollWidth).toBeLessThanOrEqual(container.clientWidth)
    expect(part('checkbox').getBoundingClientRect().width).toBeLessThanOrEqual(140)
  })

  it('paints the border of an unchecked box with the error color when it is invalid, and not when it is checked', () => {
    renderInBrowser(
      <>
        <Checkbox label="Valid" />
        <Checkbox label="Invalid" aria-invalid="true" />
        <Checkbox label="Invalid and checked" aria-invalid="true" defaultChecked />
      </>
    )
    const error = getComputedStyle(document.documentElement).getPropertyValue('--enchase-color-error').trim()
    const probe = document.createElement('span')

    probe.style.color = error
    document.body.append(probe)

    const expected = getComputedStyle(probe).color

    probe.remove()

    expect(style('checkbox-box', 1).borderTopColor).toBe(expected)
    expect(style('checkbox-box', 0).borderTopColor).not.toBe(expected)
    expect(style('checkbox-box', 2).borderTopColor).not.toBe(expected)
  })

  it('takes the border of an unchecked invalid box from its hook', () => {
    onRoot({ '--enchase-checkbox-box-border-color-invalid': 'rgb(1, 2, 3)' })
    renderInBrowser(<Checkbox label="Invalid" aria-invalid="true" />)

    expect(style('checkbox-box').borderTopColor).toBe('rgb(1, 2, 3)')
  })
})

describe('Checkbox indeterminate in a real browser', () => {
  it('matches :indeterminate for the prop and for nothing else', () => {
    renderInBrowser(
      <>
        <Checkbox label="Plain" />
        <Checkbox label="Mixed" indeterminate />
        <Checkbox label="Mixed and checked" indeterminate defaultChecked />
        <Checkbox label="Off" indeterminate={false} />
      </>
    )

    expect(inputs().map((input) => input.matches(':indeterminate'))).toEqual([false, true, true, false])
  })

  it('stays indeterminate after a mouse click and after Space while the prop does not change', async () => {
    renderInBrowser(<Checkbox label="Mixed" indeterminate />)
    const input = inputs()[0]

    await userEvent.click(page.getByText('Mixed'))
    expect(input.matches(':indeterminate')).toBe(true)
    expect(input.checked).toBe(true)

    input.focus()
    await userEvent.keyboard(' ')
    expect(input.matches(':indeterminate')).toBe(true)
    expect(input.checked).toBe(false)
  })

  it('lets the app clear the mixed state from onChange', async () => {
    renderInBrowser(<Clearing />)

    expect(inputs()[0].matches(':indeterminate')).toBe(true)
    await userEvent.click(page.getByText('Some'))

    expect(inputs()[0].matches(':indeterminate')).toBe(false)
    expect(inputs()[0].checked).toBe(true)
  })

  it('fills the box like a checked one and draws a dash in the middle, not a check mark', async () => {
    onRoot(markColors)
    renderInBrowser(
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 24 }}>
        <Checkbox label="Off" />
        <Checkbox label="On" defaultChecked />
        <Checkbox label="Mixed" indeterminate />
      </div>
    )

    const colorAt = await capture()
    const [off, mixed] = [0, 2].map((index) => center(part('checkbox-box', index)))
    const dash = [colorAt(mixed.x, mixed.y), colorAt(mixed.x - 3, mixed.y), colorAt(mixed.x + 3, mixed.y)]
    const body = [colorAt(mixed.x, mixed.y - 3), colorAt(mixed.x, mixed.y + 3), colorAt(mixed.x - 6.5, mixed.y), colorAt(mixed.x + 6.5, mixed.y)]

    expect(style('checkbox-box', 2).backgroundColor).toBe(style('checkbox-box', 1).backgroundColor)
    expect(style('checkbox-box', 2).borderTopColor).toBe(style('checkbox-box', 1).borderTopColor)
    expect(dash.every((pixel) => near(pixel, white)), 'the dash is the icon color').toBe(true)
    expect(body.every((pixel) => near(pixel, red)), 'around the dash it is the fill').toBe(true)
    expect(near(colorAt(off.x, off.y), red), 'an unchecked box is not filled').toBe(false)
  })

  it('draws the dash from the box size and from the width of the check', async () => {
    onRoot({ ...markColors, '--enchase-checkbox-box-size': '36px', '--enchase-checkbox-box-check-width': '6px' })
    renderInBrowser(
      <div style={{ padding: 24 }}>
        <Checkbox label="Mixed" indeterminate />
      </div>
    )

    const colorAt = await capture()
    const { x, y } = center(part('checkbox-box'))

    expect(near(colorAt(x - 9, y), white), 'half of a dash of 20px, from the box size').toBe(true)
    expect(near(colorAt(x + 9, y), white)).toBe(true)
    expect(near(colorAt(x - 12, y), red), 'past the end of the dash').toBe(true)
    expect(near(colorAt(x, y - 2), white), 'a dash of 6px, from the check width').toBe(true)
    expect(near(colorAt(x, y + 2), white)).toBe(true)
    expect(near(colorAt(x, y - 5), red)).toBe(true)
  })

  it('paints a disabled mixed box like a disabled checked one', () => {
    renderInBrowser(
      <>
        <Checkbox label="Checked" disabled defaultChecked />
        <Checkbox label="Mixed" disabled indeterminate />
      </>
    )

    expect(style('checkbox-box', 1).backgroundColor).toBe(style('checkbox-box', 0).backgroundColor)
    expect(style('checkbox-box', 1).borderTopColor).toBe(style('checkbox-box', 0).borderTopColor)
    expect(style('checkbox-box', 1).cursor).toBe('not-allowed')
  })

  it('does not paint the error border on a mixed box, as with a checked one', () => {
    renderInBrowser(
      <>
        <Checkbox label="Checked" aria-invalid="true" defaultChecked />
        <Checkbox label="Mixed" aria-invalid="true" indeterminate />
        <Checkbox label="Unchecked" aria-invalid="true" />
      </>
    )

    expect(style('checkbox-box', 1).borderTopColor).toBe(style('checkbox-box', 0).borderTopColor)
    expect(style('checkbox-box', 1).borderTopColor).not.toBe(style('checkbox-box', 2).borderTopColor)
  })

  it('keeps the box size and the label alignment of the other states', () => {
    renderInBrowser(
      <>
        <Checkbox label="Plain" />
        <Checkbox label="Mixed" indeterminate />
      </>
    )

    expect(part('checkbox-box', 1).getBoundingClientRect().width).toBe(part('checkbox-box', 0).getBoundingClientRect().width)
    expect(part('checkbox', 1).getBoundingClientRect().height).toBe(part('checkbox', 0).getBoundingClientRect().height)
  })

  const forced = unlessWebkit('forcedColors') ? it : it.skip

  forced('keeps the dash visible against the box in forced colors', async () => {
    renderInBrowser(<Checkbox label="Mixed" indeterminate />)
    await setForcedColors('active')

    await expect.poll(() => getComputedStyle(part('checkbox-box').firstElementChild as Element, '::after').borderTopStyle).toBe('solid')

    const dash = getComputedStyle(part('checkbox-box').firstElementChild as Element, '::after')

    expect(contrastRatio(dash.borderTopColor, style('checkbox-box').backgroundColor)).toBeGreaterThanOrEqual(3)
    expect(parseFloat(dash.borderTopWidth)).toBeGreaterThan(0)
    expect(parseFloat(getComputedStyle(part('checkbox-box').firstElementChild as Element).opacity)).toBe(1)
  })
})
