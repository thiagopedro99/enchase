import { useState } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { contrastRatio } from '@styles/theme/contrast.ts'
import { NumberInput } from '@components/common/NumberInput/index.tsx'
import { renderInBrowser } from '../../../support/harness.tsx'
import { setForcedColors } from '../../../support/media.ts'
import { unlessWebkit } from '../../../support/browserSkips.ts'
import { waitForSettled } from '../../../support/settle.ts'

const surfaces = ['surface', 'background', 'surface-container-high'] as const

const added: HTMLStyleElement[] = []

const addStyle = (css: string) => {
  const style = document.createElement('style')
  style.textContent = css
  document.head.prepend(style)
  added.push(style)
}

afterEach(async () => {
  added.splice(0).forEach((style) => style.remove())
  await setForcedColors('none')
})

const part = (name: string, index = 0) => document.body.querySelectorAll<HTMLElement>(`[data-slot="number-input-${name}"]`)[index]

const input = (index = 0) => document.body.querySelectorAll<HTMLInputElement>('input[role="spinbutton"]')[index]

const surface = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(`--enchase-color-${name}`).trim()

const rect = (element: Element) => element.getBoundingClientRect()

const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds))

const press = (button: Element, type: string, extra: PointerEventInit = {}) => button.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, button: 0, pointerType: 'mouse', isPrimary: true, ...extra }))

const caret = () => [input().selectionStart, input().selectionEnd]

const Controlled = () => {
  const [value, setValue] = useState<number | null>(4)

  return (
    <>
      <NumberInput label="Quantidade" min={0} max={20} value={value} onValueChange={setValue} />
      <output data-testid="value">{value === null ? 'null' : value}</output>
      <button type="button">depois</button>
    </>
  )
}

describe('NumberInput semantics in a real browser', () => {
  it('is a spinbutton named by its label, with the range and the formatted value', () => {
    renderInBrowser(<NumberInput label="Preço" min={0} max={5000} defaultValue={1234.5} />)
    const field = page.getByRole('spinbutton', { name: 'Preço' })

    expect(field.element()).toBe(input())
    expect(input().getAttribute('aria-valuemin')).toBe('0')
    expect(input().getAttribute('aria-valuemax')).toBe('5000')
    expect(input().getAttribute('aria-valuenow')).toBe('1234.5')
    expect(input().getAttribute('aria-valuetext')).toBe('1.234,5')
    expect(input().value).toBe('1.234,5')
  })

  it('names the two buttons from the labels of the provider and keeps them out of the tab order', async () => {
    renderInBrowser(
      <>
        <NumberInput label="Quantidade" defaultValue={2} />
        <button type="button">depois</button>
      </>
    )

    expect(page.getByRole('button', { name: 'Aumentar valor' }).element()).toBe(part('increase'))
    expect(page.getByRole('button', { name: 'Diminuir valor' }).element()).toBe(part('decrease'))

    await userEvent.tab()
    expect(document.activeElement).toBe(input())
    await userEvent.tab()
    expect(document.activeElement).toBe(page.getByRole('button', { name: 'depois' }).element())
    await userEvent.tab({ shift: true })
    expect(document.activeElement).toBe(input())
  })
})

