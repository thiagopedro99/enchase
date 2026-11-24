import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'

import { Skeleton } from '@components/common/Skeleton/index.tsx'
import { Progress } from '@components/common/Progress/index.tsx'
import { Tooltip } from '@components/common/Tooltip/index.tsx'
import { Avatar } from '@components/common/Avatar/index.tsx'
import { Alert } from '@components/common/Alert/index.tsx'
import { Tag } from '@components/common/Tag/index.tsx'
import { part, style } from '../support/hookProbes.ts'
import { material2 } from '@styles/presets/material2.ts'
import { parseComputedColor } from '../support/color.ts'
import { renderInBrowser } from '../support/harness.tsx'
import { waitForSettled } from '../support/settle.ts'
import { contrastRatio } from '@styles/theme/contrast.ts'

import type { ReactElement } from 'react'

const styled = { style: material2 } as const

const show = (ui: ReactElement) => renderInBrowser(ui, 'never', 'light', styled)

const showIn = (ui: ReactElement, mode: 'light' | 'dark') => renderInBrowser(ui, 'never', mode, styled)

const settled = async (mode: 'light' | 'dark') => {
  await expect.poll(() => document.documentElement.dataset.theme).toBe(mode)
  await waitForSettled(() => document.body)
}

const px = (value: string) => parseFloat(value)

afterEach(() => {
  document.documentElement.removeAttribute('style')
})

describe('the alert of the material2 style', () => {
  it('rounds the alert at 4px', () => {
    show(<Alert title="Heads up">Something happened</Alert>)

    expect(px(style('alert').borderTopLeftRadius)).toBe(4)
  })

  it.each([
    ['light', 'rgb(95, 33, 32)'],
    ['dark', 'rgb(244, 199, 199)']
  ] as const)('writes the error alert text in the on-container color of the %s mode, the MUI "standard" dark-tinted text, not a flat primary text override', async (mode, color) => {
    showIn(<Alert variant="error" title="Heads up">Something happened</Alert>, mode)
    await settled(mode)

    expect(style('alert').color).toBe(color)
  })
})

describe('the tag of the material2 style, as an MUI filled chip', () => {
  it('fills the tag with an opaque tint and leaves the border fully transparent, not the generic outline', () => {
    show(<Tag>Label</Tag>)

    expect(style('tag').borderColor).toBe('rgba(0, 0, 0, 0)')
    expect(parseComputedColor(style('tag').backgroundColor).a).toBeGreaterThan(0.9)
  })

  it.each(['light', 'dark'] as const)('keeps the label readable on the tinted fill in the %s mode', async (mode) => {
    showIn(<Tag>Label</Tag>, mode)
    await settled(mode)
    const fill = parseComputedColor(style('tag').backgroundColor)
    const fillCss = `rgba(${fill.r}, ${fill.g}, ${fill.b}, ${fill.a})`

    expect(contrastRatio(style('tag-label').color, fillCss)).toBeGreaterThanOrEqual(4.5)
  })

  it('sizes the small tag at 24px', () => {
    show(<Tag size="sm">S</Tag>)

    expect(part('tag').getBoundingClientRect().height).toBe(24)
  })

  it('sizes the medium tag at 32px with a 13px font', () => {
    show(<Tag size="md">M</Tag>)

    expect(part('tag').getBoundingClientRect().height).toBe(32)
    expect(style('tag').fontSize).toBe('13px')
  })
})

describe('the avatar of the material2 style', () => {
  it('fills a 40px circle with a neutral grey and white text, not the primary container', () => {
    show(<Avatar>AB</Avatar>)
    const box = part('avatar').getBoundingClientRect()

    expect([box.width, box.height]).toEqual([40, 40])
    expect(style('avatar').backgroundColor).toBe('rgb(118, 118, 118)')
    expect(style('avatar').color).toBe('rgb(255, 255, 255)')
  })
})

describe('the tooltip of the material2 style', () => {
  it('writes the bubble at 0.6875rem in medium weight', async () => {
    show(
      <Tooltip text="Explains it">
        <button type="button">Hover</button>
      </Tooltip>
    )
    await userEvent.hover(part('tooltip-trigger'))
    await waitForSettled(() => part('tooltip-bubble'))

    expect(style('tooltip-bubble').fontSize).toBe('11px')
    expect(style('tooltip-bubble').fontWeight).toBe('500')
  })
})

describe('the progress of the material2 style', () => {
  it('draws the linear track at 4px high', () => {
    show(<Progress value={50} />)

    expect(part('progress-track').getBoundingClientRect().height).toBe(4)
  })
})

describe('the skeleton of the material2 style', () => {
  it('rounds the rectangular variant at 4px, with the MUI literal grey, not a token reference', () => {
    show(<Skeleton variant="rectangular" />)

    expect(px(style('skeleton').borderTopLeftRadius)).toBe(4)
    expect(style('skeleton').backgroundColor).toBe('rgba(0, 0, 0, 0.11)')
  })
})
