import { afterEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { useState } from 'react'

import { builtInStyleEntries } from '@tests/shared/fixtures/styles.ts'
import { onRoot, part, style } from '../../../support/hookProbes.ts'
import { renderInBrowser } from '../../../support/harness.tsx'
import { Switch } from '@components/common/Switch/index.tsx'
import { contrastRatio } from '@styles/theme/contrast.ts'

import type { ReactElement } from 'react'

const typography = { enchase: { size: 12, weight: '500' }, shadcn: { size: 14, weight: '400' }, workbench: { size: 12, weight: '500' } } as const

const surfaces = ['surface', 'background'] as const

const surface = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(`--enchase-color-${name}`).trim()

const rect = (name: string, index = 0) => part(name, index).getBoundingClientRect()

const column = (...children: ReactElement[]) => <div style={{ display: 'grid', justifyItems: 'start', gap: '1.5rem' }}>{children}</div>

const Validating = () => {
  const [error, setError] = useState<string | undefined>(undefined)

  return (
    <>
      <button type="button" onClick={() => setError('Turn notifications on to continue')}>
        Fail
      </button>
      <Switch label="Receive notifications" error={error} onChange={(event) => setError(event.target.checked ? undefined : 'Turn notifications on to continue')} />
    </>
  )
}

afterEach(() => {
  document.documentElement.removeAttribute('style')
})

describe.each(builtInStyleEntries)('the messages of the Switch in the %s style', (styleName, themeStyle) => {
  const show = (ui: ReactElement, mode: 'light' | 'dark' = 'light') => renderInBrowser(ui, 'never', mode, { style: themeStyle })

  const messages = column(<Switch key="error" label="With error" error="Turn notifications on to continue" />, <Switch key="helper" label="With helper" helperText="One summary a day, no spam" />)

  it('puts the error and the helper text under the text of the label, aligned with it and not under the track', () => {
    show(messages)

    for (const [index, name] of ['switch-error', 'switch-helper'].entries()) {
      expect(rect(name).left, `${name} against the text`).toBeCloseTo(rect('switch-label', index).left, 1)
      expect(rect(name).left, `${name} against the track`).toBeGreaterThanOrEqual(rect('switch-track', index).right)
      expect(rect(name).top, `${name} against the label`).toBeGreaterThanOrEqual(rect('switch', index).bottom)
    }
  })

  it('leaves 4px between the label and the message, and keeps the target of the label at its height', () => {
    show(messages)

    expect(rect('switch-error').top - rect('switch').bottom).toBeCloseTo(4, 1)
    expect(rect('switch').height).toBeGreaterThanOrEqual(24)
  })

  it('mirrors in a page that reads from right to left, so the message lines up with the end of the text of the label', () => {
    document.documentElement.setAttribute('dir', 'rtl')
    show(messages)

    for (const [index, name] of ['switch-error', 'switch-helper'].entries()) {
      expect(rect(name).right, `${name} against the text`).toBeCloseTo(rect('switch-label', index).right, 1)
      expect(rect(name).right, `${name} against the track`).toBeLessThanOrEqual(rect('switch-track', index).left)
      expect(rect(name).top, `${name} against the label`).toBeGreaterThanOrEqual(rect('switch', index).bottom)
    }
  })

  it.each(['ltr', 'rtl'] as const)('has no box of its own without a message, and the label takes the very same box as if it was not inside the field, in %s text', (dir) => {
    document.documentElement.setAttribute('dir', dir)
    show(
      <div style={{ inlineSize: 240, padding: 12 }}>
        <Switch label="Plain" wrapperStyle={{ margin: 12 }} />
      </div>
    )
    const field = part('switch-field')
    const label = part('switch')
    const inside = label.getBoundingClientRect()
    const empty = field.getBoundingClientRect()

    expect(style('switch-field').display).toBe('contents')
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

    expect([style('switch-error').fontSize, style('switch-error').fontWeight, style('switch-helper').fontSize]).toEqual([`${size}px`, weight, `${size}px`])
  })

  it.each(['light', 'dark'] as const)('keeps the message readable on the page in the %s mode', (mode) => {
    show(messages, mode)

    for (const name of surfaces) {
      expect(contrastRatio(style('switch-error').color, surface(name)), `error on ${name}`).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(style('switch-helper').color, surface(name)), `helper on ${name}`).toBeGreaterThanOrEqual(4.5)
    }
  })
})

