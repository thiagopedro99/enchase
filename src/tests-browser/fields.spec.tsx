import { afterEach, describe, expect, it } from 'vitest'
import { unlessWebkit } from './browserSkips.ts'
import { page, userEvent } from 'vitest/browser'

import { Checkbox } from '@components/common/Checkbox/index.tsx'
import { Input } from '@components/common/Input/index.tsx'
import { Textarea } from '@components/common/Textarea/index.tsx'
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

  it('renders a correct input, select and checkbox with the global reset in place', () => {
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
    if (unlessWebkit('webkitSelectPadding')) expect(getComputedStyle(slotOf('select-field')).paddingInlineStart).not.toBe('0px')
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

describe('textarea in a real browser', () => {
  it('lets the caller class win on layout even when its css loads before the library', () => {
    addStyle('.mine { min-block-size: 123px; padding-inline: 9px; } .outer { gap: 17px; }')
    renderInBrowser(<Textarea label="Mensagem" className="mine" wrapperClassName="outer" />)

    expect(getComputedStyle(slotOf('textarea-field')).minHeight).toBe('123px')
    expect(getComputedStyle(slotOf('textarea-field')).paddingInlineStart).toBe('9px')
    expect(getComputedStyle(slotOf('textarea')).rowGap).toBe('17px')
  })

  it('is taller than a single line field and grows with the rows', () => {
    renderInBrowser(
      <>
        <Input label="Linha" />
        <Textarea label="Curto" rows={3} />
        <Textarea label="Longo" rows={8} />
      </>
    )
    const height = (element: HTMLElement) => element.getBoundingClientRect().height

    expect(height(page.getByLabelText('Curto').element() as HTMLElement)).toBeGreaterThan(height(slotOf('input-field')) * 1.5)
    expect(height(page.getByLabelText('Longo').element() as HTMLElement)).toBeGreaterThan(height(page.getByLabelText('Curto').element() as HTMLElement) + 80)
    expect(getComputedStyle(page.getByLabelText('Curto').element()).paddingInlineStart).not.toBe('0px')
  })

  it('floats the label onto the top border and keeps it on the start side in LTR and on the end side in RTL', async () => {
    renderInBrowser(
      <>
        <div dir="ltr" style={{ inlineSize: 300 }}>
          <Textarea label="Mensagem" id="ltr-area" />
        </div>
        <div dir="rtl" style={{ inlineSize: 300 }}>
          <Textarea label="Mensagem" id="rtl-area" />
        </div>
      </>
    )
    const measure = async (id: string, side: 'left' | 'right') => {
      const field = document.getElementById(id) as HTMLTextAreaElement
      const control = field.parentElement as HTMLElement
      const label = control.querySelector<HTMLElement>('[data-slot="textarea-label"]') as HTMLElement
      const edge = () => (control.getBoundingClientRect()[side] - label.getBoundingClientRect()[side]) * (side === 'left' ? -1 : 1)
      const centerY = () => label.getBoundingClientRect().top + label.getBoundingClientRect().height / 2 - control.getBoundingClientRect().top
      const resting = { edge: edge(), centerY: centerY() }

      await userEvent.click(field)
      await expect.poll(() => new DOMMatrix(getComputedStyle(label).transform).a).toBeCloseTo(0.75, 2)

      return { resting, floated: { edge: edge(), centerY: centerY() } }
    }
    const ltr = await measure('ltr-area', 'left')
    const rtl = await measure('rtl-area', 'right')

    for (const result of [ltr, rtl]) {
      expect(result.resting.edge).toBeGreaterThan(8)
      expect(Math.abs(result.floated.edge - result.resting.edge)).toBeLessThan(2)
      expect(result.resting.centerY).toBeGreaterThan(20)
      expect(Math.abs(result.floated.centerY)).toBeLessThan(1.5)
    }
  })

  it('resizes vertically by default and follows the resize prop', () => {
    renderInBrowser(
      <>
        <Textarea label="Padrão" />
        <Textarea label="Nenhum" resize="none" />
        <Textarea label="Horizontal" resize="horizontal" />
        <Textarea label="Ambos" resize="both" />
      </>
    )
    const resizeOf = (name: string) => getComputedStyle(page.getByLabelText(name).element()).resize

    expect(resizeOf('Padrão')).toBe('vertical')
    expect(resizeOf('Nenhum')).toBe('none')
    expect(resizeOf('Horizontal')).toBe('horizontal')
    expect(resizeOf('Ambos')).toBe('both')
  })

  it('hides scrolled text behind the floating label only when the field has a label', () => {
    renderInBrowser(
      <>
        <Textarea label="Com rótulo" />
        <Textarea aria-label="Sem rótulo" />
      </>
    )
    const maskOf = (name: string) => {
      const style = getComputedStyle(page.getByLabelText(name).element())

      return style.maskImage || style.getPropertyValue('-webkit-mask-image')
    }

    expect(maskOf('Com rótulo')).toContain('gradient')
    expect(['', 'none']).toContain(maskOf('Sem rótulo'))
  })

  it('shows a focus ring on the outline when reached by keyboard', async () => {
    renderInBrowser(<Textarea label="Mensagem" />)

    await userEvent.tab()

    expect(getComputedStyle(slotOf('textarea-outline')).borderTopWidth).toBe('2px')
  })

  it('keeps the field at least 24 by 24 px and lets the visible textarea take the label text as its name', () => {
    renderInBrowser(<Textarea label="Mensagem" />)
    const rect = slotOf('textarea-field').getBoundingClientRect()

    expect(rect.width).toBeGreaterThanOrEqual(24)
    expect(rect.height).toBeGreaterThanOrEqual(24)
    expect(page.getByLabelText('Mensagem').element()).toBe(slotOf('textarea-field'))
  })
})
