import { afterEach, describe, expect, it } from 'vitest'

import { contrastRatio } from '@styles/theme/contrast.ts'
import { at, hooked, onRoot, part } from '../support/hookProbes.ts'
import { renderInBrowser } from '../support/harness.tsx'
import { waitForSettled } from '../support/settle.ts'
import { fieldKinds } from '../support/fields.tsx'

import type { FieldKind } from '../support/fields.tsx'

afterEach(() => {
  document.documentElement.removeAttribute('style')
})

const placements = ['floating', 'stacked', 'start'] as const

const resolved = (role: string) => {
  const probe = document.createElement('i')

  probe.style.setProperty('color', `var(--enchase-color-${role})`)
  document.body.append(probe)

  const result = getComputedStyle(probe).color

  probe.remove()

  return result
}

const textRect = (node: Node) => {
  const range = document.createRange()

  range.selectNodeContents(node)

  return range.getBoundingClientRect()
}

const markOf = (kind: FieldKind, index = 0) => part(`${kind.name}-required`, index)

const notchOf = (kind: FieldKind) => (part(`${kind.name}-outline`).querySelector('legend span') as HTMLElement).getBoundingClientRect()

const settle = async (kind: FieldKind) => {
  getComputedStyle(part(`${kind.name}-label`)).getPropertyValue('transform')

  await waitForSettled(at(kind.name))
}

describe.each(fieldKinds)('the required mark of the $name field', (kind) => {
  it.each(placements)('draws a star after the text of the label in the %s placement, in the error color, 4px away from the text', (labelPlacement) => {
    renderInBrowser(kind.render({ required: true, labelPlacement }))

    const mark = markOf(kind)
    const label = part(`${kind.name}-label`)
    const text = textRect(label.firstChild as Node)

    expect(getComputedStyle(mark, '::after').content).toContain('*')
    expect(getComputedStyle(mark).color).toBe(resolved('error'))
    expect(getComputedStyle(mark).marginLeft).toBe('4px')
    expect(mark.getBoundingClientRect().width).toBeGreaterThan(0)
    expect(mark.getBoundingClientRect().left - text.right).toBeCloseTo(4 * new DOMMatrixReadOnly(getComputedStyle(label).transform).a, 0)
  })

  it('draws nothing without the prop, and nothing without a label', () => {
    const plain = renderInBrowser(kind.render())

    expect(markOf(kind)).toBeUndefined()
    plain.unmount()
    renderInBrowser(kind.render({ required: true, label: '' }))

    expect(markOf(kind)).toBeUndefined()
  })

  it('takes the color of the mark from its hook', () => {
    hooked([['--enchase-input-required-color', 'rgb(1, 2, 3)', at(`${kind.name}-required`), 'color']], kind.render({ required: true }))
  })

  it('takes the space between the text and the mark from its hook', () => {
    hooked([['--enchase-input-required-gap', '13px', at(`${kind.name}-required`), 'margin-left']], kind.render({ required: true }))
  })

  it('hides the mark when the display hook says none, and keeps the star in the style of the mark otherwise', () => {
    onRoot({ '--enchase-input-required-display': 'none' })

    const hidden = renderInBrowser(kind.render({ required: true }))

    expect(getComputedStyle(markOf(kind)).display).toBe('none')
    expect(markOf(kind).getBoundingClientRect().width).toBe(0)
    hidden.unmount()
    document.documentElement.removeAttribute('style')
    renderInBrowser(kind.render({ required: true }))

    expect(getComputedStyle(markOf(kind)).display).toBe('inline')
  })

  it('makes the notch of the floating label wide enough to cover the star, so the outline does not pass under it', async () => {
    renderInBrowser(kind.render({ required: true, labelPlacement: 'floating' }))
    part(kind.native).focus()
    await settle(kind)

    const mark = markOf(kind).getBoundingClientRect()
    const notch = notchOf(kind)

    expect(mark.width).toBeGreaterThan(0)
    expect(mark.left).toBeGreaterThanOrEqual(notch.left)
    expect(mark.right).toBeLessThanOrEqual(notch.right - 8 + 1)
  })

  it('makes the notch of the floating label wider by the star and its gap than the one of a field that is not required', async () => {
    const plain = renderInBrowser(kind.render({ labelPlacement: 'floating' }))

    part(kind.native).focus()
    await settle(kind)

    const without = notchOf(kind).width

    plain.unmount()
    renderInBrowser(kind.render({ required: true, labelPlacement: 'floating' }))
    part(kind.native).focus()
    await settle(kind)

    expect(notchOf(kind).width - without).toBeGreaterThanOrEqual(4 + 4)
    expect(notchOf(kind).width - without).toBeLessThanOrEqual(4 + 12)
  })

  it('takes nothing from the notch when the mark is hidden', async () => {
    const plain = renderInBrowser(kind.render({ labelPlacement: 'floating' }))

    part(kind.native).focus()
    await settle(kind)

    const without = notchOf(kind).width

    plain.unmount()
    onRoot({ '--enchase-input-required-display': 'none' })
    renderInBrowser(kind.render({ required: true, labelPlacement: 'floating' }))
    part(kind.native).focus()
    await settle(kind)

    expect(notchOf(kind).width).toBeCloseTo(without, 0)
  })
})

describe.each(['light', 'dark'] as const)('the required mark in the %s mode', (mode) => {
  it('keeps the star at 4.5:1 or more against the page', () => {
    renderInBrowser(fieldKinds[0].render({ required: true, labelPlacement: 'stacked' }), 'never', mode)

    expect(contrastRatio(getComputedStyle(markOf(fieldKinds[0])).color, resolved('background'))).toBeGreaterThanOrEqual(4.5)
  })
})
