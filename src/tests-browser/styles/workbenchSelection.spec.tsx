import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'

import { SegmentedControl } from '@components/common/SegmentedControl/index.tsx'
import { CheckboxGroup } from '@components/common/CheckboxGroup/index.tsx'
import { RadioGroup } from '@components/common/RadioGroup/index.tsx'
import { letGoOfTheMouse, pressMouse } from '../support/pointer.ts'
import { Checkbox } from '@components/common/Checkbox/index.tsx'
import { Switch } from '@components/common/Switch/index.tsx'
import { Slider } from '@components/common/Slider/index.tsx'
import { at, part, style } from '../support/hookProbes.ts'
import { workbench } from '@styles/presets/workbench.ts'
import { renderInBrowser } from '../support/harness.tsx'
import { waitForSettled } from '../support/settle.ts'

import type { ReactElement } from 'react'

const styled = { style: workbench } as const

const show = (ui: ReactElement, mode: 'light' | 'dark' = 'light') => renderInBrowser(ui, 'never', mode, styled)

const showDark = async (ui: ReactElement) => {
  show(ui, 'dark')
  await expect.poll(() => document.documentElement.dataset.theme).toBe('dark')
  await waitForSettled(() => document.body)
}

const px = (value: string) => parseFloat(value)

const plan = [
  { value: 'a', label: 'Free' },
  { value: 'b', label: 'Pro' }
]

const views = [
  { value: 'a', label: 'List' },
  { value: 'b', label: 'Board' }
]

const thumbShadow = 'rgba(0, 35, 11, 0.2) 0px 2px 4px 0px'

afterEach(async () => {
  await letGoOfTheMouse()
  document.documentElement.removeAttribute('style')
})

describe('the checkbox of the workbench style', () => {
  it('draws a 16px box with 4px corners and a 1px border in the strong border color, where the original #D9D9D9 holds 1.41:1 against the page', () => {
    show(<Checkbox label="Accept" />)
    const box = style('checkbox-box')

    expect([px(box.width), px(box.height)]).toEqual([16, 16])
    expect(px(box.borderTopLeftRadius)).toBe(4)
    expect(box.borderTopWidth).toBe('1px')
    expect(box.borderTopColor).toBe('rgba(0, 0, 0, 0.45)')
  })

  it('puts the label 8px after the box in 14px regular type, in a target of 24px or more', () => {
    show(<Checkbox label="Accept" />)
    const box = part('checkbox-box').getBoundingClientRect()
    const label = part('checkbox-label').getBoundingClientRect()

    expect(label.left - box.right).toBe(8)
    expect(px(style('checkbox-label').fontSize)).toBe(14)
    expect(style('checkbox-label').fontWeight).toBe('400')
    expect(part('checkbox').getBoundingClientRect().height).toBeGreaterThanOrEqual(24)
  })

  it('fills the checked box with the primary blue #0958D9, where the original #1677FF holds 4.10:1 against its white mark', () => {
    show(<Checkbox label="Accept" defaultChecked />)

    expect(style('checkbox-box').backgroundColor).toBe('rgb(9, 88, 217)')
    expect(style('checkbox-box').borderTopColor).toBe('rgb(9, 88, 217)')
  })

  it('moves the border of the box to the primary color under the pointer with no halo around it, as the original does', async () => {
    show(<Checkbox label="Accept" />)
    await userEvent.hover(part('checkbox'))
    await waitForSettled(at('checkbox'))
    const box = style('checkbox-box')

    expect(box.borderTopColor).toBe('rgb(9, 88, 217)')
    expect(box.boxShadow).toMatch(/ 0px 0px 0px 0px$/)
  })

  it('fills the checked box with the light blue and moves the border to it under the pointer in the dark mode', async () => {
    await showDark(
      <>
        <Checkbox label="Checked" defaultChecked />
        <Checkbox label="Accept" />
      </>
    )
    await userEvent.hover(part('checkbox', 1))
    await waitForSettled(at('checkbox', 1))

    expect(style('checkbox-box', 0).backgroundColor).toBe('rgb(101, 169, 243)')
    expect(style('checkbox-box', 1).borderTopColor).toBe('rgb(101, 169, 243)')
  })

  it('draws the options of a checkbox group with the same box and the same gap', () => {
    show(<CheckboxGroup label="Topics" options={plan} defaultValue={['a']} />)

    expect([px(style('checkbox-box', 0).width), px(style('checkbox-box', 1).width)]).toEqual([16, 16])
    expect(part('checkbox-label', 0).getBoundingClientRect().left - part('checkbox-box', 0).getBoundingClientRect().right).toBe(8)
    expect(style('checkbox-box', 0).backgroundColor).toBe('rgb(9, 88, 217)')
  })
})

