import { useState } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { Combobox } from '@components/common/Combobox/index.tsx'
import { Input } from '@components/common/Input/index.tsx'
import { Modal } from '@components/common/Modal/index.tsx'
import UIProvider from '@components/uiProvider/index.tsx'
import { ptBR } from '@locales/ptBR.ts'
import { contrastRatio } from '@styles/theme/contrast.ts'
import { parseComputedColor } from '../../../support/color.ts'
import { unlessWebkit } from '../../../support/browserSkips.ts'
import { renderInBrowser } from '../../../support/harness.tsx'
import { onRoot, part, parts, style } from '../../../support/hookProbes.ts'
import { setForcedColors } from '../../../support/media.ts'

import type { ComboboxOption } from '@components/common/Combobox/types.ts'
import type { ReactElement } from 'react'

const fruits: ComboboxOption[] = [
  { value: 'apple', label: 'Maçã' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cereja', disabled: true },
  { value: 'grape', label: 'Uva' },
  { value: 'kiwi', label: 'Kiwi' }
]

const many: ComboboxOption[] = Array.from({ length: 40 }, (_, index) => ({ value: `item-${index}`, label: `Item ${String(index + 1).padStart(2, '0')}` }))

const field = () => document.querySelector<HTMLInputElement>('[data-slot="combobox-input"]') as HTMLInputElement

const control = () => part('combobox-control')

const listbox = () => document.body.querySelector<HTMLElement>('[data-slot="combobox-listbox"]')

const options = () => parts('combobox-option')

const toggle = () => page.getByRole('button', { name: 'Mostrar opções' })

const opened = () => expect.poll(() => listbox()?.getAttribute('data-state')).toBe('open')

const closed = () => expect.poll(listbox).toBeNull()

const stage = (ui: ReactElement, top = 120) => <div style={{ position: 'absolute', top, left: 300, width: 320 }}>{ui}</div>

const open = async () => {
  await userEvent.click(field())
  await opened()
}

const within = (item: Element, container: Element) => {
  const box = item.getBoundingClientRect()
  const area = container.getBoundingClientRect()

  return box.top >= area.top - 1 && box.bottom <= area.bottom + 1
}

const transparent = 'rgba(0, 0, 0, 0)'

const over = (foreground: string, background: string) => {
  const top = parseComputedColor(foreground)
  const bottom = parseComputedColor(background)
  const mix = (above: number, below: number) => Math.round(above * top.a + below * (1 - top.a))

  return `rgb(${mix(top.r, bottom.r)}, ${mix(top.g, bottom.g)}, ${mix(top.b, bottom.b)})`
}

afterEach(async () => {
  document.documentElement.removeAttribute('style')
  await setForcedColors('none')
  await page.viewport(1280, 800)
})

describe('Combobox in a real browser', () => {
  it('opens under the field, on its start edge, at least as wide as the field and clear of it', async () => {
    renderInBrowser(stage(<Combobox label="Fruta" options={fruits} />))
    await open()
    const anchor = control().getBoundingClientRect()
    const box = (listbox() as HTMLElement).getBoundingClientRect()

    expect(listbox()).toHaveAttribute('data-placement', 'bottom-start')
    expect(box.top).toBeGreaterThanOrEqual(anchor.bottom)
    expect(Math.abs(box.left - anchor.left)).toBeLessThanOrEqual(1)
    expect(box.width).toBeGreaterThanOrEqual(anchor.width - 1)
  })

  it('opens above the field when there is no room below it', async () => {
    renderInBrowser(stage(<Combobox label="Fruta" options={fruits} />, 700))
    await open()
    const anchor = control().getBoundingClientRect()
    const box = (listbox() as HTMLElement).getBoundingClientRect()

    expect(listbox()?.getAttribute('data-placement')).toMatch(/^top/)
    expect(box.bottom).toBeLessThanOrEqual(anchor.top)
    expect(box.top).toBeGreaterThanOrEqual(0)
  })

  it('shrinks to the room it has and scrolls inside', async () => {
    await page.viewport(1280, 320)
    renderInBrowser(stage(<Combobox label="Fruta" options={many} />, 16))
    window.scrollTo(0, 0)
    await open()
    const box = (listbox() as HTMLElement).getBoundingClientRect()

    expect(box.bottom).toBeLessThanOrEqual(window.innerHeight)
    expect((listbox() as HTMLElement).scrollHeight).toBeGreaterThan((listbox() as HTMLElement).clientHeight)
    expect(getComputedStyle(listbox() as HTMLElement).overflowY).toBe('auto')
  })

  it('follows the field when the page scrolls', async () => {
    renderInBrowser(
      <div style={{ minHeight: 3000 }}>
        {stage(<Combobox label="Fruta" options={fruits} />, 200)}
      </div>
    )
    window.scrollTo(0, 0)
    await open()
    const gap = (listbox() as HTMLElement).getBoundingClientRect().top - control().getBoundingClientRect().bottom

    window.scrollTo(0, 60)

    await expect.poll(() => Math.round((listbox() as HTMLElement).getBoundingClientRect().top - control().getBoundingClientRect().bottom)).toBe(Math.round(gap))
  })

  it('aligns to the right edge of the field in a right-to-left page, with the toggle and the check on the left', async () => {
    renderInBrowser(
      <div dir="rtl">
        <UIProvider locale={{ ...ptBR, dir: 'rtl' }} motion={{ mode: 'never' }}>
          {stage(<Combobox label="Fruta" options={fruits} defaultValue="banana" />)}
        </UIProvider>
      </div>
    )
    await open()
    const anchor = control().getBoundingClientRect()
    const box = (listbox() as HTMLElement).getBoundingClientRect()
    const check = options()[1].querySelector('svg') as SVGElement

    expect(Math.abs(box.right - anchor.right)).toBeLessThanOrEqual(1)
    expect(getComputedStyle(listbox() as HTMLElement).direction).toBe('rtl')
    expect(toggle().element().getBoundingClientRect().left).toBeLessThan(field().getBoundingClientRect().left)
    expect(check.getBoundingClientRect().left).toBeLessThan(options()[1].querySelector('span')?.getBoundingClientRect().left as number)
  })

  it('keeps the real focus in the input while the arrows move the active option', async () => {
    renderInBrowser(stage(<Combobox label="Fruta" options={fruits} />))
    await open()
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{ArrowDown}')

    expect(document.activeElement).toBe(field())
    expect(field()).toHaveAttribute('aria-activedescendant', options()[1].id)
    expect(options().filter((option) => option.hasAttribute('data-active'))).toEqual([options()[1]])
    expect(getComputedStyle(options()[1]).backgroundColor).not.toBe(transparent)
    expect(getComputedStyle(options()[0]).backgroundColor).toBe(transparent)

    await userEvent.keyboard('{ArrowDown}')

    expect(field()).toHaveAttribute('aria-activedescendant', options()[3].id)
    expect(document.activeElement).toBe(field())
  })

  it('shows the last option when ArrowUp opens a long list, without scrolling the page', async () => {
    await page.viewport(1280, 320)
    renderInBrowser(
      <div style={{ minHeight: 3000 }}>
        {stage(<Combobox label="Fruta" options={many} />, 16)}
      </div>
    )
    window.scrollTo(0, 0)
    await userEvent.click(field())
    await userEvent.keyboard('{Escape}')
    await closed()
    await userEvent.keyboard('{ArrowUp}')
    await opened()

    await expect.poll(() => field().getAttribute('aria-activedescendant')).toBe(options()[39].id)
    await expect.poll(() => within(options()[39], listbox() as HTMLElement)).toBe(true)
    expect(window.scrollY).toBe(0)
  })

  it('keeps the active option in view as the arrows move through a long list', async () => {
    await page.viewport(1280, 320)
    renderInBrowser(
      <div style={{ minHeight: 3000 }}>
        {stage(<Combobox label="Fruta" options={many} />, 16)}
      </div>
    )
    window.scrollTo(0, 0)
    await open()

    for (let step = 0; step < 15; step += 1) await userEvent.keyboard('{ArrowDown}')

    await expect.poll(() => field().getAttribute('aria-activedescendant')).toBe(options()[14].id)
    await expect.poll(() => within(options()[14], listbox() as HTMLElement)).toBe(true)
    expect((listbox() as HTMLElement).scrollTop).toBeGreaterThan(0)
    expect(window.scrollY).toBe(0)
  })

  it('keeps the option the arrows chose while the list scrolls under a mouse that rests over it', async () => {
    await page.viewport(1280, 400)
    renderInBrowser(
      <div style={{ minHeight: 3000 }}>
        {stage(<Combobox label="Fruta" options={many} />, 16)}
      </div>
    )
    window.scrollTo(0, 0)
    await open()
    await userEvent.hover(options()[3])
    await expect.poll(() => field().getAttribute('aria-activedescendant')).toBe(options()[3].id)

    for (let step = 0; step < 12; step += 1) await userEvent.keyboard('{ArrowDown}')

    await new Promise((resolve) => setTimeout(resolve, 400))

    expect(field().getAttribute('aria-activedescendant')).toBe(options()[15].id)
    expect(options().filter((option) => option.hasAttribute('data-active'))).toEqual([options()[15]])
  })

  it('filters while typing, keeps the text on Esc and goes back to the label when the focus leaves with Tab', async () => {
    renderInBrowser(
      stage(
        <>
          <Combobox label="Fruta" options={fruits} defaultValue="banana" />
          <button>Depois</button>
        </>
      )
    )
    await userEvent.click(field())
    await userEvent.clear(field())
    await userEvent.keyboard('ki')
    await opened()

    expect(options().map((option) => option.textContent)).toEqual(['Kiwi'])

    await userEvent.keyboard('{Escape}')
    await closed()

    expect(field().value).toBe('ki')

    await userEvent.tab()

    expect(document.activeElement).toBe(page.getByRole('button', { name: 'Depois' }).element())
    expect(field().value).toBe('Banana')
  })

  it('chooses the active option with Enter, closes the list and keeps the focus in the field', async () => {
    renderInBrowser(stage(<Combobox label="Fruta" options={fruits} />))
    await open()
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{Enter}')
    await closed()

    expect(field().value).toBe('Banana')
    expect(document.activeElement).toBe(field())
  })

  it('chooses an option with a click and keeps the focus in the field', async () => {
    renderInBrowser(stage(<Combobox label="Fruta" options={fruits} />))
    await open()
    await userEvent.click(options()[3])
    await closed()

    expect(field().value).toBe('Uva')
    expect(document.activeElement).toBe(field())
  })

  it('does not choose a disabled option and keeps the list open', async () => {
    renderInBrowser(stage(<Combobox label="Fruta" options={fruits} />))
    await open()
    await userEvent.click(options()[2], { force: true })

    expect(field().value).toBe('')
    expect(listbox()).toBeTruthy()
    expect(document.activeElement).toBe(field())
  })

  it('keeps the list open and the focus in the field when its padding is pressed', async () => {
    renderInBrowser(stage(<Combobox label="Fruta" options={fruits} />))
    await open()
    await userEvent.click(listbox() as HTMLElement, { position: { x: (listbox() as HTMLElement).getBoundingClientRect().width / 2, y: 2 } })

    expect(listbox()?.getAttribute('data-state')).toBe('open')
    expect(document.activeElement).toBe(field())
  })

  it('keeps the list open and the focus in the field when the empty message is pressed', async () => {
    renderInBrowser(stage(<Combobox label="Fruta" options={[]} />))
    await open()
    await userEvent.click(part('combobox-message'), { force: true })

    expect(listbox()?.getAttribute('data-state')).toBe('open')
    expect(document.activeElement).toBe(field())
  })

  it('closes with a click outside and leaves the focus where the click landed', async () => {
    renderInBrowser(
      stage(
        <>
          <button>Antes</button>
          <Combobox label="Fruta" options={fruits} />
        </>
      )
    )
    await open()
    await userEvent.click(page.getByRole('button', { name: 'Antes' }))
    await closed()

    expect(document.activeElement).toBe(page.getByRole('button', { name: 'Antes' }).element())
  })

  it('opens and closes with the toggle and keeps the focus in the field', async () => {
    renderInBrowser(stage(<Combobox label="Fruta" options={fruits} />))
    await userEvent.click(toggle())
    await opened()

    expect(document.activeElement).toBe(field())
    expect(toggle().element()).toHaveAttribute('aria-expanded', 'true')

    await userEvent.click(toggle())
    await closed()

    expect(document.activeElement).toBe(field())
  })

  it('makes the option under the pointer the active one, but not a disabled one, and leaves the focus alone', async () => {
    renderInBrowser(stage(<Combobox label="Fruta" options={fruits} />))
    await open()

    expect(getComputedStyle(options()[1]).backgroundColor).toBe(transparent)

    await userEvent.hover(options()[1])

    await expect.poll(() => getComputedStyle(options()[1]).backgroundColor).not.toBe(transparent)
    expect(field()).toHaveAttribute('aria-activedescendant', options()[1].id)
    expect(document.activeElement).toBe(field())

    await userEvent.hover(options()[2])

    expect(getComputedStyle(options()[2]).backgroundColor).toBe(transparent)
    expect(options()[2]).not.toHaveAttribute('data-active')
  })

  it('removes a tag with a click on its button, keeps the list open and puts the focus back in the field', async () => {
    renderInBrowser(stage(<Combobox multiple label="Frutas" options={fruits} defaultValue={['apple', 'banana']} />))
    await open()
    await userEvent.click(page.getByRole('button', { name: 'Remover Maçã' }))

    await expect.poll(() => parts('tag').length).toBe(1)
    expect(document.activeElement).toBe(field())
    expect(parts('tag')[0].textContent).toBe('Banana')
    expect(listbox()?.getAttribute('data-state')).toBe('open')
  })

  it('keeps the list open after a choice in the multiple mode and clears the text', async () => {
    renderInBrowser(stage(<Combobox multiple label="Frutas" options={fruits} />))
    await open()
    await userEvent.keyboard('uv')
    await expect.poll(() => options().length).toBe(1)
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{Enter}')

    await expect.poll(() => parts('tag').length).toBe(1)
    expect(field().value).toBe('')
    expect(listbox()?.getAttribute('data-state')).toBe('open')
    expect(options()).toHaveLength(5)
    expect(document.activeElement).toBe(field())
  })

  it('removes the last tag with Backspace in the empty field', async () => {
    renderInBrowser(stage(<Combobox multiple label="Frutas" options={fruits} defaultValue={['apple', 'banana']} />))
    await userEvent.click(field())
    await userEvent.keyboard('{Backspace}')

    await expect.poll(() => parts('tag').length).toBe(1)
    expect(parts('tag')[0].textContent).toBe('Maçã')
  })

  it('submits one entry per chosen value with the form it belongs to', async () => {
    renderInBrowser(
      <>
        <form id="order" />
        {stage(<Combobox multiple label="Frutas" name="fruits" form="order" options={fruits} defaultValue={['apple', 'grape']} />)}
      </>
    )
    const data = new FormData(document.getElementById('order') as HTMLFormElement)

    expect(data.getAll('fruits')).toEqual(['apple', 'grape'])
    expect(data.has('')).toBe(false)
  })
})

describe('the field of the Combobox in a real browser', () => {
  const tags = ['apple', 'banana', 'cherry', 'grape', 'kiwi']

  it('wraps the tags over several rows and keeps the floated label at the top, where an input with a value keeps it', () => {
    renderInBrowser(
      <>
        <div style={{ width: 240 }}>
          <Combobox multiple label="Frutas" options={fruits} defaultValue={tags} />
        </div>
        <div style={{ width: 240 }}>
          <Input label="Nome" defaultValue="Ana" />
        </div>
      </>
    )
    const label = part('combobox-label')
    const reference = part('input-label')
    const offset = (element: Element, anchor: Element) => element.getBoundingClientRect().top - anchor.getBoundingClientRect().top

    expect(control().getBoundingClientRect().height).toBeGreaterThan(part('input-control').getBoundingClientRect().height + 20)
    expect(Math.abs(offset(label, control()) - offset(reference, part('input-control')))).toBeLessThanOrEqual(1)
    expect(new DOMMatrixReadOnly(getComputedStyle(label).transform).a).toBeCloseTo(0.75, 2)
  })

  it('keeps room for the toggle at the end of the field, so no tag goes under it', () => {
    renderInBrowser(
      <div style={{ width: 240 }}>
        <Combobox multiple label="Frutas" options={fruits} defaultValue={tags} />
      </div>
    )
    const toggleBox = part('combobox-toggle').getBoundingClientRect()

    expect(parseFloat(style('combobox-control').paddingRight)).toBeGreaterThanOrEqual(control().getBoundingClientRect().right - toggleBox.left - 1)

    for (const tag of parts('tag')) expect(tag.getBoundingClientRect().right).toBeLessThanOrEqual(toggleBox.left + 1)
  })

  it('keeps the input in the row of the tags, with room to type', () => {
    renderInBrowser(
      <div style={{ width: 480 }}>
        <Combobox multiple label="Frutas" options={fruits} defaultValue={['apple']} />
      </div>
    )
    const tag = parts('tag')[0].getBoundingClientRect()
    const input = field().getBoundingClientRect()

    expect(Math.abs(input.top + input.height / 2 - (tag.top + tag.height / 2))).toBeLessThanOrEqual(2)
    expect(input.width).toBeGreaterThanOrEqual(96)
  })

  it('takes the width, the padding and the font size from the hooks it shares with the other fields', () => {
    renderInBrowser(
      <div style={{ '--enchase-input-min-width': '120px', '--enchase-input-padding-inline': '12px', '--enchase-input-font-size': '14px' } as Record<string, string>}>
        <Combobox label="Fruta" options={fruits} />
      </div>
    )

    expect([style('combobox-control').minWidth, style('combobox-control').paddingLeft, style('combobox-input').fontSize]).toEqual(['120px', '12px', '14px'])
  })

  it('starts at the 200px, 1rem and 1rem of the other fields and as tall as them', () => {
    renderInBrowser(
      <>
        <Combobox label="Fruta" options={fruits} />
        <Input label="Nome" />
      </>
    )

    expect([style('combobox-control').minWidth, style('combobox-control').paddingLeft, style('combobox-input').fontSize]).toEqual(['200px', '16px', '16px'])
    expect(control().getBoundingClientRect().height).toBe(part('input-control').getBoundingClientRect().height)
  })

  it('draws the label as a title above the field when it is stacked', () => {
    renderInBrowser(<Combobox label="Fruta" labelPlacement="stacked" options={fruits} />)

    expect(part('combobox-label').getBoundingClientRect().bottom).toBeLessThanOrEqual(control().getBoundingClientRect().top + 1)
    expect(getComputedStyle(part('combobox-label')).position).toBe('static')
  })
})

describe('the colors of the Combobox in a real browser', () => {
  it.each(['light', 'dark'] as const)('reads in %s mode: the options against the list, the active one against its tint and the field against the page', async (mode) => {
    renderInBrowser(stage(<Combobox label="Fruta" options={fruits} defaultValue="grape" />), 'never', mode)
    await open()
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{ArrowDown}')

    const surface = getComputedStyle(listbox() as HTMLElement).backgroundColor
    const active = options()[1]
    const tint = getComputedStyle(active).backgroundColor

    expect(tint).not.toBe(transparent)
    expect(contrastRatio(getComputedStyle(options()[0]).color, surface), 'option').toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(getComputedStyle(options()[3]).color, surface), 'selected option').toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(getComputedStyle(active).color, over(tint, surface)), 'active option').toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(getComputedStyle(part('combobox-toggle')).color, getComputedStyle(document.body).backgroundColor), 'toggle').toBeGreaterThanOrEqual(3)
    expect(contrastRatio(getComputedStyle(field()).color, getComputedStyle(document.body).backgroundColor), 'field').toBeGreaterThanOrEqual(4.5)
  })

  const forced = unlessWebkit('forcedColors') ? it : it.skip

  forced('outlines the active option in forced colors, where a tint would vanish', async () => {
    renderInBrowser(stage(<Combobox label="Fruta" options={fruits} />))
    await open()
    await userEvent.keyboard('{ArrowDown}')
    await setForcedColors('active')

    await expect.poll(() => getComputedStyle(options()[0]).outlineStyle).toBe('solid')

    expect(parseFloat(getComputedStyle(options()[0]).outlineWidth)).toBeGreaterThanOrEqual(2)
    expect(getComputedStyle(options()[1]).outlineStyle).toBe('none')
  })

  forced('keeps the border of the field at 2px or more when it has the focus in forced colors', async () => {
    renderInBrowser(stage(<Combobox label="Fruta" options={fruits} />))
    await userEvent.click(field())
    await setForcedColors('active')

    await expect.poll(() => parseFloat(getComputedStyle(part('combobox-outline')).borderTopWidth)).toBeGreaterThanOrEqual(2)
  })
})

