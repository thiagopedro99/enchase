import { afterEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { useState } from 'react'

import { builtInStyleEntries } from '@tests/shared/fixtures/styles.ts'
import { onRoot, part, style } from '../../../support/hookProbes.ts'
import { Checkbox } from '@components/common/Checkbox/index.tsx'
import { renderInBrowser } from '../../../support/harness.tsx'
import { contrastRatio } from '@styles/theme/contrast.ts'

import type { ReactElement } from 'react'

const typography = { enchase: { size: 12, weight: '500' }, shadcn: { size: 14, weight: '400' } } as const

const surfaces = ['surface', 'background'] as const

const surface = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(`--enchase-color-${name}`).trim()

const rect = (name: string, index = 0) => part(name, index).getBoundingClientRect()

const column = (...children: ReactElement[]) => <div style={{ display: 'grid', justifyItems: 'start', gap: '1.5rem' }}>{children}</div>

const Validating = () => {
  const [error, setError] = useState<string | undefined>(undefined)

  return (
    <>
      <button type="button" onClick={() => setError('Accept the terms to continue')}>
        Fail
      </button>
      <Checkbox label="Accept the terms" error={error} onChange={(event) => setError(event.target.checked ? undefined : 'Accept the terms to continue')} />
    </>
  )
}

afterEach(() => {
  document.documentElement.removeAttribute('style')
})

describe.each(builtInStyleEntries)('the messages of the Checkbox in the %s style', (styleName, themeStyle) => {
  const show = (ui: ReactElement, mode: 'light' | 'dark' = 'light') => renderInBrowser(ui, 'never', mode, { style: themeStyle })

  const messages = column(<Checkbox key="error" label="With error" error="Accept the terms to continue" />, <Checkbox key="helper" label="With helper" helperText="You can read them first" />)

  it('puts the error and the helper text under the text of the label, aligned with it and not under the box', () => {
    show(messages)

    for (const [index, name] of ['checkbox-error', 'checkbox-helper'].entries()) {
      expect(rect(name).left, `${name} against the text`).toBeCloseTo(rect('checkbox-label', index).left, 1)
      expect(rect(name).left, `${name} against the box`).toBeGreaterThanOrEqual(rect('checkbox-box', index).right)
      expect(rect(name).top, `${name} against the label`).toBeGreaterThanOrEqual(rect('checkbox', index).bottom)
    }
  })

  it('leaves 4px between the label and the message, and keeps the target of the label at its height', () => {
    show(messages)

    expect(rect('checkbox-error').top - rect('checkbox').bottom).toBeCloseTo(4, 1)
    expect(rect('checkbox').height).toBeGreaterThanOrEqual(24)
  })

  it('mirrors in a page that reads from right to left, so the message lines up with the end of the text of the label', () => {
    document.documentElement.setAttribute('dir', 'rtl')
    show(messages)

    for (const [index, name] of ['checkbox-error', 'checkbox-helper'].entries()) {
      expect(rect(name).right, `${name} against the text`).toBeCloseTo(rect('checkbox-label', index).right, 1)
      expect(rect(name).right, `${name} against the box`).toBeLessThanOrEqual(rect('checkbox-box', index).left)
      expect(rect(name).top, `${name} against the label`).toBeGreaterThanOrEqual(rect('checkbox', index).bottom)
    }
  })

  it.each(['ltr', 'rtl'] as const)('has no box of its own without a message, and the label takes the very same box as if it was not inside the field, in %s text', (dir) => {
    document.documentElement.setAttribute('dir', dir)
    show(
      <div style={{ inlineSize: 240, padding: 12 }}>
        <Checkbox label="Plain" wrapperStyle={{ margin: 12 }} />
      </div>
    )
    const field = part('checkbox-field')
    const label = part('checkbox')
    const inside = label.getBoundingClientRect()
    const empty = field.getBoundingClientRect()

    expect(style('checkbox-field').display).toBe('contents')
    expect([empty.width, empty.height]).toEqual([0, 0])

    field.before(label)
    const outside = label.getBoundingClientRect()
    field.append(label)

    expect([outside.x, outside.y, outside.width, outside.height]).toEqual([inside.x, inside.y, inside.width, inside.height])
    expect(inside.width).toBeGreaterThan(0)
  })

  it('shows the message with the type of the style', () => {
    show(messages)
    const { size, weight } = typography[styleName as keyof typeof typography]

    expect([style('checkbox-error').fontSize, style('checkbox-error').fontWeight, style('checkbox-helper').fontSize]).toEqual([`${size}px`, weight, `${size}px`])
  })

  it.each(['light', 'dark'] as const)('keeps the message readable on the page in the %s mode', (mode) => {
    show(messages, mode)

    for (const name of surfaces) {
      expect(contrastRatio(style('checkbox-error').color, surface(name)), `error on ${name}`).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(style('checkbox-helper').color, surface(name)), `helper on ${name}`).toBeGreaterThanOrEqual(4.5)
    }
  })
})