describe('the radio of the workbench style', () => {
  it('draws a 16px circle with a 1px border in the strong border color, where the original #D9D9D9 holds 1.41:1 against the page', () => {
    show(<RadioGroup label="Plan" options={plan} />)
    const control = style('radio-group-control')

    expect([px(control.width), px(control.height)]).toEqual([16, 16])
    expect(px(control.borderTopLeftRadius)).toBeGreaterThanOrEqual(8)
    expect(control.borderTopWidth).toBe('1px')
    expect(control.borderTopColor).toBe('rgba(0, 0, 0, 0.45)')
  })

  it('puts the label 8px after the circle in 14px regular type', () => {
    show(<RadioGroup label="Plan" options={plan} />)
    const control = part('radio-group-control').getBoundingClientRect()
    const label = part('radio-group-label').getBoundingClientRect()

    expect(label.left - control.right).toBe(8)
    expect(px(style('radio-group-label').fontSize)).toBe(14)
    expect(style('radio-group-label').fontWeight).toBe('400')
  })

  it('fills the checked circle with the primary blue and a white dot of 6px, as the original does, with #0958D9 in place of #1677FF', () => {
    show(<RadioGroup label="Plan" options={plan} defaultValue="a" />)
    const dot = part('radio-group-control', 0).firstElementChild as HTMLElement

    expect(style('radio-group-control', 0).backgroundColor).toBe('rgb(9, 88, 217)')
    expect(style('radio-group-control', 0).borderTopColor).toBe('rgb(9, 88, 217)')
    expect(getComputedStyle(dot).borderTopColor).toBe('rgb(255, 255, 255)')
    expect([dot.getBoundingClientRect().width, dot.getBoundingClientRect().height]).toEqual([6, 6])
    expect(style('radio-group-control', 1).backgroundColor).toBe('rgba(0, 0, 0, 0)')
  })

  it('fills the checked circle with the light blue and a dark dot in the dark mode, which keeps the dot 7.48:1 against the fill', async () => {
    await showDark(<RadioGroup label="Plan" options={plan} defaultValue="a" />)
    const dot = part('radio-group-control', 0).firstElementChild as HTMLElement

    expect(style('radio-group-control', 0).backgroundColor).toBe('rgb(101, 169, 243)')
    expect(getComputedStyle(dot).borderTopColor).toBe('rgb(20, 20, 20)')
  })
})

