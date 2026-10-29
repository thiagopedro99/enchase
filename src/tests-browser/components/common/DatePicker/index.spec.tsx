import { render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { ColorModeProvider } from '@components/colorMode/index.tsx'
import { DatePicker } from '@components/common/DatePicker/index.tsx'
import { Input } from '@components/common/Input/index.tsx'
import { Modal } from '@components/common/Modal/index.tsx'
import UIProvider from '@components/uiProvider/index.tsx'
import { ptBR } from '@locales/ptBR.ts'
import { contrastRatio } from '@styles/theme/contrast.ts'
import { parseComputedColor } from '../../../support/color.ts'
import { unlessWebkit } from '../../../support/browserSkips.ts'
import { renderInBrowser } from '../../../support/harness.tsx'
import { onRoot, part, style } from '../../../support/hookProbes.ts'
import { setForcedColors } from '../../../support/media.ts'
import { frames, waitForSettled } from '../../../support/settle.ts'

import type { ReactElement } from 'react'

const field = () => document.querySelector<HTMLInputElement>('[data-slot="date-picker-input"]') as HTMLInputElement

const control = () => part('date-picker-control')

const toggle = () => part('date-picker-toggle') as HTMLButtonElement

const popup = () => document.body.querySelector<HTMLElement>('[data-slot="popover-content"]')

const dayOf = (date: string) => document.body.querySelector<HTMLElement>(`[data-slot="date-picker-calendar-day"][data-date="${date}"]`)

const opened = () => expect.poll(() => popup()?.getAttribute('data-state')).toBe('open')

const closed = () => expect.poll(popup).toBeNull()

const stage = (ui: ReactElement, top = 120) => <div style={{ position: 'absolute', top, left: 300, width: 320 }}>{ui}</div>

const open = async () => {
  await userEvent.click(toggle())
  await opened()
}

const rect = (element: Element | null | undefined) => (element as Element).getBoundingClientRect()

afterEach(async () => {
  document.documentElement.removeAttribute('style')
  await setForcedColors('none')
  await page.viewport(1280, 800)
})

describe('DatePicker in a real browser', () => {
  it('draws the field as large as an Input and the button inside it, at the end and centered', () => {
    renderInBrowser(
      <div style={{ display: 'grid', gap: 24, padding: 24, width: 320 }}>
        <Input label="Nome" fullWidth />
        <DatePicker label="Data" fullWidth />
      </div>
    )
    const reference = rect(part('input-outline'))
    const outline = rect(part('date-picker-outline'))
    const box = rect(control())
    const button = rect(toggle())

    expect(outline.height).toBe(reference.height)
    expect(outline.width).toBe(reference.width)
    expect(button.width).toBe(40)
    expect(button.height).toBe(40)
    expect(Math.abs(box.right - 8 - button.right)).toBeLessThanOrEqual(1)
    expect(Math.abs(box.top + box.height / 2 - (button.top + button.height / 2))).toBeLessThanOrEqual(1)
  })

  it('leaves room for the button in the text of the field, and follows the hit size of the page', () => {
    onRoot({ '--enchase-hit-size': '48px' })
    renderInBrowser(stage(<DatePicker label="Data" />))

    expect(rect(toggle()).width).toBe(48)
    expect(parseFloat(style('date-picker-input').paddingRight)).toBe(64)
  })

  it('lets a click on the field reach the input, and not the invisible layer that holds the button', async () => {
    renderInBrowser(stage(<DatePicker label="Data" />))
    const box = rect(field())

    await userEvent.click(field(), { position: { x: 12, y: box.height / 2 } })

    expect(field()).toHaveFocus()
    expect(popup()).toBeNull()
    expect(document.elementFromPoint(box.left + 12, box.top + box.height / 2)).toBe(field())
    expect(document.elementFromPoint(rect(toggle()).left + 20, rect(toggle()).top + 20)).toBe(toggle().querySelector('svg') ?? toggle())
  })

  it('opens under the field, on its start edge and clear of it', async () => {
    renderInBrowser(stage(<DatePicker label="Data" defaultValue="2026-10-15" />))
    await open()
    const anchor = rect(control())
    const box = rect(popup())

    expect(popup()).toHaveAttribute('data-placement', 'bottom-start')
    expect(box.top - anchor.bottom).toBeGreaterThanOrEqual(3)
    expect(box.top - anchor.bottom).toBeLessThanOrEqual(6)
    expect(Math.abs(box.left - anchor.left)).toBeLessThanOrEqual(1)
  })

  it('opens above the field when there is no room below it', async () => {
    renderInBrowser(stage(<DatePicker label="Data" defaultValue="2026-10-15" />, 600))
    await open()

    expect(popup()?.getAttribute('data-placement')).toMatch(/^top/)
    expect(rect(popup()).bottom).toBeLessThanOrEqual(rect(control()).top)
    expect(rect(popup()).top).toBeGreaterThanOrEqual(0)
  })

  it('follows the field when the page scrolls', async () => {
    renderInBrowser(<div style={{ minHeight: 3000 }}>{stage(<DatePicker label="Data" defaultValue="2026-10-15" />, 200)}</div>)
    window.scrollTo(0, 0)
    await open()
    const gap = rect(popup()).top - rect(control()).bottom

    window.scrollTo(0, 60)
    await expect.poll(() => Math.round(rect(control()).top)).toBe(140)
    await expect.poll(() => Math.abs(rect(popup()).top - rect(control()).bottom - gap)).toBeLessThanOrEqual(1)
    window.scrollTo(0, 0)
  })

  it('stays inside a narrow screen', async () => {
    await page.viewport(320, 640)
    renderInBrowser(<div style={{ padding: 16 }}><DatePicker label="Data" defaultValue="2026-10-15" fullWidth /></div>)
    await open()

    expect(rect(popup()).left).toBeGreaterThanOrEqual(0)
    expect(rect(popup()).right).toBeLessThanOrEqual(320)
  })

  it('opens on the start edge of a right-to-left page', async () => {
    renderInBrowser(
      <div dir="rtl">
        <UIProvider locale={{ ...ptBR, dir: 'rtl' }} motion={{ mode: 'never' }}>
          {stage(<DatePicker label="Data" defaultValue="2026-10-15" />)}
        </UIProvider>
      </div>
    )
    await open()

    expect(Math.abs(rect(popup()).right - rect(control()).right)).toBeLessThanOrEqual(1)
    expect(popup()).toHaveAttribute('dir', 'rtl')
  })

  it('puts the button at the start of a right-to-left field, with the text next to it', () => {
    renderInBrowser(
      <div dir="rtl">
        <UIProvider locale={{ ...ptBR, dir: 'rtl' }} motion={{ mode: 'never' }}>
          {stage(<DatePicker label="Data" defaultValue="2026-10-15" />)}
        </UIProvider>
      </div>
    )

    expect(Math.abs(rect(part('date-picker-outline')).left + 8 - rect(toggle()).left)).toBeLessThanOrEqual(1)
    expect(parseFloat(style('date-picker-input').paddingLeft)).toBe(56)
  })
})

describe('the focus of the DatePicker in a real browser', () => {
  it('puts the focus on the chosen day, and shows no ring after a click', async () => {
    renderInBrowser(stage(<DatePicker label="Data" defaultValue="2026-10-15" />))
    await open()

    await expect.poll(() => document.activeElement).toBe(dayOf('2026-10-15'))
    expect(dayOf('2026-10-15')?.matches(':focus-visible')).toBe(false)
  })

  it('puts the focus on the chosen day, with a ring, when it opens from the keyboard', async () => {
    renderInBrowser(stage(<DatePicker label="Data" defaultValue="2026-10-15" />))
    await userEvent.tab()
    await userEvent.tab()

    expect(toggle()).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await opened()

    await expect.poll(() => document.activeElement).toBe(dayOf('2026-10-15'))
    expect(dayOf('2026-10-15')?.matches(':focus-visible')).toBe(true)
    expect(getComputedStyle(dayOf('2026-10-15')?.querySelector('[data-slot="date-picker-calendar-day-number"]') as Element).outlineStyle).toBe('solid')
  })

  it('chooses a day with the keyboard, writes it and gives the focus back to the button', async () => {
    renderInBrowser(stage(<DatePicker label="Data" defaultValue="2026-10-15" />))
    await userEvent.tab()
    await userEvent.tab()
    await userEvent.keyboard('{Enter}')
    await opened()
    await userEvent.keyboard('{ArrowRight}{ArrowDown}{Enter}')
    await closed()

    expect(field()).toHaveValue('23/10/2026')
    expect(toggle()).toHaveFocus()
  })

  it('closes with Escape and gives the focus back to the button', async () => {
    renderInBrowser(stage(<DatePicker label="Data" defaultValue="2026-10-15" />))
    await open()
    await userEvent.keyboard('{Escape}')
    await closed()

    expect(toggle()).toHaveFocus()
    expect(field()).toHaveValue('15/10/2026')
  })

  it('closes when the field is clicked, so that the date can be typed there', async () => {
    renderInBrowser(stage(<DatePicker label="Data" />))
    await open()
    await userEvent.click(field())
    await closed()

    expect(field()).toHaveFocus()
  })

  it('reads the typed date when the field is left, and puts the old one back for a text that is not a date', async () => {
    renderInBrowser(stage(<DatePicker label="Data" defaultValue="2026-10-15" />))
    await userEvent.click(field())
    await userEvent.keyboard('{Control>}a{/Control}28102026')
    await userEvent.tab()

    expect(field()).toHaveValue('28/10/2026')

    await userEvent.click(field())
    await userEvent.keyboard('{Control>}a{/Control}banana')
    await userEvent.tab()

    expect(field()).toHaveValue('28/10/2026')
  })

  it('shows the typed date in the calendar that opens next', async () => {
    renderInBrowser(stage(<DatePicker label="Data" />))
    await userEvent.click(field())
    await userEvent.keyboard('09032027')
    await open()

    await expect.poll(() => document.activeElement).toBe(dayOf('2027-03-09'))
    expect(dayOf('2027-03-09')).toHaveAttribute('aria-selected', 'true')
  })
})

describe('the field of the DatePicker next to the Input in a real browser', () => {
  const both = (props: { error?: string; disabled?: boolean } = {}) => (
    <div style={{ display: 'grid', gap: 24, padding: 24, width: 320 }}>
      <Input label="Nome" fullWidth {...props} />
      <DatePicker label="Data" fullWidth {...props} />
    </div>
  )

  const outlineColors = () => [part('input-outline'), part('date-picker-outline')].map((element) => [getComputedStyle(element).borderTopColor, getComputedStyle(element).borderTopWidth, getComputedStyle(element).borderTopLeftRadius])

  it('draws the border, the width and the corners of the outline as the Input does', () => {
    renderInBrowser(both())
    const [reference, own] = outlineColors()

    expect(own).toEqual(reference)
  })

  it('draws the focus and the error as the Input does', async () => {
    renderInBrowser(both({ error: 'Errado' }))
    const [reference, own] = outlineColors()

    expect(own).toEqual(reference)
    document.querySelector<HTMLInputElement>('[data-slot="input-field"]')?.focus()
    await frames(2)
    const focused = outlineColors()[0]

    field().focus()
    await frames(2)

    expect(outlineColors()[1]).toEqual(focused)
  })

  it('dims the disabled field and its button as the Input does', () => {
    renderInBrowser(both({ disabled: true }))

    expect(style('date-picker-outline').opacity).toBe(style('input-outline').opacity)
    expect(toggle()).toBeDisabled()
    expect(getComputedStyle(toggle()).cursor).toBe('not-allowed')
  })

  it('floats the label when there is a date, and opens the notch of the outline for it', () => {
    renderInBrowser(
      <div style={{ display: 'grid', gap: 24, padding: 24, width: 320 }}>
        <DatePicker label="Vazio" />
        <DatePicker label="Cheio" defaultValue="2026-10-15" />
      </div>
    )
    const [empty, filled] = [0, 1].map((index) => part('date-picker-label', index).getBoundingClientRect())
    const [emptyOutline, filledOutline] = [0, 1].map((index) => part('date-picker-outline', index).getBoundingClientRect())

    expect(empty.top - emptyOutline.top).toBeGreaterThan(filled.top - filledOutline.top + 10)
    expect(getComputedStyle(part('date-picker-outline', 0).querySelector('legend') as Element).maxWidth).toBe('0.01px')
    expect(getComputedStyle(part('date-picker-outline', 1).querySelector('legend') as Element).maxWidth).not.toBe('0.01px')
  })
})

describe('the colors of the DatePicker in a real browser', () => {
  it.each(['light', 'dark'] as const)('reads the button over the field in %s mode, and brightens it under the pointer', async (mode) => {
    onRoot({ '--enchase-date-picker-duration': '0s' })
    renderInBrowser(stage(<DatePicker label="Data" />), 'never', mode)
    await expect.poll(() => document.documentElement.getAttribute('data-theme')).toBe(mode)
    await frames(3)
    await waitForSettled(() => document.documentElement)
    await expect.poll(() => parseComputedColor(getComputedStyle(document.body).backgroundColor).a).toBe(1)

    const surface = getComputedStyle(document.body).backgroundColor
    const resting = contrastRatio(getComputedStyle(toggle()).color, surface)

    expect(resting).toBeGreaterThanOrEqual(4.5)

    await userEvent.hover(toggle())
    await expect.poll(() => contrastRatio(getComputedStyle(toggle()).color, surface)).toBeGreaterThan(resting)
  })

  it('draws the ring of the button from its own rule, even in a page without the global styles', async () => {
    render(
      <ColorModeProvider defaultMode="light" storage={null}>
        <UIProvider locale={ptBR} motion={{ mode: 'never' }}>
          {stage(<DatePicker label="Data" />)}
        </UIProvider>
      </ColorModeProvider>
    )
    await userEvent.tab()
    await userEvent.tab()

    expect(toggle()).toHaveFocus()
    expect([getComputedStyle(toggle()).outlineStyle, getComputedStyle(toggle()).outlineWidth, getComputedStyle(toggle()).outlineOffset]).toEqual(['solid', '2px', '2px'])
  })

  const ring = unlessWebkit('forcedColors') ? it : it.skip

  ring('keeps the ring of the button visible in forced colors', async () => {
    renderInBrowser(stage(<DatePicker label="Data" />))
    await setForcedColors('active')
    await userEvent.tab()
    await userEvent.tab()

    expect(toggle()).toHaveFocus()
    expect(getComputedStyle(toggle()).outlineStyle).toBe('solid')
    expect(parseFloat(getComputedStyle(toggle()).outlineWidth)).toBeGreaterThanOrEqual(2)
  })
})

describe('DatePicker inside a modal in a real browser', () => {
  it('opens above the modal with the focus on its day, and closes with Escape before the modal does', async () => {
    renderInBrowser(
      <Modal isOpen onClose={() => undefined} title="Agenda">
        <DatePicker label="Data" defaultValue="2026-10-15" />
      </Modal>
    )
    await open()
    await expect.poll(() => document.activeElement).toBe(dayOf('2026-10-15'))

    const box = rect(dayOf('2026-10-15'))

    expect(document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2)?.closest('[data-slot="popover-content"]')).toBe(popup())
    await userEvent.keyboard('{Escape}')
    await closed()

    expect(document.querySelector('[data-slot="modal-dialog"], [role="dialog"]')).not.toBeNull()
    expect(toggle()).toHaveFocus()
  })
})

