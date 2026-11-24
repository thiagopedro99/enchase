import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'

import { NumberInput } from '@components/common/NumberInput/index.tsx'
import { Textarea } from '@components/common/Textarea/index.tsx'
import { Button } from '@components/common/Button/index.tsx'
import { Select } from '@components/common/Select/index.tsx'
import { at, part, style } from '../support/hookProbes.ts'
import { Input } from '@components/common/Input/index.tsx'
import { material2 } from '@styles/presets/material2.ts'
import { parseComputedColor } from '../support/color.ts'
import { renderInBrowser } from '../support/harness.tsx'
import { waitForSettled } from '../support/settle.ts'

import type { ReactElement } from 'react'

const styled = { style: material2 } as const

const show = (ui: ReactElement, mode: 'light' | 'dark' = 'light') => renderInBrowser(ui, 'never', mode, styled)

const showDark = async (ui: ReactElement) => {
  show(ui, 'dark')
  await expect.poll(() => document.documentElement.dataset.theme).toBe('dark')
  await waitForSettled(() => document.body)
}

const px = (value: string) => parseFloat(value)

const options = [{ value: 'br', label: 'Brasil' }]

afterEach(() => {
  document.documentElement.removeAttribute('style')
})

describe('the buttons of the material2 style', () => {
  it.each([
    ['sm', 30, 10, 13, 4],
    ['md', 36, 16, 14, 4],
    ['lg', 42, 22, 15, 4]
  ] as const)('sizes the %s button at %ipx, with %ipx of inline padding, %ipx type and 4px corners, as MUI does', (size, height, padding, font, radius) => {
    show(<Button size={size}>Save</Button>)
    const button = style('button')

    expect(px(button.height)).toBe(height)
    expect(px(button.paddingLeft)).toBe(padding)
    expect(px(button.fontSize)).toBe(font)
    expect(px(button.borderTopLeftRadius)).toBe(radius)
  })

  it('writes the button label in upper case, with the letter-spacing and the medium weight of MUI', () => {
    show(<Button>Save</Button>)
    const button = style('button')

    expect(button.textTransform).toBe('uppercase')
    expect(px(button.letterSpacing)).toBeCloseTo(0.4, 1)
    expect(button.fontWeight).toBe('500')
  })

  it('holds the button to a minimum width of 64px, which the icon-only square still ignores', () => {
    show(
      <>
        <Button>Ok</Button>
        <Button iconOnly aria-label="Add">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" />
        </Button>
      </>
    )

    expect(part('button', 0).getBoundingClientRect().width).toBeGreaterThanOrEqual(64)
    expect(part('button', 1).getBoundingClientRect().width).toBe(36)
  })

  it('casts elevation 2 under the primary button and none under the others', () => {
    show(
      <>
        <Button variant="primary">Primary</Button>
        <Button variant="outline">Outline</Button>
      </>
    )

    expect(style('button', 0).boxShadow).toContain('rgba(0, 0, 0, 0.2) 0px 3px 1px -2px')
    expect(style('button', 1).boxShadow).toBe('none')
  })

  it('raises the primary button to elevation 4 under the pointer', async () => {
    show(<Button variant="primary">Primary</Button>)
    await userEvent.hover(part('button'))
    await waitForSettled(at('button'))

    expect(style('button').boxShadow).toContain('rgba(0, 0, 0, 0.2) 0px 2px 4px -1px')
  })

  it('draws the outline button border at 75% of the primary color in the light mode, strong enough for 3:1', () => {
    show(<Button variant="outline">Outline</Button>)
    const border = parseComputedColor(style('button').borderTopColor)

    expect([border.r, border.g, border.b, border.a]).toEqual([6, 108, 200, 0.75])
  })

  it('draws the outline button border at the literal 50% of the primary color in the dark mode, which already clears 3:1 there', async () => {
    await showDark(<Button variant="outline">Outline</Button>)
    const border = parseComputedColor(style('button').borderTopColor)

    expect([border.r, border.g, border.b, border.a]).toEqual([144, 202, 249, 0.5])
  })
})

describe('the fields of the material2 style', () => {
  it('sizes the field at 56px, the MUI normal height, with 14px of inline padding', () => {
    show(<Input label="Name" />)

    expect(part('input-field').getBoundingClientRect().height).toBe(56)
    expect(px(style('input-field').paddingLeft)).toBe(14)
  })

  it('rounds the outline at 4px', () => {
    show(<Input label="Name" />)

    expect(px(style('input-outline').borderTopLeftRadius)).toBe(4)
  })

  it('floats the label inside the field and shrinks it to 0.75 on focus, with the primary color', async () => {
    show(<Input label="Name" />)
    part('input-field').focus()
    await waitForSettled(at('input'))

    expect(part('input').dataset.labelPlacement).toBeUndefined()
    expect(style('input-label').color).toBe('rgb(6, 108, 200)')
    expect(style('input-label').transform).toContain('0.75')
  })

  it('thickens the outline border to 2px of the primary color on focus, the MUI notched-outline look', async () => {
    show(<Input label="Name" />)
    part('input-field').focus()
    await waitForSettled(at('input'))

    expect(style('input-outline').borderTopWidth).toBe('2px')
    expect(style('input-outline').borderTopColor).toBe('rgb(6, 108, 200)')
  })

  it('draws the resting border at 45% alpha, strong enough for 3:1 against the page', () => {
    show(<Input label="Name" />)

    expect(style('input-outline').borderTopColor).toBe('rgba(0, 0, 0, 0.45)')
  })

  it('shrinks the field to 40px in the compact density, the MUI "small" field', () => {
    document.documentElement.dataset.density = 'compact'
    show(<Input label="Name" />)

    expect(part('input-field').getBoundingClientRect().height).toBe(40)
    delete document.documentElement.dataset.density
  })

  it('sizes the select and the number input fields the same way as the input, since they share the hook', () => {
    show(
      <>
        <Select label="Country" options={options} />
        <NumberInput label="Amount" />
      </>
    )

    expect(part('select-field').getBoundingClientRect().height).toBe(56)
    expect(part('number-input-field').getBoundingClientRect().height).toBe(56)
  })

  it('sizes the textarea field with a minimum height of 56px too', () => {
    show(<Textarea label="Notes" />)

    expect(px(style('textarea-field').minHeight)).toBe(56)
  })
})