describe('the switch of the workbench style', () => {
  it('sizes the track at 44px by 22px and the thumb at 18px, 2px from the edge of the track', () => {
    show(<Switch label="Alerts" />)
    const track = part('switch-track').getBoundingClientRect()
    const thumb = part('switch-thumb').getBoundingClientRect()

    expect([track.width, track.height]).toEqual([44, 22])
    expect([thumb.width, thumb.height]).toEqual([18, 18])
    expect(thumb.left - track.left).toBe(2)
    expect(thumb.top - track.top).toBe(2)
  })

  it('slides the thumb 22px to the other end, which leaves it 2px from the edge', () => {
    show(<Switch label="Alerts" defaultChecked />)
    const track = part('switch-track').getBoundingClientRect()
    const thumb = part('switch-thumb').getBoundingClientRect()

    expect(thumb.left - track.left).toBe(24)
    expect(track.right - thumb.right).toBe(2)
  })

  it('paints the off track in the strong border color, 3.35:1 against the page, where the original paints 25% black, 1.83:1, and the on track in the primary blue', () => {
    show(
      <>
        <Switch label="Off" />
        <Switch label="On" defaultChecked />
      </>
    )

    expect(style('switch-track', 0).backgroundColor).toBe('rgba(0, 0, 0, 0.45)')
    expect(style('switch-track', 0).borderTopColor).toBe('rgba(0, 0, 0, 0)')
    expect(style('switch-track', 1).backgroundColor).toBe('rgb(9, 88, 217)')
  })

  it('paints the thumb in white at its full size in both states, with the shadow of the original', () => {
    show(
      <>
        <Switch label="Off" />
        <Switch label="On" defaultChecked />
      </>
    )

    for (const index of [0, 1]) {
      expect(style('switch-thumb', index).backgroundColor).toBe('rgb(255, 255, 255)')
      expect(style('switch-thumb', index).boxShadow).toBe(thumbShadow)
    }
  })

  it.each([
    ['off', false],
    ['on', true]
  ] as const)('keeps the shadow of the thumb while the switch is %s, under the pointer and pressed, as the original has no halo', async (_, checked) => {
    show(<Switch label="Alerts" defaultChecked={checked} />)
    await userEvent.hover(part('switch'))
    await waitForSettled(at('switch'))
    expect(style('switch-thumb').boxShadow).toBe(thumbShadow)
    await pressMouse('[data-slot=switch]')
    await waitForSettled(at('switch'))
    expect(style('switch-thumb').boxShadow).toBe(thumbShadow)
  })

  it('dims the disabled switch with the opacity of the disabled content, 0.38 over the strong track where the original has 0.65 over 25% black, and keeps the label in the text color under that opacity', () => {
    show(<Switch label="Alerts" disabled />)

    expect(style('switch-track').opacity).toBe('0.38')
    expect(style('switch-track').borderTopColor).toBe('rgba(0, 0, 0, 0)')
    expect(style('switch-thumb').backgroundColor).toBe('rgb(255, 255, 255)')
    expect(style('switch-label').color).toBe('rgba(0, 0, 0, 0.88)')
    expect(style('switch-label').opacity).toBe('0.38')
  })

  it('keeps the disabled on track in the primary blue under the same opacity, so it does not fade twice', () => {
    show(<Switch label="Alerts" disabled defaultChecked />)

    expect(style('switch-track').backgroundColor).toBe('rgb(9, 88, 217)')
    expect(style('switch-track').opacity).toBe('0.38')
    expect(style('switch-thumb').backgroundColor).toBe('rgb(255, 255, 255)')
  })

  it('paints the on track in the light blue and the thumb in the dark color in the dark mode, which keeps the thumb 7.48:1 against the track', async () => {
    await showDark(<Switch label="Alerts" defaultChecked />)

    expect(style('switch-track').backgroundColor).toBe('rgb(101, 169, 243)')
    expect(style('switch-thumb').backgroundColor).toBe('rgb(20, 20, 20)')
  })
})

describe('the slider of the workbench style', () => {
  it('draws a track of 4px and a round thumb of 14px, which is the button of 10px and the ring of 2px of the original', () => {
    show(<Slider ariaLabel="Volume" defaultValue={40} />)
    const thumb = style('slider-thumb')

    expect(px(style('slider-track').height)).toBe(4)
    expect([px(thumb.width), px(thumb.height)]).toEqual([14, 14])
    expect(part('slider-thumb').clientWidth).toBe(10)
    expect(px(thumb.borderTopLeftRadius)).toBeGreaterThanOrEqual(7)
  })

  it('draws the ring of the thumb 2px wide in the primary blue around a white button, where the original draws it in #91CAFF, 1.74:1 against the page', () => {
    show(<Slider ariaLabel="Volume" defaultValue={40} />)
    const thumb = style('slider-thumb')

    expect(thumb.borderTopWidth).toBe('2px')
    expect(thumb.borderTopColor).toBe('rgb(9, 88, 217)')
    expect(thumb.backgroundColor).toBe('rgb(255, 255, 255)')
  })

  it('fills the passed part of the track in the primary blue, where the original fills it in #91CAFF, 1.74:1 against the page', () => {
    show(<Slider ariaLabel="Volume" defaultValue={40} />)

    expect(style('slider-range').backgroundColor).toBe('rgb(9, 88, 217)')
  })

  it('paints the button of the thumb in the dark surface and the ring in the light blue in the dark mode', async () => {
    await showDark(<Slider ariaLabel="Volume" defaultValue={40} />)

    expect(style('slider-thumb').backgroundColor).toBe('rgb(20, 20, 20)')
    expect(style('slider-thumb').borderTopColor).toBe('rgb(101, 169, 243)')
  })
})

