import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'

import { NumberInput } from '@components/common/NumberInput/index.tsx'
import { ButtonLink } from '@components/common/ButtonLink/index.tsx'
import { DatePicker } from '@components/common/DatePicker/index.tsx'
import { Combobox } from '@components/common/Combobox/index.tsx'
import { Textarea } from '@components/common/Textarea/index.tsx'
import { Button } from '@components/common/Button/index.tsx'
import { Select } from '@components/common/Select/index.tsx'
import { at, part, style } from '../support/hookProbes.ts'
import { Input } from '@components/common/Input/index.tsx'
import { workbench } from '@styles/presets/workbench.ts'
import { parseComputedColor } from '../support/color.ts'
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

const alphaOf = (value: string) => parseComputedColor(value).a

const spreadOf = (shadow: string) => Number([...shadow.matchAll(/(-?[0-9]*\.?[0-9]+)px/g)][3]?.[1])

const options = [
  { value: 'br', label: 'Brasil' },
  { value: 'pt', label: 'Portugal' }
]

const icon = <svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" />

const fields = [
  { name: 'input', ui: <Input label="Name" />, slot: 'input', control: 'input-field' },
  { name: 'number input', ui: <NumberInput label="Amount" />, slot: 'number-input', control: 'number-input-field' },
  { name: 'select', ui: <Select label="Country" options={options} />, slot: 'select', control: 'select-field' },
  { name: 'combobox', ui: <Combobox label="Fruit" options={options} />, slot: 'combobox', control: 'combobox-input' },
  { name: 'date picker', ui: <DatePicker label="Date" />, slot: 'date-picker', control: 'date-picker-input' },
  { name: 'textarea', ui: <Textarea label="Notes" />, slot: 'textarea', control: 'textarea-field' }
]

afterEach(() => {
  document.documentElement.removeAttribute('style')
})

