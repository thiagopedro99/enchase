import { describe, expect, it } from 'vitest'

import { Input } from '@components/common/Input/index.tsx'
import { NumberInput } from '@components/common/NumberInput/index.tsx'
import { Select } from '@components/common/Select/index.tsx'
import { Textarea } from '@components/common/Textarea/index.tsx'
import { renderInBrowser } from './harness.tsx'
import { waitForSettled } from './settle.ts'

import type { CSSProperties, ReactNode } from 'react'

const options = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' }
]

const scoped = (style: Record<string, string>, children: ReactNode) => <div style={style as CSSProperties}>{children}</div>

const part = (name: string) => document.body.querySelector(`[data-slot="${name}"]`) as HTMLElement

const fieldOf = (name: string) => part(`${name}-field`)

const labelOf = (name: string) => part(`${name}-label`)

const names = ['input', 'number-input', 'select', 'textarea']

const all = (
  <>
    <Input label="Name" />
    <NumberInput label="Amount" defaultValue={1} />
    <Select label="Plan" options={options} />
    <Textarea label="Notes" />
  </>
)

const translation = (element: Element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).f

const raise = (label: HTMLElement) => translation(label) + label.offsetHeight / 2

describe('the text box of the fields from the hooks', () => {
  it('keeps the 200px width, the 1rem padding and the 1rem text of every field', () => {
    renderInBrowser(all)

    expect(
      names.map((name) => {
        const style = getComputedStyle(fieldOf(name))

        return [style.minWidth, style.paddingLeft, style.fontSize]
      })
    ).toEqual([
      ['200px', '16px', '16px'],
      ['200px', '16px', '16px'],
      ['200px', '16px', '16px'],
      ['200px', '16px', '16px']
    ])
  })

  it('takes the width, the padding and the font size of every field from the same three hooks', () => {
    renderInBrowser(scoped({ '--enchase-input-min-width': '120px', '--enchase-input-padding-inline': '12px', '--enchase-input-font-size': '14px' }, all))

    expect(
      names.map((name) => {
        const style = getComputedStyle(fieldOf(name))

        return [style.minWidth, style.paddingLeft, style.fontSize]
      })
    ).toEqual([
      ['120px', '12px', '14px'],
      ['120px', '12px', '14px'],
      ['120px', '12px', '14px'],
      ['120px', '12px', '14px']
    ])
  })

  it('moves the label with the padding of the text, so the two stay aligned', () => {
    renderInBrowser(scoped({ '--enchase-input-padding-inline': '6px' }, all))

    expect(names.map((name) => getComputedStyle(labelOf(name)).left)).toEqual(['6px', '6px', '6px', '6px'])
  })

  it('keeps a long label inside the field with the padding of the text on both sides', () => {
    const label = 'A label long enough to run past the edge of the field it floats over'
    const narrow = (style: Record<string, string>) =>
      scoped(
        style,
        <div style={{ inlineSize: '300px' }}>
          <Input label={label} />
          <NumberInput label={label} defaultValue={1} steppers={false} />
          <Textarea label={label} />
        </div>
      )
    const widths = () => ['input', 'number-input', 'textarea'].map((name) => labelOf(name).offsetWidth)

    renderInBrowser(narrow({}))
    expect(widths()).toEqual([268, 268, 268])

    document.body.innerHTML = ''
    renderInBrowser(narrow({ '--enchase-input-padding-inline': '8px' }))
    expect(widths()).toEqual([284, 284, 284])
  })

  it('keeps the room of the select for its arrow whatever the padding of the text', () => {
    renderInBrowser(scoped({ '--enchase-input-padding-inline': '6px' }, <Select label="Plan" options={options} />))

    const style = getComputedStyle(fieldOf('select'))

    expect([style.paddingLeft, style.paddingRight]).toEqual(['6px', '44px'])
  })

  it('takes the vertical padding of the textarea from its own hook and keeps the label at the first line', () => {
    renderInBrowser(<Textarea label="Notes" />)

    expect([getComputedStyle(fieldOf('textarea')).paddingTop, translation(labelOf('textarea'))]).toEqual(['16px', 16])

    document.body.innerHTML = ''
    renderInBrowser(scoped({ '--enchase-textarea-padding-block': '8px' }, <Textarea label="Notes" />))

    expect([getComputedStyle(fieldOf('textarea')).paddingTop, translation(labelOf('textarea'))]).toEqual(['8px', 8])
  })
})