describe('the messages of the Checkbox from the hooks', () => {
  it('takes the indent from the size of the box and the gap of the label, so it keeps following the text of the label', () => {
    onRoot({ '--enchase-checkbox-box-size': '30px', '--enchase-checkbox-gap': '20px' })
    renderInBrowser(<Checkbox label="Accept" error="Required" />)

    expect(rect('checkbox-error').left - rect('checkbox').left).toBeCloseTo(50, 1)
    expect(rect('checkbox-error').left).toBeCloseTo(rect('checkbox-label').left, 1)
  })

  it('takes the gap to the label, and the size and the weight of the text, from their hooks', () => {
    onRoot({ '--enchase-checkbox-field-gap': '9px', '--enchase-checkbox-error-font-size': '15px', '--enchase-checkbox-error-font-weight': '650', '--enchase-checkbox-helper-font-size': '13px' })
    renderInBrowser(column(<Checkbox key="error" label="With error" error="Required" />, <Checkbox key="helper" label="With helper" helperText="Help" />))

    expect(rect('checkbox-error').top - rect('checkbox').bottom).toBeCloseTo(9, 1)
    expect([style('checkbox-error').fontSize, style('checkbox-error').fontWeight, style('checkbox-helper').fontSize]).toEqual(['15px', '650', '13px'])
  })

  it('takes the colors from the hooks that the fields share', () => {
    onRoot({ '--enchase-input-error-color': 'rgb(1, 2, 3)', '--enchase-input-helper-color': 'rgb(4, 5, 6)' })
    renderInBrowser(column(<Checkbox key="error" label="With error" error="Required" />, <Checkbox key="helper" label="With helper" helperText="Help" />))

    expect([style('checkbox-error').color, style('checkbox-helper').color]).toEqual(['rgb(1, 2, 3)', 'rgb(4, 5, 6)'])
  })
})

describe('the messages of the Checkbox in a real browser', () => {
  it('gives the label the same layout with and without a message, so the field adds nothing to it', () => {
    renderInBrowser(column(<Checkbox key="plain" label="Plain" />, <Checkbox key="described" label="Described" helperText="Help" />))
    const [plain, described] = [0, 1].map((index) => style('checkbox', index))

    for (const property of ['display', 'align-items', 'column-gap', 'min-block-size', 'min-inline-size', 'max-inline-size', 'cursor', 'user-select', 'position']) {
      expect(described.getPropertyValue(property), property).toBe(plain.getPropertyValue(property))
    }

    expect(rect('checkbox', 1).height).toBe(rect('checkbox', 0).height)
    expect(rect('checkbox-box', 1).width).toBe(rect('checkbox-box', 0).width)
  })

  it('keeps an inline checkbox inline: the field takes the place of the label in a line of text, with or without a message', () => {
    renderInBrowser(
      <p>
        <Checkbox label="First" />
        <Checkbox label="Second" error="Required" />
      </p>
    )

    expect([style('checkbox-field', 0).display, style('checkbox-field', 1).display]).toEqual(['contents', 'inline-flex'])
    expect(Math.abs(rect('checkbox', 0).top - rect('checkbox', 1).top)).toBeLessThan(1)
  })

  it('does not check the box when the message is clicked, and does not show the pointer of the label on it', async () => {
    renderInBrowser(<Checkbox label="Accept the terms" error="Accept the terms to continue" />)
    const input = page.getByRole('checkbox').element() as HTMLInputElement

    expect(style('checkbox-error').cursor).not.toBe('pointer')
    expect(style('checkbox-error').userSelect).not.toBe('none')

    await userEvent.click(part('checkbox-error'))
    expect(input.checked).toBe(false)

    await userEvent.click(page.getByText('Accept the terms'))
    expect(input.checked).toBe(true)
  })

  it('breaks a label and a message that have no room to wrap instead of overflowing the container', () => {
    const word = 'Benachrichtigungseinstellungsverwaltungsseite'

    renderInBrowser(
      <div style={{ inlineSize: 140 }}>
        <Checkbox label={word} error={`${word} is not valid`} />
      </div>
    )
    const container = part('checkbox-field').parentElement as HTMLElement

    expect(container.scrollWidth).toBeLessThanOrEqual(container.clientWidth)
    expect(rect('checkbox-field').width).toBeLessThanOrEqual(140)
    expect(rect('checkbox').width).toBeLessThanOrEqual(140)
    expect(rect('checkbox-error').right).toBeLessThanOrEqual(container.getBoundingClientRect().right)
  })

  it('keeps the input and its focus when the error goes away after the box is checked with the keyboard', async () => {
    renderInBrowser(<Validating />)

    await userEvent.click(page.getByRole('button', { name: 'Fail' }))
    expect(part('checkbox-error')).toBeDefined()

    await userEvent.tab()
    const input = page.getByRole('checkbox').element()

    expect(document.activeElement).toBe(input)

    await userEvent.keyboard(' ')

    expect(part('checkbox-error')).toBeUndefined()
    expect(page.getByRole('checkbox').element()).toBe(input)
    expect(document.activeElement).toBe(input)
    expect((input as HTMLInputElement).checked).toBe(true)
  })
})