describe('the buttons of the workbench style', () => {
  it.each([
    ['sm', 24, 7, 14, 4],
    ['md', 32, 15, 14, 6],
    ['lg', 40, 15, 16, 8]
  ] as const)('sizes the %s button at %ipx with %ipx of inline padding, no block padding, %ipx type and %ipx corners, all in regular weight', (size, height, padding, font, radius) => {
    show(<Button size={size}>Save</Button>)
    const button = style('button')

    expect(px(button.height)).toBe(height)
    expect(px(button.paddingLeft)).toBe(padding)
    expect(px(button.paddingRight)).toBe(padding)
    expect(px(button.paddingTop)).toBe(0)
    expect(px(button.paddingBottom)).toBe(0)
    expect(button.borderTopWidth).toBe('1px')
    expect(px(button.fontSize)).toBe(font)
    expect(button.fontWeight).toBe('400')
    expect(px(button.borderTopLeftRadius)).toBe(radius)
  })

  it('sizes the link button like the button, because both read the same hooks', () => {
    show(
      <ButtonLink href="/start" size="lg">
        Start
      </ButtonLink>
    )
    const link = style('button-link')

    expect(px(link.height)).toBe(40)
    expect(px(link.paddingLeft)).toBe(15)
    expect(px(link.fontSize)).toBe(16)
    expect(link.fontWeight).toBe('400')
    expect(px(link.borderTopLeftRadius)).toBe(8)
  })

  it.each([
    ['sm', 24],
    ['md', 32],
    ['lg', 40]
  ] as const)('makes the %s icon button a square of %ipx, with no padding hook of its own', (size, side) => {
    show(
      <Button iconOnly size={size} aria-label="Add">
        {icon}
      </Button>
    )
    const box = part('button').getBoundingClientRect()

    expect([box.width, box.height]).toEqual([side, side])
  })

  it('paints the four variants in the light colors, with the primary blue #0958D9 where the original #1677FF holds 4.10:1 against its white text', () => {
    show(
      <>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
      </>
    )

    expect(style('button', 0).backgroundColor).toBe('rgb(9, 88, 217)')
    expect(style('button', 0).color).toBe('rgb(255, 255, 255)')
    expect(style('button', 1).backgroundColor).toBe('rgb(230, 244, 255)')
    expect(style('button', 2).backgroundColor).toBe('rgb(255, 255, 255)')
    expect(style('button', 3).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(style('button', 4).backgroundColor).toBe('rgb(207, 19, 34)')
    expect(style('button', 4).color).toBe('rgb(255, 255, 255)')
  })

  it('draws the outline button on a white fill with the strong border color, where the original #D9D9D9 holds 1.41:1 against the page', () => {
    show(<Button variant="outline">Outline</Button>)
    const button = style('button')

    expect(button.backgroundColor).toBe('rgb(255, 255, 255)')
    expect(button.borderTopColor).toBe('rgba(0, 0, 0, 0.45)')
    expect(button.borderTopWidth).toBe('1px')
  })

  it('puts the decorative 2px shadow under the primary and the outline buttons in the light mode, and none under the others', () => {
    show(
      <>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
      </>
    )

    expect(style('button', 0).boxShadow).toBe('rgba(5, 145, 255, 0.1) 0px 2px 0px 0px')
    expect(style('button', 1).boxShadow).toBe('none')
    expect(style('button', 2).boxShadow).toBe('rgba(0, 0, 0, 0.02) 0px 2px 0px 0px')
    expect(style('button', 3).boxShadow).toBe('none')
    expect(style('button', 4).boxShadow).toBe('none')
  })

  it('keeps the shadow of the primary button when the pointer is over it', async () => {
    show(<Button variant="primary">Primary</Button>)
    await userEvent.hover(part('button'))
    await waitForSettled(at('button'))

    expect(style('button').boxShadow).toBe('rgba(5, 145, 255, 0.1) 0px 2px 0px 0px')
  })

  it('paints the primary button light blue with dark text in the dark mode, with no decorative shadow', async () => {
    await showDark(
      <>
        <Button variant="primary">Primary</Button>
        <Button variant="outline">Outline</Button>
      </>
    )

    expect(style('button', 0).backgroundColor).toBe('rgb(101, 169, 243)')
    expect(style('button', 0).color).toBe('rgb(20, 20, 20)')
    expect(style('button', 0).boxShadow).toBe('none')
    expect(style('button', 1).backgroundColor).toBe('rgb(20, 20, 20)')
    expect(style('button', 1).boxShadow).toBe('none')
  })

  it('puts the small shadow of the dark mode under the hovered primary button, because the decorative shadow is only for the light mode', async () => {
    await showDark(<Button variant="primary">Primary</Button>)
    await userEvent.hover(part('button'))
    await waitForSettled(at('button'))

    expect(style('button').boxShadow).toBe('rgba(0, 0, 0, 0.5) 0px 1px 2px 0px, rgba(0, 0, 0, 0.3) 0px 1px 3px 1px')
  })

  it('gives the ghost button 15px of inline padding at every size, where the original small button has 7px, because the hook of the ghost padding has no size', () => {
    show(
      <>
        <Button variant="ghost" size="sm">
          Ghost
        </Button>
        <Button variant="ghost" size="md">
          Ghost
        </Button>
        <Button variant="ghost" size="lg">
          Ghost
        </Button>
      </>
    )

    expect([0, 1, 2].map((index) => px(style('button', index).paddingLeft))).toEqual([15, 15, 15])
  })

  it('lets the shape of the caller reshape the three sizes through the radius scale, which the soft shape sets to 6px, 10px and 14px', () => {
    renderInBrowser(
      <>
        <Button size="sm">Save</Button>
        <Button size="md">Save</Button>
        <Button size="lg">Save</Button>
      </>,
      'never',
      'light',
      { style: workbench, shape: 'soft' }
    )

    expect([0, 1, 2].map((index) => px(style('button', index).borderTopLeftRadius))).toEqual([6, 10, 14])
  })
})

describe('the fields of the workbench style', () => {
  it.each(fields)(
    'sizes the $name at 32px with 14px regular type and 12px of inline inset, which is the 11px padding and the 1px border of the original, as the contour is a fieldset of its own',
    ({ ui, slot, control }) => {
      show(ui)
      const field = style(control)
      const inset = slot === 'combobox' ? style('combobox-control') : field

      if (slot === 'textarea') expect(px(field.minHeight)).toBe(32)
      else expect(px(style(`${slot}-control`).height)).toBe(32)

      expect(px(inset.paddingLeft)).toBe(12)
      expect(px(field.fontSize)).toBe(14)
      expect(field.fontWeight).toBe('400')
    }
  )

  it('puts 5px above the text of the textarea, which is the 4px padding and the 1px border of the original', () => {
    show(<Textarea label="Notes" />)

    expect(px(style('textarea-field').paddingTop)).toBe(5)
    expect(px(style('textarea-field').paddingBottom)).toBe(5)
  })

  it.each(fields)('rounds the contour of the $name at 6px with a 1px border in the strong border color, where the original #D9D9D9 holds 1.41:1 against the page', ({ ui, slot }) => {
    show(ui)
    const outline = style(`${slot}-outline`)

    expect(px(outline.borderTopLeftRadius)).toBe(6)
    expect(outline.borderTopWidth).toBe('1px')
    expect(outline.borderTopColor).toBe('rgba(0, 0, 0, 0.45)')
  })

  it.each(fields)('puts the label of the $name above the field in 14px regular type, 8px from it', ({ ui, slot }) => {
    show(ui)
    const label = part(`${slot}-label`)

    expect(part(slot).dataset.labelPlacement).toBe('stacked')
    expect(px(getComputedStyle(label).fontSize)).toBe(14)
    expect(getComputedStyle(label).fontWeight).toBe('400')
    expect(getComputedStyle(label).position).toBe('static')
    expect(Math.round(part(`${slot}-control`).getBoundingClientRect().top - label.getBoundingClientRect().bottom)).toBe(8)
  })

  it('puts the label at the start in a column of 8rem, aligned to the end and to the middle of the control', () => {
    show(<Input label="Name" labelPlacement="start" />)
    const label = part('input-label').getBoundingClientRect()
    const control = part('input-control').getBoundingClientRect()

    expect(style('input-label').textAlign).toBe('end')
    expect(label.width).toBe(128)
    expect(Math.abs(label.top + label.height / 2 - (control.top + control.height / 2))).toBeLessThan(1)
    expect(control.left - label.right).toBe(16)
  })

  it('paints the mark of a required field in the error color, 4px after the text', () => {
    show(<Input label="Name" required />)

    expect(style('input-required').color).toBe('rgb(207, 19, 34)')
    expect(style('input-required').marginLeft).toBe('4px')
  })

  it('moves the border to the primary color when the pointer is over the field, as the original does with its own blue', async () => {
    show(<Input label="Name" />)
    await userEvent.hover(part('input-field'))
    await waitForSettled(at('input'))

    expect(style('input-outline').borderTopColor).toBe('rgb(9, 88, 217)')
    expect(style('input-outline').borderTopWidth).toBe('1px')
  })

  it('draws the focus as a 1px primary border with a 2px ring of 10% of the primary color, which the original draws at 10% of #0591FF', async () => {
    show(<Input label="Name" />)
    part('input-field').focus()
    await waitForSettled(at('input'))
    const outline = style('input-outline')

    expect(outline.borderTopColor).toBe('rgb(9, 88, 217)')
    expect(outline.borderTopWidth).toBe('1px')
    expect(spreadOf(outline.boxShadow)).toBe(2)
    expect(alphaOf(outline.boxShadow.split(' 0px')[0] as string)).toBeCloseTo(0.1, 2)
  })

  it('draws the ring of the focus at 31% of the primary color in the dark mode', async () => {
    await showDark(<Input label="Name" />)
    part('input-field').focus()
    await waitForSettled(at('input'))
    const outline = style('input-outline')

    expect(outline.borderTopColor).toBe('rgb(101, 169, 243)')
    expect(spreadOf(outline.boxShadow)).toBe(2)
    expect(alphaOf(outline.boxShadow.split(' 0px')[0] as string)).toBeCloseTo(0.31, 2)
  })

  it('keeps the error color on the border, on hover and on the label, where the original softens the hovered red to #FFA39E', async () => {
    show(<Input label="Name" error="Wrong" />)
    await userEvent.hover(part('input-field'))
    await waitForSettled(at('input'))

    expect(style('input-outline').borderTopColor).toBe('rgb(207, 19, 34)')
    expect(style('input-label').color).toBe('rgb(207, 19, 34)')
  })

  it('fills the disabled field with 4% of the text color and keeps its text at the disabled opacity', () => {
    show(<Input label="Name" disabled />)

    expect(alphaOf(style('input-field').backgroundColor)).toBeCloseTo(0.0352, 3)
    expect(style('input-field').color).toBe('rgba(0, 0, 0, 0.38)')
  })

  it('fills the filled variant in #F5F5F5, #F0F0F0 under the pointer and white in focus, which the original makes with 4%, 6% and white', async () => {
    show(<Input label="Name" variant="filled" />)

    expect(style('input-field').backgroundColor).toBe('rgb(245, 245, 245)')
    await userEvent.hover(part('input-field'))
    await waitForSettled(at('input'))
    expect(style('input-field').backgroundColor).toBe('rgb(240, 240, 240)')
    part('input-field').focus()
    await waitForSettled(at('input'))
    expect(style('input-field').backgroundColor).toBe('rgb(255, 255, 255)')
  })

  it('fills the disabled filled variant with 4% of the text color, as the original does', () => {
    show(<Input label="Name" variant="filled" disabled />)

    expect(alphaOf(style('input-field').backgroundColor)).toBeCloseTo(0.0352, 3)
  })

  it('draws the contour in the strong border color of the dark mode and the error and its mark in the light red of the dark mode', async () => {
    await showDark(
      <>
        <Input label="Name" />
        <Input label="Email" error="Wrong" required />
      </>
    )

    expect(style('input-outline', 0).borderTopColor).toBe('rgba(255, 255, 255, 0.45)')
    expect(style('input-outline', 1).borderTopColor).toBe('rgb(243, 156, 151)')
    expect(style('input-required').color).toBe('rgb(243, 156, 151)')
  })

  it('fills the filled variant in the second surface, the third under the pointer and the page surface in focus in the dark mode', async () => {
    await showDark(<Input label="Name" variant="filled" />)

    expect(style('input-field').backgroundColor).toBe('rgb(39, 39, 39)')
    await userEvent.hover(part('input-field'))
    await waitForSettled(at('input'))
    expect(style('input-field').backgroundColor).toBe('rgb(48, 48, 48)')
    part('input-field').focus()
    await waitForSettled(at('input'))
    expect(style('input-field').backgroundColor).toBe('rgb(20, 20, 20)')
  })
})

describe('the list of the select in the workbench style', () => {
  const baseSelect = CSS.supports('appearance', 'base-select')

  const field = () => document.querySelector('select') as HTMLSelectElement

  it.runIf(baseSelect)('pads the list by 4px, rounds it at 8px, sets it 4px from the field and fills it in white, with the popup shadow', () => {
    show(<Select label="Country" options={options} />)
    const picker = getComputedStyle(field(), '::picker(select)')

    expect(px(picker.paddingTop)).toBe(4)
    expect(px(picker.borderTopLeftRadius)).toBe(8)
    expect(px(picker.marginTop)).toBe(4)
    expect(picker.backgroundColor).toBe('rgb(255, 255, 255)')
    expect(picker.boxShadow).toBe('rgba(0, 0, 0, 0.08) 0px 6px 16px 0px, rgba(0, 0, 0, 0.12) 0px 3px 6px -4px, rgba(0, 0, 0, 0.05) 0px 9px 28px 8px')
  })

  it.runIf(baseSelect)('fills the list of the dark mode in #1F1F1F, the elevated surface of the original', async () => {
    await showDark(<Select label="Country" options={options} />)

    expect(getComputedStyle(field(), '::picker(select)').backgroundColor).toBe('rgb(31, 31, 31)')
  })

  it.runIf(baseSelect)('gives the option 5px by 12px of padding, which with the 22px line make the 32px of the original, and 4px corners', () => {
    show(<Select label="Country" options={options} defaultValue="pt" />)
    const option = getComputedStyle(field().querySelectorAll('option')[0] as HTMLElement)

    expect([px(option.paddingTop), px(option.paddingBottom), px(option.paddingLeft), px(option.paddingRight)]).toEqual([5, 5, 12, 12])
    expect(px(option.borderTopLeftRadius)).toBe(4)
    expect(px(option.fontSize)).toBe(14)
    expect(px(option.lineHeight)).toBeCloseTo(22, 0)
    expect(option.fontWeight).toBe('400')
  })

  it.runIf(baseSelect)('paints the chosen option in the primary container with 600 weight and the text color, where the original paints #BAE0FF', () => {
    show(<Select label="Country" options={options} defaultValue="pt" />)
    const chosen = getComputedStyle(field().querySelector('option:checked') as HTMLElement)

    expect(chosen.backgroundColor).toBe('rgb(230, 244, 255)')
    expect(chosen.fontWeight).toBe('600')
    expect(chosen.color).toBe('rgba(0, 0, 0, 0.88)')
  })

  it.runIf(baseSelect)('paints the chosen option in the dark primary container with the text color of the dark mode', async () => {
    await showDark(<Select label="Country" options={options} defaultValue="pt" />)
    const chosen = getComputedStyle(field().querySelector('option:checked') as HTMLElement)

    expect(chosen.backgroundColor).toBe('rgb(21, 50, 91)')
    expect(chosen.color).toBe('rgba(255, 255, 255, 0.85)')
  })
})

describe('the list of the combobox in the workbench style', () => {
  const opened = async () => {
    show(<Combobox label="Fruit" options={options} defaultValue="pt" defaultOpen />)
    await waitForSettled(() => part('combobox-listbox'))
  }

  it('pads the list by 4px and rounds it at 8px', async () => {
    await opened()
    const list = style('combobox-listbox')

    expect([px(list.paddingTop), px(list.paddingLeft)]).toEqual([4, 4])
    expect(px(list.borderTopLeftRadius)).toBe(8)
  })

  it('makes the option 32px high with 5px by 12px of padding, 14px type and 4px corners', async () => {
    await opened()
    const option = style('combobox-option', 0)

    expect(part('combobox-option', 0).getBoundingClientRect().height).toBe(32)
    expect([px(option.paddingTop), px(option.paddingBottom)]).toEqual([5, 5])
    expect(px(option.paddingLeft)).toBe(12)
    expect(px(option.paddingRight)).toBe(12)
    expect(px(option.fontSize)).toBe(14)
    expect(px(option.borderTopLeftRadius)).toBe(4)
    expect(option.fontWeight).toBe('400')
  })

  it('writes the chosen option in 600 weight', async () => {
    await opened()

    expect(style('combobox-option', 1).fontWeight).toBe('600')
  })
})

describe('the calendar of the date picker in the workbench style', () => {
  const opened = async () => {
    show(<DatePicker label="Date" defaultValue="2026-10-15" defaultOpen />)
    await waitForSettled(() => part('date-picker-calendar'))
  }

  it('sizes the day at 36px with 4px corners and 14px regular type, with no hook for the 24px core of the original', async () => {
    await opened()
    const day = part('date-picker-calendar-day-number').getBoundingClientRect()

    expect([day.width, day.height]).toEqual([36, 36])
    expect(px(style('date-picker-calendar-day-number').borderTopLeftRadius)).toBe(4)
    expect(px(style('date-picker-calendar-day-number').fontSize)).toBe(14)
    expect(style('date-picker-calendar-day-number').fontWeight).toBe('400')
  })

  it('draws a 1px line in the border color under the header, as the original does', async () => {
    await opened()
    const header = style('date-picker-calendar-header')

    expect(header.borderBottomWidth).toBe('1px')
    expect(header.borderBottomStyle).toBe('solid')
    expect(header.borderBottomColor).toBe('rgb(240, 240, 240)')
  })

  it('writes the title of the month in 600 weight and the weekdays in regular weight', async () => {
    await opened()

    expect(style('date-picker-calendar-title').fontWeight).toBe('600')
    expect(px(style('date-picker-calendar-title').fontSize)).toBe(14)
    expect(style('date-picker-calendar-weekday').fontWeight).toBe('400')
    expect(px(style('date-picker-calendar-weekday').fontSize)).toBe(14)
  })
})