describe('the messages of the Switch from the hooks', () => {
  it('takes the indent from the width of the track and the gap of the label, so it keeps following the text of the label', () => {
    onRoot({ '--enchase-switch-track-width': '80px', '--enchase-switch-gap': '10px' })
    renderInBrowser(<Switch label="Alerts" error="Required" />)

    expect(rect('switch-error').left - rect('switch').left).toBeCloseTo(90, 1)
    expect(rect('switch-error').left).toBeCloseTo(rect('switch-label').left, 1)
  })

  it('takes the gap to the label, and the size and the weight of the text, from their hooks', () => {
    onRoot({ '--enchase-switch-field-gap': '9px', '--enchase-switch-error-font-size': '15px', '--enchase-switch-error-font-weight': '650', '--enchase-switch-helper-font-size': '13px' })
    renderInBrowser(column(<Switch key="error" label="With error" error="Required" />, <Switch key="helper" label="With helper" helperText="Help" />))

    expect(rect('switch-error').top - rect('switch').bottom).toBeCloseTo(9, 1)
    expect([style('switch-error').fontSize, style('switch-error').fontWeight, style('switch-helper').fontSize]).toEqual(['15px', '650', '13px'])
  })

  it('takes the colors from the hooks that the fields share', () => {
    onRoot({ '--enchase-input-error-color': 'rgb(1, 2, 3)', '--enchase-input-helper-color': 'rgb(4, 5, 6)' })
    renderInBrowser(column(<Switch key="error" label="With error" error="Required" />, <Switch key="helper" label="With helper" helperText="Help" />))

    expect([style('switch-error').color, style('switch-helper').color]).toEqual(['rgb(1, 2, 3)', 'rgb(4, 5, 6)'])
  })
})

describe('the messages of the Switch in a real browser', () => {
  it('gives the label the same layout with and without a message, so the field adds nothing to it', () => {
    renderInBrowser(column(<Switch key="plain" label="Plain" />, <Switch key="described" label="Described" helperText="Help" />))
    const [plain, described] = [0, 1].map((index) => style('switch', index))

    for (const property of ['display', 'align-items', 'column-gap', 'min-block-size', 'min-inline-size', 'max-inline-size', 'cursor', 'user-select', 'position']) {
      expect(described.getPropertyValue(property), property).toBe(plain.getPropertyValue(property))
    }

    expect(rect('switch', 1).height).toBe(rect('switch', 0).height)
    expect(rect('switch-track', 1).width).toBe(rect('switch-track', 0).width)
  })

  it('keeps an inline switch inline: the field takes the place of the label in a line of text, with or without a message', () => {
    renderInBrowser(
      <p>
        <Switch label="First" />
        <Switch label="Second" error="Required" />
      </p>
    )

    expect([style('switch-field', 0).display, style('switch-field', 1).display]).toEqual(['contents', 'inline-flex'])
    expect(Math.abs(rect('switch', 0).top - rect('switch', 1).top)).toBeLessThan(1)
  })

  it('does not toggle the switch when the message is clicked, and does not show the pointer of the label on it', async () => {
    renderInBrowser(<Switch label="Receive notifications" error="Turn notifications on to continue" />)
    const input = page.getByRole('switch').element() as HTMLInputElement

    expect(style('switch-error').cursor).not.toBe('pointer')
    expect(style('switch-error').userSelect).not.toBe('none')

    await userEvent.click(part('switch-error'))
    expect(input.checked).toBe(false)

    await userEvent.click(page.getByText('Receive notifications'))
    expect(input.checked).toBe(true)
  })

  it('breaks a label and a message that have no room to wrap instead of overflowing the container', () => {
    const word = 'Benachrichtigungseinstellungsverwaltungsseite'

    renderInBrowser(
      <div style={{ inlineSize: 140 }}>
        <Switch label={word} error={`${word} is not valid`} />
      </div>
    )
    const container = part('switch-field').parentElement as HTMLElement

    expect(container.scrollWidth).toBeLessThanOrEqual(container.clientWidth)
    expect(rect('switch-field').width).toBeLessThanOrEqual(140)
    expect(rect('switch').width).toBeLessThanOrEqual(140)
    expect(rect('switch-error').right).toBeLessThanOrEqual(container.getBoundingClientRect().right)
  })

  it('keeps the input and its focus when the error goes away after the switch is turned on with the keyboard', async () => {
    renderInBrowser(<Validating />)

    await userEvent.click(page.getByRole('button', { name: 'Fail' }))
    expect(part('switch-error')).toBeDefined()

    await userEvent.tab()
    const input = page.getByRole('switch').element()

    expect(document.activeElement).toBe(input)

    await userEvent.keyboard(' ')

    expect(part('switch-error')).toBeUndefined()
    expect(page.getByRole('switch').element()).toBe(input)
    expect(document.activeElement).toBe(input)
    expect((input as HTMLInputElement).checked).toBe(true)
  })
})