describe('NumberInput typing in a real browser', () => {
  it('refuses letters and symbols as they are typed', async () => {
    renderInBrowser(<NumberInput label="Preço" />)

    await userEvent.click(input())
    await userEvent.keyboard('a1b2,c3-+e*')

    expect(input().value).toBe('12,3')
  })

  it('keeps the caret where it was when a character is refused, and moves it past one that is accepted', async () => {
    renderInBrowser(<NumberInput label="Preço" defaultValue={123} />)

    input().focus()
    input().setSelectionRange(1, 1)
    await userEvent.keyboard('x')

    expect(input().value).toBe('123')
    expect(caret()).toEqual([1, 1])

    await userEvent.keyboard('9')

    expect(input().value).toBe('1923')
    expect(caret()).toEqual([2, 2])
  })

  it('types over a selection, deletes and replaces everything', async () => {
    renderInBrowser(<NumberInput label="Preço" defaultValue={12345} formatOptions={{ useGrouping: false }} />)

    input().focus()
    input().setSelectionRange(1, 3)
    await userEvent.keyboard('9')
    expect(input().value).toBe('1945')

    await userEvent.keyboard('{Backspace}{Backspace}')
    expect(input().value).toBe('45')

    input().select()
    await userEvent.keyboard('7')
    expect(input().value).toBe('7')
  })

  it('formats what was typed when the field loses the focus and reports it once', async () => {
    renderInBrowser(<Controlled />)

    await userEvent.click(input())
    await userEvent.fill(input(), '')
    await userEvent.keyboard('15')

    expect(page.getByTestId('value').element().textContent).toBe('4')

    await userEvent.tab()

    expect(page.getByTestId('value').element().textContent).toBe('15')
    expect(input().value).toBe('15')
  })

  it('formats with the grouping and the decimal mark of the language on blur and on Enter', async () => {
    renderInBrowser(<NumberInput label="Preço" />)

    await userEvent.click(input())
    await userEvent.keyboard('1234,5')
    expect(input().value).toBe('1234,5')
    await userEvent.keyboard('{Enter}')

    expect(input().value).toBe('1.234,5')
    expect(document.activeElement).toBe(input())
    expect(input().getAttribute('aria-valuenow')).toBe('1234.5')
  })

  it('formats a currency and a percentage with the symbols of the language', async () => {
    renderInBrowser(
      <>
        <NumberInput label="Preço" formatOptions={{ style: 'currency', currency: 'BRL' }} />
        <NumberInput label="Desconto" step={0.01} formatOptions={{ style: 'percent', maximumFractionDigits: 1 }} />
        <button type="button">depois</button>
      </>
    )

    await userEvent.click(input(0))
    await userEvent.keyboard('1234,5')
    await userEvent.tab()
    expect(input(0).value).toBe('R$ 1.234,50')

    await userEvent.click(input(1))
    await userEvent.keyboard('12,5')
    await userEvent.tab()
    expect(input(1).value).toBe('12,5%')
    expect(input(1).getAttribute('aria-valuenow')).toBe('0.125')
  })

  it('ignores a value that is not a number when it is put in at once', async () => {
    renderInBrowser(<NumberInput label="Preço" defaultValue={7} />)

    await userEvent.fill(input(), 'abc')

    expect(input().value).toBe('7')
  })

  it('clamps to the limits when the field loses the focus', async () => {
    renderInBrowser(<Controlled />)

    await userEvent.click(input())
    await userEvent.fill(input(), '150')
    await userEvent.tab()

    expect(page.getByTestId('value').element().textContent).toBe('20')
    expect(input().value).toBe('20')
  })
})

describe('NumberInput keyboard in a real browser', () => {
  it('steps with the arrows and the Page keys, and jumps with Home and End', async () => {
    renderInBrowser(<NumberInput label="Quantidade" defaultValue={50} min={0} max={99} />)

    await userEvent.click(input())
    await userEvent.keyboard('{ArrowUp}{ArrowUp}')
    expect(input().value).toBe('52')
    await userEvent.keyboard('{ArrowDown}')
    expect(input().value).toBe('51')
    await userEvent.keyboard('{Shift>}{ArrowUp}{/Shift}')
    expect(input().value).toBe('60')
    await userEvent.keyboard('{PageDown}')
    expect(input().value).toBe('50')
    await userEvent.keyboard('{End}')
    expect(input().value).toBe('99')
    await userEvent.keyboard('{Home}')
    expect(input().value).toBe('0')
  })

  it('leaves Home and End to the caret when there are no limits', async () => {
    renderInBrowser(<NumberInput label="Quantidade" defaultValue={12345} formatOptions={{ useGrouping: false }} />)

    input().focus()
    input().setSelectionRange(2, 2)
    await userEvent.keyboard('{Home}')
    expect(caret()).toEqual([0, 0])
    await userEvent.keyboard('{End}')
    expect(caret()).toEqual([5, 5])
    expect(input().value).toBe('12345')
  })

  it('does not step when the field is read only', async () => {
    renderInBrowser(<NumberInput label="Quantidade" defaultValue={5} readOnly />)

    await userEvent.click(input())
    await userEvent.keyboard('{ArrowUp}{PageUp}')

    expect(input().value).toBe('5')
  })
})