describe('Combobox inside a modal in a real browser', () => {
  const InModal = () => {
    const [shown, setShown] = useState(true)

    return (
      <Modal isOpen={shown} onClose={() => setShown(false)} title="Pedido">
        <Combobox label="Fruta" options={fruits} />
      </Modal>
    )
  }

  it('opens above the modal, is not inert, closes first with Esc and then lets the modal close', async () => {
    renderInBrowser(<InModal />)
    await expect.poll(() => parts('modal-panel').length).toBe(1)
    await open()
    const item = options()[0]
    const box = item.getBoundingClientRect()

    expect(listbox()?.closest('[inert]')).toBeNull()
    expect(item.contains(document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2))).toBe(true)

    await userEvent.keyboard('{Escape}')
    await closed()

    expect(parts('modal-panel').length).toBe(1)
    expect(document.activeElement).toBe(field())

    await userEvent.keyboard('{Escape}')

    await expect.poll(() => parts('modal-panel').length).toBe(0)
  })

  it('chooses an option with a click and keeps the modal open with the focus in the field', async () => {
    renderInBrowser(<InModal />)
    await expect.poll(() => parts('modal-panel').length).toBe(1)
    await open()
    await userEvent.click(options()[3])
    await closed()

    expect(field().value).toBe('Uva')
    expect(parts('modal-panel').length).toBe(1)
    expect(document.activeElement).toBe(field())
  })
})