describe('DatePicker from its hooks', () => {
  it('takes the corners of the field and the look of its messages from their hooks', () => {
    onRoot({ '--enchase-date-picker-control-radius': '11px', '--enchase-date-picker-error-font-size': '15px', '--enchase-date-picker-error-font-weight': '650', '--enchase-date-picker-helper-font-size': '13px' })
    renderInBrowser(
      <>
        <DatePicker label="Data" error="Errado" />
        <DatePicker label="Outra" helperText="Dica" />
      </>
    )

    expect([style('date-picker-outline').borderTopLeftRadius, style('date-picker-input').borderTopLeftRadius]).toEqual(['11px', '11px'])
    expect([style('date-picker-error').fontSize, style('date-picker-error').fontWeight, style('date-picker-helper').fontSize]).toEqual(['15px', '650', '13px'])
  })

  it('takes the colors and the corners of the button from their hooks', async () => {
    onRoot({ '--enchase-date-picker-toggle-color': 'rgb(1, 2, 3)', '--enchase-date-picker-toggle-color-hover': 'rgb(4, 5, 6)', '--enchase-date-picker-toggle-radius': '9px' })
    renderInBrowser(
      <>
        <DatePicker label="Data" />
        <DatePicker label="Outra" disabled />
      </>
    )

    expect([style('date-picker-toggle').color, style('date-picker-toggle').borderTopLeftRadius]).toEqual(['rgb(1, 2, 3)', '9px'])

    await userEvent.hover(part('date-picker-toggle'))

    await expect.poll(() => style('date-picker-toggle').color).toBe('rgb(4, 5, 6)')

    onRoot({ '--enchase-date-picker-toggle-color-disabled': 'rgb(7, 8, 9)' })

    await expect.poll(() => style('date-picker-toggle', 1).color).toBe('rgb(7, 8, 9)')
  })

  it('eases the color of the field for as long as its hooks say', () => {
    onRoot({ '--enchase-date-picker-duration': '0.4s', '--enchase-date-picker-ease': 'linear' })
    renderInBrowser(stage(<DatePicker label="Data" />), 'auto')
    const list = (value: string) => value.split(',').map((item) => item.trim())

    expect(list(style('date-picker-label').transitionDuration)).toEqual(['0.4s', '0.4s'])
    expect(list(style('date-picker-label').transitionTimingFunction)).toEqual(['linear', 'linear'])
    expect(style('date-picker-outline').transitionDuration).toBe('0.4s')
    expect(getComputedStyle(part('date-picker-outline').querySelector('legend') as Element).transitionDuration).toBe('0.4s')
    expect(list(style('date-picker-toggle').transitionDuration)).toEqual(['0.4s', '0.4s'])
    expect(list(style('date-picker-toggle').transitionTimingFunction)).toEqual(['linear', 'linear'])
  })

})