describe('NumberInput buttons in a real browser', () => {
  it('step once per click and keep the focus in the field', async () => {
    renderInBrowser(<Controlled />)

    await userEvent.click(input())
    await userEvent.click(part('increase'))
    await userEvent.click(part('increase'))
    await userEvent.click(part('decrease'))

    expect(page.getByTestId('value').element().textContent).toBe('5')
    expect(document.activeElement).toBe(input())
  })

  it('do not take the focus when the field was not focused', async () => {
    renderInBrowser(<NumberInput label="Quantidade" defaultValue={5} />)

    await userEvent.click(part('increase'))

    expect(input().value).toBe('6')
    expect(document.activeElement).not.toBe(part('increase'))
    expect(document.activeElement).not.toBe(input())
  })

  it('repeat while held, stop on release, and stop at the limit', async () => {
    renderInBrowser(<NumberInput label="Quantidade" defaultValue={0} min={0} max={30} />)

    press(part('increase'), 'pointerdown')
    await wait(50)
    expect(input().value).toBe('1')
    await wait(250)
    expect(input().value).toBe('1')
    await wait(1100)
    press(part('increase'), 'pointerup')

    const released = Number(input().value)

    expect(released).toBeGreaterThan(8)
    expect(released).toBeLessThanOrEqual(20)
    await wait(500)
    expect(Number(input().value)).toBe(released)

    press(part('increase'), 'pointerdown')
    await wait(400 + 60 * 40)

    expect(input().value).toBe('30')
    expect((part('increase') as HTMLButtonElement).disabled).toBe(true)
    press(part('increase'), 'pointerup')
  })

  it('stop repeating when the pointer leaves the button', async () => {
    renderInBrowser(<NumberInput label="Quantidade" defaultValue={0} />)

    await userEvent.hover(part('increase'))
    press(part('increase'), 'pointerdown')
    await wait(700)
    await userEvent.hover(input())

    const left = Number(input().value)

    expect(left).toBeGreaterThan(1)
    await wait(500)
    expect(Number(input().value)).toBe(left)
  })

  it('announce the new value for assistive technology after a click', async () => {
    renderInBrowser(<NumberInput label="Preço" defaultValue={1234} />)
    const status = document.querySelector('[aria-live="polite"][aria-atomic="true"]') as HTMLElement

    await userEvent.click(part('increase'))

    expect(status.textContent).toBe('1.235')
  })

  it('stay out of the way of a double click and of a long press on touch screens', () => {
    renderInBrowser(<NumberInput label="Quantidade" />)
    const style = getComputedStyle(part('increase'))

    expect(style.touchAction).toBe('manipulation')
    expect(style.userSelect).toBe('none')
  })
})

describe('NumberInput form in a real browser', () => {
  it('sends the number under its name, not the text on the screen', async () => {
    let sent = ''

    renderInBrowser(
      <form
        onSubmit={(event) => {
          event.preventDefault()
          sent = String(new FormData(event.currentTarget).get('price'))
        }}
      >
        <NumberInput label="Preço" name="price" formatOptions={{ style: 'currency', currency: 'BRL' }} />
        <button type="submit">Enviar</button>
      </form>
    )

    await userEvent.click(input())
    await userEvent.keyboard('1234,5')
    await userEvent.click(page.getByRole('button', { name: 'Enviar' }))

    expect(sent).toBe('1234.5')
    expect(input().value).toBe('R$ 1.234,50')
  })
})

