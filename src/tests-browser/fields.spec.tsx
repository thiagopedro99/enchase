import { afterEach, describe, expect, it } from 'vitest'
import { exceptWebkit } from './browserSkips.ts'
import { page, userEvent } from 'vitest/browser'

import { Checkbox } from '@components/common/Checkbox/index.tsx'
import { Input } from '@components/common/Input/index.tsx'
import { Select } from '@components/common/Select/index.tsx'
import { renderInBrowser } from './harness.tsx'

const added: HTMLStyleElement[] = []

const addStyle = (css: string) => {
  const style = document.createElement('style')
  style.textContent = css
  document.head.prepend(style)
  added.push(style)
}

afterEach(() => {
  added.splice(0).forEach((style) => style.remove())
})

const slotOf = (name: string) => document.body.querySelector<HTMLElement>(`[data-slot="${name}"]`) as HTMLElement

const options = [
  { value: 'a', label: 'Alfa' },
  { value: 'b', label: 'Beta' }
]

describe('fields in a real browser', () => {
  it('lets the caller class win on layout even when its css loads before the library', () => {
    addStyle('.mine { block-size: 77px; padding-inline: 9px; } .outer { gap: 17px; }')
    renderInBrowser(<Input label="Nome" className="mine" wrapperClassName="outer" />)

    expect(getComputedStyle(slotOf('input-field')).height).toBe('77px')
    expect(getComputedStyle(slotOf('input-field')).paddingInlineStart).toBe('9px')
    expect(getComputedStyle(slotOf('input')).rowGap).toBe('17px')
  })

  exceptWebkit('webkitSelectPadding')('renders a correct input, select and checkbox with the global reset in place', () => {
    renderInBrowser(
      <>
        <Input label="Nome" />
        <Select label="País" options={options} />
        <Checkbox label="Aceito" />
      </>
    )

    expect(parseFloat(getComputedStyle(slotOf('input-field')).height)).toBeGreaterThanOrEqual(56)
    expect(parseFloat(getComputedStyle(slotOf('select-field')).height)).toBeGreaterThanOrEqual(56)
    expect(getComputedStyle(slotOf('input-field')).paddingInlineStart).not.toBe('0px')
    expect(getComputedStyle(slotOf('select-field')).paddingInlineStart).not.toBe('0px')
  })

  it('anchors the floating label to the end side in RTL and to the start side in LTR', async () => {
    renderInBrowser(
      <>
        <div dir="ltr" data-testid="ltr" style={{ inlineSize: 300 }}>
          <Input label="Nome" id="ltr-field" />
        </div>
        <div dir="rtl" data-testid="rtl" style={{ inlineSize: 300 }}>
          <Input label="Nome" id="rtl-field" />
        </div>
      </>
    )
    const edges = async (id: string, side: 'left' | 'right') => {
      const field = document.getElementById(id) as HTMLInputElement
      const control = field.parentElement as HTMLElement
      const label = control.querySelector<HTMLElement>('[data-slot="input-label"]') as HTMLElement
      const gap = (control.getBoundingClientRect()[side] - label.getBoundingClientRect()[side]) * (side === 'left' ? -1 : 1)
      const before = gap

      await userEvent.click(field)
      await expect.poll(() => new DOMMatrix(getComputedStyle(label).transform).a).toBeCloseTo(0.75, 2)
      const after = (control.getBoundingClientRect()[side] - label.getBoundingClientRect()[side]) * (side === 'left' ? -1 : 1)

      return { before, after }
    }
    const ltr = await edges('ltr-field', 'left')
    const rtl = await edges('rtl-field', 'right')

    expect(ltr.before).toBeGreaterThan(8)
    expect(Math.abs(ltr.after - ltr.before)).toBeLessThan(2)
    expect(rtl.before).toBeGreaterThan(8)
    expect(Math.abs(rtl.after - rtl.before)).toBeLessThan(2)
  })

  it('moves the select icon and the password toggle to the end side in RTL', () => {
    renderInBrowser(
      <div dir="rtl" style={{ inlineSize: 320 }}>
        <Select label="País" options={options} />
        <Input label="Senha" type="password" />
      </div>
    )
    const icon = slotOf('select-icon').getBoundingClientRect()
    const selectField = slotOf('select-field').getBoundingClientRect()
    const toggle = slotOf('input-toggle').getBoundingClientRect()
    const inputField = slotOf('input-field').getBoundingClientRect()

    expect(icon.left - selectField.left).toBeLessThan(selectField.right - icon.right)
    expect(toggle.left - inputField.left).toBeLessThan(inputField.right - toggle.right)
  })

  it('shows a focus ring on the outline, the toggle and the checkbox when reached by keyboard', async () => {
    renderInBrowser(
      <>
        <Input label="Senha" type="password" />
        <Checkbox label="Aceito" />
      </>
    )

    await userEvent.tab()
    expect(getComputedStyle(slotOf('input-outline')).borderTopWidth).toBe('2px')

    await userEvent.tab()
    expect(getComputedStyle(slotOf('input-toggle')).outlineStyle).toBe('solid')

    await userEvent.tab()
    expect(getComputedStyle(slotOf('checkbox-box')).outlineStyle).toBe('solid')
  })

  it('keeps every interactive target at least 24 by 24 px', () => {
    renderInBrowser(
      <>
        <Input label="Senha" type="password" />
        <Select label="País" options={options} />
        <Checkbox label="Aceito" />
        <Checkbox aria-label="Sem rótulo" />
      </>
    )
    const targets = [slotOf('input-field'), slotOf('input-toggle'), slotOf('select-field'), ...document.body.querySelectorAll<HTMLElement>('[data-slot="checkbox"]')]

    for (const target of targets) {
      const rect = target.getBoundingClientRect()

      expect(rect.width, target.dataset.slot).toBeGreaterThanOrEqual(24)
      expect(rect.height, target.dataset.slot).toBeGreaterThanOrEqual(24)
    }
  })

  it('lets the visible input take the label text as its name', () => {
    renderInBrowser(<Input label="Nome" />)

    expect(page.getByLabelText('Nome').element()).toBe(slotOf('input-field'))
  })
})
