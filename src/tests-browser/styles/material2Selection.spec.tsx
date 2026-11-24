import { afterEach, describe, expect, it } from 'vitest'

import { SegmentedControl } from '@components/common/SegmentedControl/index.tsx'
import { RadioGroup } from '@components/common/RadioGroup/index.tsx'
import { Checkbox } from '@components/common/Checkbox/index.tsx'
import { Slider } from '@components/common/Slider/index.tsx'
import { Switch } from '@components/common/Switch/index.tsx'
import { part, style } from '../support/hookProbes.ts'
import { material2 } from '@styles/presets/material2.ts'
import { parseComputedColor } from '../support/color.ts'
import { renderInBrowser } from '../support/harness.tsx'

import type { ReactElement } from 'react'

const styled = { style: material2 } as const

const show = (ui: ReactElement) => renderInBrowser(ui, 'never', 'light', styled)

const px = (value: string) => parseFloat(value)

afterEach(() => {
  document.documentElement.removeAttribute('style')
})

describe('the checkbox and the radio of the material2 style', () => {
  it('draws the checkbox box at 18px with a 2px border in the secondary text color', () => {
    show(<Checkbox label="Terms" />)
    const box = part('checkbox-box').getBoundingClientRect()

    expect([box.width, box.height]).toEqual([18, 18])
    expect(style('checkbox-box').borderTopWidth).toBe('2px')
    expect(style('checkbox-box').borderTopColor).toBe('rgba(0, 0, 0, 0.6)')
  })

  it('fills the checked checkbox with the primary color', () => {
    show(<Checkbox label="Terms" defaultChecked />)

    expect(style('checkbox-box').backgroundColor).toBe('rgb(6, 108, 200)')
  })

  it('draws the radio control at 20px with a border in the secondary text color, and a 10px dot when checked', () => {
    show(<RadioGroup label="Plan" options={[{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }]} defaultValue="a" />)
    const control = part('radio-group-control', 0).getBoundingClientRect()
    const dot = part('radio-group-control', 0).querySelector('span')?.getBoundingClientRect() as DOMRect

    expect([control.width, control.height]).toEqual([20, 20])
    expect([dot.width, dot.height]).toEqual([10, 10])
    expect(style('radio-group-control', 1).borderColor).toBe('rgba(0, 0, 0, 0.6)')
  })
})

describe('the switch of the material2 style', () => {
  it('draws the track at 34 by 14px and the thumb at 20px, bigger than the track, as MUI does', () => {
    show(<Switch label="Notify" />)
    const track = part('switch-track').getBoundingClientRect()
    const thumb = part('switch-thumb').getBoundingClientRect()

    expect([Math.round(track.width), Math.round(track.height)]).toEqual([34, 14])
    expect([thumb.width, thumb.height]).toEqual([20, 20])
    expect(thumb.height).toBeGreaterThan(track.height)
  })

  it('keeps the thumb at full size off, unlike the generic shrink-when-off of the other styles', () => {
    show(<Switch label="Notify" defaultChecked={false} />)
    const off = part('switch-thumb').getBoundingClientRect()
    const matrix = style('switch-thumb').transform.match(/matrix\(([^,]+),/)

    expect(Number(matrix?.[1])).toBeCloseTo(1, 5)
    expect(off.width).toBe(20)
  })

  it('paints the thumb white and the track grey when off, the thumb primary and the track at 50% primary when on', () => {
    show(
      <>
        <Switch label="Off" defaultChecked={false} />
        <Switch label="On" defaultChecked />
      </>
    )

    expect(style('switch-thumb', 0).backgroundColor).toBe('rgb(255, 255, 255)')
    expect(style('switch-thumb', 1).backgroundColor).toBe('rgb(6, 108, 200)')
    const track = parseComputedColor(style('switch-track', 1).backgroundColor)

    expect(Math.abs(track.r - 130.5)).toBeLessThanOrEqual(1)
    expect(Math.abs(track.g - 181.5)).toBeLessThanOrEqual(1)
    expect(Math.abs(track.b - 227.5)).toBeLessThanOrEqual(1)
  })

  it('casts elevation 1 under the thumb', () => {
    show(<Switch label="Notify" />)

    expect(style('switch-thumb').boxShadow).toContain('rgba(0, 0, 0, 0.2) 0px 2px 1px -1px')
  })
})

describe('the segmented control of the material2 style', () => {
  it('rounds the control at 4px with a 1px border, the ToggleButtonGroup look', () => {
    show(
      <SegmentedControl label="View" items={[{ value: 'list', label: 'List' }, { value: 'board', label: 'Board' }]} defaultValue="list" />
    )

    expect(px(style('segmented-control').borderTopLeftRadius)).toBe(4)
    expect(style('segmented-control').borderTopWidth).toBe('1px')
    expect(style('segmented-control').backgroundColor).toBe('rgba(0, 0, 0, 0)')
  })

  it('fills the selected item with a neutral 8% layer, not a primary tint', () => {
    show(
      <SegmentedControl label="View" items={[{ value: 'list', label: 'List' }, { value: 'board', label: 'Board' }]} defaultValue="list" />
    )
    const selected = style('segmented-control-item', 0)

    expect(selected.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(selected.backgroundColor).not.toContain('6, 108, 200')
  })
})

describe('the slider of the material2 style, which already matches MUI with no hook of its own', () => {
  it('draws a 4px track and a 20px thumb in the primary color with no border', () => {
    show(<Slider label="Volume" defaultValue={50} />)

    expect(part('slider-track').getBoundingClientRect().height).toBe(4)
    const thumb = part('slider-thumb').getBoundingClientRect()

    expect([thumb.width, thumb.height]).toEqual([20, 20])
    expect(style('slider-thumb').backgroundColor).toBe('rgb(6, 108, 200)')
    expect(style('slider-thumb').borderTopColor).toBe('rgb(6, 108, 200)')
  })
})