describe('the language of its own of the DatePicker in a real browser', () => {
  it('writes the date in the order of the tag of the prop, and reads what is typed in that order', async () => {
    renderInBrowser(stage(<DatePicker label="Date" locale="en" defaultValue="2026-10-28" />))

    expect(field()).toHaveValue('10/28/2026')

    await userEvent.click(field())
    await userEvent.keyboard('{Control>}a{/Control}01022027')
    await userEvent.tab()

    expect(field()).toHaveValue('01/02/2027')

    await open()
    await expect.poll(() => document.activeElement).toBe(dayOf('2027-01-02'))
  })

  it('writes the date with the separators and the order of the tag of the prop', () => {
    const { unmount } = renderInBrowser(stage(<DatePicker label="Date" locale="en-CA" defaultValue="2026-10-28" />))

    expect(field()).toHaveValue('2026-10-28')
    unmount()
    renderInBrowser(stage(<DatePicker label="Date" locale="de" defaultValue="2026-10-28" />))

    expect(field()).toHaveValue('28.10.2026')
  })

  it('names the calendar and starts its week with the tag of the prop, and keeps the labels of the provider', async () => {
    renderInBrowser(stage(<DatePicker label="Date" locale="en-GB" defaultValue="2026-10-28" />))
    await open()

    const columns = [...(popup() as HTMLElement).querySelectorAll('[data-slot="date-picker-calendar-weekday"]')].map((header) => header.getAttribute('abbr'))

    expect(columns).toEqual(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
    expect(popup()?.querySelector('[role="grid"]')).toHaveAccessibleName('October 2026')
    expect(popup()).toHaveAccessibleName('Escolher data')
  })

  it('starts the week on Sunday for a tag that does, and lets firstDayOfWeek decide otherwise', async () => {
    const { unmount } = renderInBrowser(stage(<DatePicker label="Date" locale="en-CA" defaultValue="2026-10-28" />))
    await open()

    expect(popup()?.querySelector('[data-slot="date-picker-calendar-weekday"]')).toHaveAttribute('abbr', 'Sunday')
    unmount()
    renderInBrowser(stage(<DatePicker label="Date" locale="en-CA" firstDayOfWeek={1} defaultValue="2026-10-28" />))
    await open()

    expect(popup()?.querySelector('[data-slot="date-picker-calendar-weekday"]')).toHaveAttribute('abbr', 'Monday')
  })
})