describe('NumberInput layout in a real browser', () => {
  it('has the height of the other fields and buttons of at least 24 by 24 px that sit inside it', () => {
    renderInBrowser(<NumberInput label="Quantidade" defaultValue={3} />)
    const control = rect(part('control'))

    expect(rect(input()).height).toBeCloseTo(56, 0)
    expect(rect(input()).width).toBeGreaterThanOrEqual(200)

    for (const name of ['increase', 'decrease']) {
      const box = rect(part(name))

      expect(box.width, name).toBeCloseTo(40, 0)
      expect(box.height, name).toBeCloseTo(40, 0)
      expect(box.top, name).toBeGreaterThanOrEqual(control.top)
      expect(box.bottom, name).toBeLessThanOrEqual(control.bottom)
      expect(box.right, name).toBeLessThanOrEqual(control.right)
    }

    expect(rect(part('decrease')).right).toBeLessThanOrEqual(rect(part('increase')).left)
  })

  it('keeps the numbers clear of the buttons, even when they are long', () => {
    renderInBrowser(<NumberInput label="Quantidade" defaultValue={123456789012} />)
    const field = input()
    const padding = parseFloat(getComputedStyle(field).paddingInlineEnd)

    expect(rect(field).right - padding).toBeLessThanOrEqual(rect(part('decrease')).left + 0.5)
    expect(field.scrollWidth).toBeGreaterThanOrEqual(field.clientWidth)
  })

  it('stretches with fullWidth and leaves its own width without it', () => {
    renderInBrowser(
      <>
        <div style={{ display: 'flex', inlineSize: 500 }}>
          <NumberInput label="Largo" fullWidth />
        </div>
        <div style={{ display: 'flex', inlineSize: 500 }}>
          <NumberInput label="Curto" />
        </div>
      </>
    )

    expect(rect(input(0)).width).toBeCloseTo(500, 0)
    expect(rect(input(1)).width).toBeLessThan(400)
  })

  it('lifts the label above the value when the field is focused or filled', async () => {
    renderInBrowser(
      <>
        <NumberInput label="Vazio" />
        <NumberInput label="Cheio" defaultValue={4} />
      </>
    )
    const label = (index: number) => rect(part('label', index))

    expect(label(0).top).toBeGreaterThan(rect(input(0)).top)
    expect(label(1).bottom).toBeLessThanOrEqual(rect(input(1)).top + 8)

    await userEvent.click(input(0))
    await waitForSettled(() => part('control'))

    expect(label(0).bottom).toBeLessThanOrEqual(rect(input(0)).top + 8)
  })

  it('shortens a long label before it reaches the buttons', () => {
    renderInBrowser(
      <div style={{ inlineSize: 220 }}>
        <NumberInput label="Um rótulo muito comprido que não cabe no campo" fullWidth />
      </div>
    )
    const label = part('label')

    expect(rect(label).right).toBeLessThanOrEqual(rect(part('decrease')).left + 0.5)
    expect(getComputedStyle(label).textOverflow).toBe('ellipsis')
  })

  it('puts the buttons at the start and the label at the right in right-to-left text', () => {
    document.documentElement.setAttribute('dir', 'rtl')
    renderInBrowser(<NumberInput label="Quantidade" defaultValue={3} />)
    const control = rect(part('control'))

    expect(rect(part('increase')).left).toBeLessThan(control.left + control.width / 2)
    expect(rect(part('decrease')).left).toBeGreaterThanOrEqual(rect(part('increase')).right)
    expect(rect(part('label')).left).toBeGreaterThan(control.left + control.width / 2)
  })

  it('lets the caller class and slot selectors win on layout even when its css loads before the library', () => {
    addStyle('.mine { inline-size: 340px; } [data-slot="number-input-steppers"] { gap: 11px; } [data-slot="number-input-field"] { min-inline-size: 260px; }')
    renderInBrowser(<NumberInput label="Preço" wrapperClassName="mine" />)

    expect(getComputedStyle(part('steppers')).columnGap).toBe('11px')
    expect(rect(input()).width).toBeGreaterThanOrEqual(260)
    expect(rect(document.querySelector('[data-slot="number-input"]') as HTMLElement).width).toBeCloseTo(340, 0)
  })
})

