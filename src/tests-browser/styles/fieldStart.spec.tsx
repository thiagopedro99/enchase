import { afterEach, describe, expect, it } from 'vitest'

import { renderInBrowser } from '../support/harness.tsx'
import { fieldKinds } from '../support/fields.tsx'
import { onRoot, part } from '../support/hookProbes.ts'

import type { FieldKind, FieldTestProps } from '../support/fields.tsx'
import type { FieldVariant } from '@styles/tokens/types.ts'
import type { CSSProperties } from 'react'

afterEach(() => {
  document.documentElement.removeAttribute('style')
})

const column = 144

const gap = 8

const variants: FieldVariant[] = ['outlined', 'filled', 'borderless', 'underlined']

const stage = (kind: FieldKind, fields: FieldTestProps[], style: Record<string, string> = {}) =>
  renderInBrowser(
    <div style={style as CSSProperties}>
      {fields.map((props, index) => (
        <div key={index}>{kind.render({ labelPlacement: 'start', ...props })}</div>
      ))}
    </div>
  )

const measure = (kind: FieldKind, index = 0) => ({
  wrapper: part(kind.name, index).getBoundingClientRect(),
  label: part(`${kind.name}-label`, index).getBoundingClientRect(),
  control: part(`${kind.name}-control`, index).getBoundingClientRect()
})

const textRect = (element: Element) => {
  const range = document.createRange()

  range.selectNodeContents(element)

  return range.getBoundingClientRect()
}

const middle = (box: DOMRect) => box.top + box.height / 2