describe('Combobox from its hooks', () => {
  it('takes the gap, the corners and the room of the field from their hooks', () => {
    onRoot({ '--enchase-combobox-control-gap': '9px', '--enchase-combobox-control-padding-block-multiple': '7px', '--enchase-combobox-control-radius': '11px', '--enchase-combobox-input-min-width': '77px', '--enchase-combobox-input-min-height-multiple': '37px' })
    renderInBrowser(<Combobox multiple label="Frutas" options={fruits} defaultValue={['apple']} />)

    expect([style('combobox-control').columnGap, style('combobox-control').rowGap, style('combobox-control').paddingTop, style('combobox-control').paddingBottom, style('combobox-control').borderTopLeftRadius]).toEqual(['9px', '9px', '7px', '7px', '11px'])
    expect(style('combobox-outline').borderTopLeftRadius).toBe('11px')
    expect([style('combobox-input').flexBasis, style('combobox-input').minHeight]).toEqual(['77px', '37px'])
  })

  it('takes the message of the field from the hooks of its error and its helper text', () => {
    onRoot({ '--enchase-combobox-error-font-size': '15px', '--enchase-combobox-error-font-weight': '650', '--enchase-combobox-helper-font-size': '13px' })
    renderInBrowser(
      <>
        <Combobox label="Fruta" options={fruits} error="Escolha uma fruta" />
        <Combobox label="Outra" options={fruits} helperText="Digite para filtrar" />
      </>
    )

    expect([style('combobox-error').fontSize, style('combobox-error').fontWeight, style('combobox-helper').fontSize]).toEqual(['15px', '650', '13px'])
  })

  it('takes the padding, the gap, the type, the corners and the colors of the options from their hooks', async () => {
    onRoot({
      '--enchase-combobox-option-padding-block': '7px',
      '--enchase-combobox-option-padding-inline': '9px',
      '--enchase-combobox-option-gap': '11px',
      '--enchase-combobox-option-font-size': '13px',
      '--enchase-combobox-option-font-weight': '450',
      '--enchase-combobox-option-font-weight-selected': '750',
      '--enchase-combobox-option-line-height': '21px',
      '--enchase-combobox-option-radius': '13px',
      '--enchase-combobox-option-color': 'rgb(1, 2, 3)',
      '--enchase-combobox-option-color-disabled': 'rgb(4, 5, 6)'
    })
    renderInBrowser(<Combobox label="Fruta" options={fruits} defaultValue="banana" defaultOpen />)
    await opened()
    const [plain, selected, disabled] = [0, 1, 2].map((index) => getComputedStyle(options()[index]))

    expect([plain.paddingTop, plain.paddingBottom, plain.paddingLeft, plain.paddingRight, plain.columnGap]).toEqual(['7px', '7px', '9px', '9px', '11px'])
    expect([plain.fontSize, plain.fontWeight, plain.lineHeight, plain.borderTopLeftRadius, plain.color]).toEqual(['13px', '450', '21px', '13px', 'rgb(1, 2, 3)'])
    expect(selected.fontWeight).toBe('750')
    expect(disabled.color).toBe('rgb(4, 5, 6)')
  })

  it('takes the look of the messages from their hooks', async () => {
    onRoot({ '--enchase-combobox-message-padding-block': '7px', '--enchase-combobox-message-padding-inline': '9px', '--enchase-combobox-message-font-size': '13px', '--enchase-combobox-message-color': 'rgb(7, 8, 9)' })
    renderInBrowser(<Combobox label="Fruta" options={[]} defaultOpen />)
    await opened()

    expect([style('combobox-message').paddingTop, style('combobox-message').paddingBottom, style('combobox-message').paddingLeft, style('combobox-message').paddingRight, style('combobox-message').fontSize, style('combobox-message').color]).toEqual(['7px', '7px', '9px', '9px', '13px', 'rgb(7, 8, 9)'])
  })

  it('takes the colors and the corners of the toggle from their hooks', async () => {
    onRoot({ '--enchase-combobox-toggle-color': 'rgb(1, 2, 3)', '--enchase-combobox-toggle-color-hover': 'rgb(4, 5, 6)', '--enchase-combobox-toggle-radius': '9px' })
    renderInBrowser(
      <>
        <Combobox label="Fruta" options={fruits} />
        <Combobox label="Outra" options={fruits} disabled />
      </>
    )

    expect([style('combobox-toggle').color, style('combobox-toggle').borderTopLeftRadius]).toEqual(['rgb(1, 2, 3)', '9px'])

    await userEvent.hover(part('combobox-toggle'))

    await expect.poll(() => style('combobox-toggle').color).toBe('rgb(4, 5, 6)')

    onRoot({ '--enchase-combobox-toggle-color-disabled': 'rgb(7, 8, 9)' })

    await expect.poll(() => style('combobox-toggle', 1).color).toBe('rgb(7, 8, 9)')
  })

  it('takes the height and the padding of the list from their hooks', async () => {
    onRoot({ '--enchase-combobox-listbox-max-height': '120px', '--enchase-combobox-listbox-padding-block': '6px', '--enchase-combobox-listbox-padding-inline': '8px' })
    renderInBrowser(<Combobox label="Fruta" options={many} defaultOpen />)
    await opened()
    const list = style('combobox-listbox')

    expect(parseFloat(list.maxHeight)).toBeLessThanOrEqual(120)
    expect([list.paddingTop, list.paddingBottom, list.paddingLeft, list.paddingRight]).toEqual(['6px', '6px', '8px', '8px'])
    expect((listbox() as HTMLElement).getBoundingClientRect().height).toBeLessThanOrEqual(120.5)
  })

  it('eases the color of the field for as long as its hooks say, and stops easing when the animation is off', () => {
    onRoot({ '--enchase-combobox-duration': '0.4s', '--enchase-combobox-ease': 'linear' })
    renderInBrowser(<Combobox label="Fruta" options={fruits} />, 'auto')

    expect(style('combobox-label').transitionDuration.split(',').map((value) => value.trim())).toEqual(['0.4s', '0.4s'])
    expect(style('combobox-label').transitionTimingFunction.split(',').map((value) => value.trim())).toEqual(['linear', 'linear'])
    expect(style('combobox-outline').transitionDuration).toBe('0.4s')
    expect(style('combobox-toggle').transitionDuration.split(',').map((value) => value.trim())).toEqual(['0.4s', '0.4s'])
  })

  it('opens the list for as long as the animation says, from the scale it says', async () => {
    const scales: number[] = []
    const watch = new MutationObserver(() => {
      const element = listbox()

      if (element?.getAttribute('data-state') === 'entering') scales.push(new DOMMatrixReadOnly(getComputedStyle(element).transform).a)
    })

    watch.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-state'] })
    renderInBrowser(stage(<Combobox label="Fruta" options={fruits} animation={{ tuning: { duration: 0.4, scale: 0.5 } }} />), 'auto')
    await open()
    watch.disconnect()

    expect(scales.length).toBeGreaterThan(0)
    expect(Math.min(...scales)).toBeCloseTo(0.5, 1)
    expect(parseFloat(style('combobox-listbox').transitionDuration)).toBe(0.4)
  })

  it('opens and closes the list with the timing function of its hook, and closes in 70% of the time it takes to open', async () => {
    onRoot({ '--enchase-combobox-ease': 'linear' })
    renderInBrowser(stage(<Combobox label="Fruta" options={fruits} animation={{ tuning: { duration: 0.4 } }} />), 'auto')
    await open()

    expect(style('combobox-listbox').transitionTimingFunction.split(',')[0].trim()).toBe('linear')

    const exits: { duration: string; timing: string }[] = []
    const watch = new MutationObserver(() => {
      const element = listbox()

      if (element?.getAttribute('data-state') === 'exiting') exits.push({ duration: getComputedStyle(element).transitionDuration, timing: getComputedStyle(element).transitionTimingFunction })
    })

    watch.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['data-state'] })
    await userEvent.keyboard('{Escape}')
    await closed()
    watch.disconnect()

    expect(exits.length).toBeGreaterThan(0)
    expect(parseFloat(exits[0].duration)).toBeCloseTo(0.28, 2)
    expect(exits[0].timing.split(',')[0].trim()).toBe('linear')
  })

  it('does not ease anything when the animation is off', async () => {
    renderInBrowser(stage(<Combobox label="Fruta" options={fruits} animation={false} />), 'auto')
    await open()

    expect(parseFloat(style('combobox-listbox').transitionDuration)).toBe(0)
  })
})