describe('NumberInput colors and focus in a real browser', () => {
  it.each(['light', 'dark'] as const)('keeps the value, the label and the buttons readable in the %s theme', async (mode) => {
    renderInBrowser(<NumberInput label="Quantidade" defaultValue={3} helperText="Ajuda" />, 'never', mode)
    await waitForSettled(() => part('control'))

    for (const name of surfaces) {
      expect(contrastRatio(getComputedStyle(input()).color, surface(name)), `value on ${name}`).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(getComputedStyle(part('label')).color, surface(name)), `label on ${name}`).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(getComputedStyle(part('helper')).color, surface(name)), `helper on ${name}`).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(getComputedStyle(part('increase')).color, surface(name)), `buttons on ${name}`).toBeGreaterThanOrEqual(3)
      expect(contrastRatio(getComputedStyle(part('outline')).borderTopColor, surface(name)), `border on ${name}`).toBeGreaterThanOrEqual(3)
    }
  })

  it.each(['light', 'dark'] as const)('shows the error in a readable color in the %s theme', async (mode) => {
    renderInBrowser(<NumberInput label="Quantidade" defaultValue={3} error="Valor inválido" />, 'never', mode)
    await waitForSettled(() => part('control'))

    for (const name of surfaces) {
      expect(contrastRatio(getComputedStyle(part('error')).color, surface(name)), `error on ${name}`).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(getComputedStyle(part('outline')).borderTopColor, surface(name)), `error border on ${name}`).toBeGreaterThanOrEqual(3)
    }
  })

  it('draws a thicker primary border around the focused field', async () => {
    renderInBrowser(<NumberInput label="Quantidade" defaultValue={3} />)
    const beforeColor = getComputedStyle(part('outline')).borderTopColor

    expect(parseFloat(getComputedStyle(part('outline')).borderTopWidth)).toBe(1)

    await userEvent.click(input())
    await waitForSettled(() => part('control'))
    const after = getComputedStyle(part('outline'))

    expect(parseFloat(after.borderTopWidth)).toBe(2)
    expect(after.borderTopColor).not.toBe(beforeColor)

    for (const name of surfaces) expect(contrastRatio(after.borderTopColor, surface(name)), name).toBeGreaterThanOrEqual(3)
  })

  it('shows a focus ring on a button that has the focus by keyboard', async () => {
    renderInBrowser(<NumberInput label="Quantidade" defaultValue={3} />)

    part('increase').tabIndex = 0
    await userEvent.click(input())
    await userEvent.tab()
    const style = getComputedStyle(part('increase'))

    expect(document.activeElement).toBe(part('increase'))

    expect(style.outlineStyle).toBe('solid')
    expect(parseFloat(style.outlineWidth)).toBeGreaterThanOrEqual(2)

    for (const name of surfaces) expect(contrastRatio(style.outlineColor, surface(name)), name).toBeGreaterThanOrEqual(3)
  })

  it('lightens the button under the pointer and shows the unavailable one as not allowed', async () => {
    renderInBrowser(<NumberInput label="Quantidade" defaultValue={0} min={0} />)
    const fill = (name: string) => getComputedStyle(part(name)).backgroundColor

    expect(fill('increase')).toBe('rgba(0, 0, 0, 0)')

    await userEvent.hover(part('increase'))
    expect(fill('increase')).not.toBe('rgba(0, 0, 0, 0)')

    await userEvent.hover(part('decrease'), { force: true })
    expect(fill('decrease')).toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(part('decrease')).cursor).toBe('not-allowed')
  })

  it('shows a disabled field with the disabled colors and a not allowed cursor', () => {
    renderInBrowser(<NumberInput label="Quantidade" defaultValue={3} disabled />)

    expect(getComputedStyle(input()).cursor).toBe('not-allowed')
    expect(getComputedStyle(input()).color).not.toBe(getComputedStyle(document.body).color)
    expect((part('increase') as HTMLButtonElement).disabled).toBe(true)
  })
})