describe('the floating label from the height of the field', () => {
  it('lifts the label by half of the height of the field, 28px for the 3.5rem it has by default', async () => {
    renderInBrowser(
      <>
        <Input label="Name" />
        <Select label="Plan" options={options} />
      </>
    )
    ;(fieldOf('input') as HTMLInputElement).focus()
    await waitForSettled(() => labelOf('input'))

    expect(raise(labelOf('input'))).toBeCloseTo(-28, 1)

    ;(fieldOf('select') as HTMLSelectElement).focus()
    await waitForSettled(() => labelOf('select'))

    expect(raise(labelOf('select'))).toBeCloseTo(-28, 1)
  })

  it('lifts the label by half of the new height when the height of the field changes', async () => {
    renderInBrowser(
      scoped(
        { '--enchase-input-height': '4rem' },
        <>
          <Input label="Name" />
          <NumberInput label="Amount" defaultValue={1} />
          <Select label="Plan" options={options} />
        </>
      )
    )

    for (const name of ['input', 'number-input', 'select']) {
      ;(fieldOf(name) as HTMLElement).focus()
      await waitForSettled(() => labelOf(name))

      expect(fieldOf(name).offsetHeight, name).toBe(64)
      expect(raise(labelOf(name)), name).toBeCloseTo(-32, 1)
    }
  })
})

describe('the room of the buttons inside a field from the target size', () => {
  const room = (name: string) => getComputedStyle(fieldOf(name)).paddingRight

  it('keeps 56px for the button of the password and 100px for the steppers of the number field', () => {
    renderInBrowser(
      <>
        <Input label="Password" type="password" />
        <NumberInput label="Amount" defaultValue={1} />
      </>
    )

    expect([room('input'), room('number-input')]).toEqual(['56px', '100px'])
  })

  it('grows the room with the target size, so a bigger button does not cover the text', () => {
    renderInBrowser(
      scoped(
        { '--enchase-hit-size': '48px' },
        <>
          <Input label="Password" type="password" />
          <NumberInput label="Amount" defaultValue={1} />
        </>
      )
    )

    expect([room('input'), room('number-input')]).toEqual(['64px', '116px'])
    expect(part('input-toggle').offsetWidth).toBe(48)
    expect(part('number-input-increase').offsetWidth).toBe(48)
  })

  it('keeps the same room next to the 24px floor, whatever the token says', () => {
    renderInBrowser(
      scoped(
        { '--enchase-hit-size': '4px' },
        <>
          <Input label="Password" type="password" />
          <NumberInput label="Amount" defaultValue={1} />
        </>
      )
    )

    expect([room('input'), room('number-input')]).toEqual(['40px', '68px'])
  })

  it('keeps a long label of the number field away from the steppers, and follows the target size', () => {
    const label = 'A label long enough to run under the steppers of the field'
    const narrow = (style: Record<string, string>) => scoped(style, <div style={{ inlineSize: '300px' }}><NumberInput label={label} defaultValue={1} /></div>)

    renderInBrowser(narrow({}))
    expect(labelOf('number-input').offsetWidth).toBe(188)

    document.body.innerHTML = ''
    renderInBrowser(narrow({ '--enchase-hit-size': '48px' }))
    expect(labelOf('number-input').offsetWidth).toBe(172)

    document.body.innerHTML = ''
    renderInBrowser(narrow({ '--enchase-input-padding-inline': '8px' }))
    expect(labelOf('number-input').offsetWidth).toBe(204)
  })
})