describe.each(fieldKinds)('the label at the start of the $name field', (kind) => {
  const hook = { '--enchase-input-label-width': '9rem' }

  it('puts the label before the control on the same line, ending on the edge of its column, with the control after the gap', () => {
    stage(kind, [{ label: 'Name' }], hook)

    const { wrapper, label, control } = measure(kind)

    expect(label.left).toBeCloseTo(wrapper.left, 0)
    expect(label.right).toBeCloseTo(wrapper.left + column, 0)
    expect(control.left).toBeCloseTo(wrapper.left + column + gap, 0)
    expect(control.right).toBeCloseTo(wrapper.right, 0)
    expect(label.top).toBeGreaterThanOrEqual(control.top - 0.5)
    expect(label.bottom).toBeLessThanOrEqual(control.bottom + 0.5)
    expect(textRect(part(`${kind.name}-label`)).right).toBeCloseTo(label.right, 0)
  })

  it('does not float the label, and draws no notch', () => {
    stage(kind, [{ label: 'Name' }], hook)

    expect(getComputedStyle(part(`${kind.name}-label`)).position).toBe('static')
    expect(part(kind.native).hasAttribute('data-has-label')).toBe(false)
    expect(part(`${kind.name}-outline`).hasAttribute('data-has-label')).toBe(false)
  })

  it('starts the controls of fields with labels of different sizes at the same place', () => {
    stage(kind, [{ label: 'Name' }, { label: 'A longer label than the others' }, { label: 'Amount' }], hook)

    for (const index of [0, 1, 2]) {
      const { wrapper, label, control } = measure(kind, index)

      expect(label.right - wrapper.left, `label ${index}`).toBeCloseTo(column, 0)
      expect(control.left - wrapper.left, `control ${index}`).toBeCloseTo(column + gap, 0)
    }
  })

  it('centers the label, even a wrapped one, on the height of the control', () => {
    stage(kind, [{ label: 'Name' }, { label: 'A longer label than the others' }], hook)

    for (const index of [0, 1]) {
      const { label, control } = measure(kind, index)

      expect(middle(label), `label ${index}`).toBeCloseTo(middle(control), 0)
    }

    expect(measure(kind, 1).label.height).toBeGreaterThan(measure(kind, 0).label.height)
    expect(measure(kind, 1).label.right).toBeLessThanOrEqual(measure(kind, 1).wrapper.left + column + 0.5)
  })

  it('puts the error and the helper text under the control, on its edge, without moving the label', () => {
    stage(kind, [{ label: 'Name', error: 'Wrong' }, { label: 'Other', helperText: 'Help' }], hook)

    const alone = measure(kind, 0)
    const error = part(`${kind.name}-error`).getBoundingClientRect()
    const helper = part(`${kind.name}-helper`).getBoundingClientRect()

    expect(error.top).toBeGreaterThanOrEqual(alone.control.bottom - 0.5)
    expect(error.left).toBeCloseTo(alone.control.left, 0)
    expect(helper.top).toBeGreaterThanOrEqual(measure(kind, 1).control.bottom - 0.5)
    expect(helper.left).toBeCloseTo(measure(kind, 1).control.left, 0)
    expect(middle(alone.label)).toBeCloseTo(middle(alone.control), 0)
  })

  it('takes the width of the column from the hook of the container, falls back to 7.5rem, and lets one field set its own', () => {
    const bare = stage(kind, [{ label: 'Name' }])

    expect(measure(kind).label.right - measure(kind).wrapper.left).toBeCloseTo(120, 0)
    bare.unmount()

    const scoped = stage(kind, [{ label: 'Name' }, { label: 'Other', wrapperStyle: { '--enchase-input-label-width': '5rem' } as CSSProperties }], hook)

    expect(measure(kind, 0).control.left - measure(kind, 0).wrapper.left).toBeCloseTo(column + gap, 0)
    expect(measure(kind, 1).control.left - measure(kind, 1).wrapper.left).toBeCloseTo(80 + gap, 0)
    scoped.unmount()
    onRoot({ '--enchase-input-label-width': '10rem' })
    stage(kind, [{ label: 'Name' }])

    expect(measure(kind).control.left - measure(kind).wrapper.left).toBeCloseTo(160 + gap, 0)
  })

  it('mirrors in right to left: the column of the label goes to the right and the text ends on its left edge', () => {
    document.documentElement.dir = 'rtl'
    stage(kind, [{ label: 'Name' }, { label: 'Other label' }], hook)

    for (const index of [0, 1]) {
      const { wrapper, label, control } = measure(kind, index)

      expect(label.right, `label ${index}`).toBeCloseTo(wrapper.right, 0)
      expect(label.left, `label ${index}`).toBeCloseTo(wrapper.right - column, 0)
      expect(control.right, `control ${index}`).toBeCloseTo(wrapper.right - column - gap, 0)
      expect(control.left, `control ${index}`).toBeCloseTo(wrapper.left, 0)
      expect(textRect(part(`${kind.name}-label`, index)).left, `text ${index}`).toBeCloseTo(label.left, 0)
    }
  })

  it.each(variants)('keeps the same layout in the %s variant', (variant) => {
    stage(kind, [{ label: 'Name', variant }], hook)

    const { wrapper, label, control } = measure(kind)

    expect(label.right).toBeCloseTo(wrapper.left + column, 0)
    expect(control.left).toBeCloseTo(wrapper.left + column + gap, 0)
    expect(middle(label)).toBeCloseTo(middle(control), 0)
    expect(getComputedStyle(part(`${kind.name}-label`)).position).toBe('static')
  })

  it('keeps a field without a label in the column of the controls', () => {
    stage(kind, [{ label: '' }], hook)

    expect(part(`${kind.name}-label`)).toBeUndefined()
    expect(part(`${kind.name}-control`).getBoundingClientRect().left - part(kind.name).getBoundingClientRect().left).toBeCloseTo(column + gap, 0)
  })

  it('leaves the stacked and the floating layouts as they are: the label above the control, or inside it', () => {
    renderInBrowser(
      <div style={hook as CSSProperties}>
        {kind.render({ labelPlacement: 'stacked' })}
        {kind.render({ labelPlacement: 'floating' })}
      </div>
    )

    const stacked = measure(kind, 0)
    const floating = measure(kind, 1)

    expect(stacked.label.bottom).toBeLessThanOrEqual(stacked.control.top + 0.5)
    expect(stacked.control.left).toBeCloseTo(stacked.wrapper.left, 0)
    expect(getComputedStyle(part(kind.name, 0)).display).toBe('flex')
    expect(getComputedStyle(part(`${kind.name}-label`, 1)).position).toBe('absolute')
    expect(floating.control.left).toBeCloseTo(floating.wrapper.left, 0)
  })
})