describe('NumberInput motion in a real browser', () => {
  it('moves the label and the border with the duration of the fast token, and takes the variable of the component', () => {
    renderInBrowser(<NumberInput label="Quantidade" />, 'auto')

    expect(parseFloat(getComputedStyle(part('label')).transitionDuration.split(',')[0])).toBeCloseTo(0.15, 2)
    expect(parseFloat(getComputedStyle(part('outline')).transitionDuration)).toBeCloseTo(0.15, 2)

    addStyle('[data-slot="number-input"] { --enchase-number-input-duration: 0.4s; }')

    expect(parseFloat(getComputedStyle(part('label')).transitionDuration.split(',')[0])).toBeCloseTo(0.4, 2)
    expect(parseFloat(getComputedStyle(part('increase')).transitionDuration.split(',')[0])).toBeCloseTo(0.4, 2)
  })
})

describe('NumberInput in forced colors', () => {
  const run = unlessWebkit('forcedColors') ? it : it.skip

  run('keeps the border, the icons and the focus ring visible', async () => {
    renderInBrowser(<NumberInput label="Quantidade" defaultValue={3} />)

    await setForcedColors('active')
    await userEvent.click(input())

    const border = getComputedStyle(part('outline'))
    const icon = getComputedStyle(part('increase').querySelector('svg') as SVGElement)

    expect(border.borderTopColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(parseFloat(border.borderTopWidth)).toBe(2)
    expect(icon.stroke).not.toBe('none')
    expect(icon.stroke).not.toBe('rgba(0, 0, 0, 0)')
  })
})

describe('the language of its own of the NumberInput in a real browser', () => {
  it('writes the number with the separators and the grouping of the tag of the prop', () => {
    for (const [locale, text] of [
      ['en', '1,234,567.5'],
      ['de', '1.234.567,5'],
      ['en-IN', '12,34,567.5']
    ] as const) {
      const { unmount } = renderInBrowser(<NumberInput label="Number" locale={locale} defaultValue={1234567.5} />)

      expect(input().value, locale).toBe(text)
      unmount()
    }
  })

  it('reads a typed grouping as a grouping in the language of the prop, and not as a decimal mark', async () => {
    renderInBrowser(<NumberInput label="Number" locale="en" />)

    await userEvent.click(input())
    await userEvent.keyboard('1,234{Enter}')

    expect(input().getAttribute('aria-valuenow')).toBe('1234')
    expect(input().value).toBe('1,234')
  })

  it('formats what was typed with the decimal mark of the tag of the prop', async () => {
    renderInBrowser(<NumberInput label="Number" locale="en" />)

    await userEvent.click(input())
    await userEvent.keyboard('1234.5')
    expect(input().value).toBe('1234.5')
    await userEvent.keyboard('{Enter}')

    expect(input().value).toBe('1,234.5')
    expect(input().getAttribute('aria-valuenow')).toBe('1234.5')
  })

  it('writes a currency with the symbol where the tag of the prop puts it', () => {
    const euro = { style: 'currency', currency: 'EUR' } as const
    const german = new Intl.NumberFormat('de', euro).format(1234.5)

    renderInBrowser(<NumberInput label="Price" locale="de" formatOptions={euro} defaultValue={1234.5} />)

    expect(input().value).toBe(german)
    expect(german.endsWith('€')).toBe(true)
    expect(german).not.toBe(new Intl.NumberFormat('en', euro).format(1234.5))
  })

  it('keeps the names of the buttons of the provider, and spells the value of the prop for assistive technology', async () => {
    renderInBrowser(<NumberInput label="Number" locale="en" defaultValue={1234} step={0.5} />)

    expect(part('increase').getAttribute('aria-label')).toBe('Aumentar valor')

    await userEvent.click(part('increase'))

    expect(input().value).toBe('1,234.5')
    expect(input().getAttribute('aria-valuetext')).toBe('1,234.5')
  })

  it('falls back to English for a tag that is not valid or not known, and to the provider for an empty one', () => {
    for (const [locale, text] of [
      ['xx', '1,234.5'],
      ['en_US', '1,234.5'],
      ['', '1.234,5']
    ] as const) {
      const { unmount } = renderInBrowser(<NumberInput label="Number" locale={locale} defaultValue={1234.5} />)

      expect(input().value, locale).toBe(text)
      unmount()
    }
  })
})