describe('the segmented control of the workbench style', () => {
  it.each([
    ['sm', 7, 14],
    ['md', 11, 14],
    ['lg', 11, 16]
  ] as const)('gives the items of the %s control %ipx of inline padding, no block padding and %ipx regular type', (size, padding, font) => {
    show(<SegmentedControl size={size} ariaLabel="View" items={views} defaultValue="a" />)
    const item = style('segmented-control-item', 0)

    expect(px(item.paddingLeft)).toBe(padding)
    expect(px(item.paddingRight)).toBe(padding)
    expect(px(item.paddingTop)).toBe(0)
    expect(px(item.paddingBottom)).toBe(0)
    expect(px(item.fontSize)).toBe(font)
    expect(item.fontWeight).toBe('400')
  })

  it.each([
    ['md', 32, 28],
    ['lg', 40, 36]
  ] as const)('sizes the %s control at %ipx with items of %ipx inside the track', (size, height, itemHeight) => {
    show(<SegmentedControl size={size} ariaLabel="View" items={views} defaultValue="a" />)

    expect(part('segmented-control').getBoundingClientRect().height).toBe(height)
    expect(part('segmented-control-item', 0).getBoundingClientRect().height).toBe(itemHeight)
  })

  it('lifts the items of the sm control to 24px, which makes the control 28px where the original has 24px and items of 20px, under the floor of 24px for a target', () => {
    show(<SegmentedControl size="sm" ariaLabel="View" items={views} defaultValue="a" />)

    expect(part('segmented-control-item', 0).getBoundingClientRect().height).toBeGreaterThanOrEqual(24)
    expect(part('segmented-control-item', 0).getBoundingClientRect().height).toBeLessThan(24.1)
    expect(part('segmented-control').getBoundingClientRect().height).toBeCloseTo(28, 1)
  })

  it('makes the item 28px high inside a track with 2px of padding and 6px corners, and rounds the item at 4px', () => {
    show(<SegmentedControl ariaLabel="View" items={views} defaultValue="a" />)
    const track = style('segmented-control')

    expect(part('segmented-control-item', 0).getBoundingClientRect().height).toBe(28)
    expect(px(track.paddingTop)).toBe(2)
    expect(px(track.paddingLeft)).toBe(2)
    expect(px(track.borderTopLeftRadius)).toBe(6)
    expect(px(style('segmented-control-item', 0).borderTopLeftRadius)).toBe(4)
  })

  it('draws the track in the gray container with no border and no separator between the items', () => {
    show(<SegmentedControl ariaLabel="View" items={views} defaultValue="a" />)

    expect(style('segmented-control').backgroundColor).toBe('rgb(245, 245, 245)')
    expect(style('segmented-control').borderTopWidth).toBe('0px')
    expect(style('segmented-control-item', 1).borderLeftWidth).toBe('0px')
  })

  it('lifts the chosen item in white with the shadow of the original, and leaves the others flat', () => {
    show(<SegmentedControl ariaLabel="View" items={views} defaultValue="a" />)

    expect(style('segmented-control-item', 0).backgroundColor).toBe('rgb(255, 255, 255)')
    expect(style('segmented-control-item', 0).boxShadow).toBe('rgba(0, 0, 0, 0.05) 0px 1px 2px 0px, rgba(0, 0, 0, 0.03) 0px 1px 6px -1px, rgba(0, 0, 0, 0.03) 0px 2px 4px 0px')
    expect(style('segmented-control-item', 1).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(style('segmented-control-item', 1).boxShadow).toBe('none')
  })

  it('paints the track in the dark container and the chosen item in the dark surface in the dark mode', async () => {
    await showDark(<SegmentedControl ariaLabel="View" items={views} defaultValue="a" />)

    expect(style('segmented-control').backgroundColor).toBe('rgb(39, 39, 39)')
    expect(style('segmented-control-item', 0).backgroundColor).toBe('rgb(20, 20, 20)')
    expect(style('segmented-control-item', 1).backgroundColor).toBe('rgba(0, 0, 0, 0)')
  })
})
