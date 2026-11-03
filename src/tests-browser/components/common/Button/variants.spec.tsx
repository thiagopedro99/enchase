import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'

import { Button } from '@components/common/Button/index.tsx'
import { ButtonLink } from '@components/common/ButtonLink/index.tsx'
import { renderInBrowser } from '../../../support/harness.tsx'
import { at, becomes, expectHooks, onRoot, part, setHooks, style } from '../../../support/hookProbes.ts'
import { waitForSettled } from '../../../support/settle.ts'

import type { Probe } from '../../../support/hookProbes.ts'

const button = (index = 0) => part('button', index)

const target = (index = 0) => at('button', index)

const resolved = (property: 'color' | 'boxShadow', value: string) => {
  const probe = document.createElement('span')

  probe.style[property] = value
  document.body.append(probe)

  const result = getComputedStyle(probe)[property]

  probe.remove()

  return result
}

const role = (name: string) => resolved('color', `var(--enchase-color-${name})`)

const look = (index = 0) => {
  const computed = style('button', index)

  return [computed.backgroundColor, computed.borderTopColor, computed.color, computed.boxShadow, computed.minHeight, computed.paddingLeft, computed.paddingTop]
}

const hover = async (index = 0) => {
  await userEvent.hover(button(index))
  await waitForSettled(() => button(index))
}

afterEach(() => {
  document.documentElement.removeAttribute('style')
})

describe('the dashed button in a real browser', () => {
  it('is the outline button with a dashed border, of the same size', () => {
    renderInBrowser(
      <>
        <Button variant="outline">Add</Button>
        <Button variant="dashed">Add</Button>
      </>
    )

    expect(style('button', 0).borderTopStyle).toBe('solid')
    expect(['top', 'right', 'bottom', 'left'].map((side) => style('button', 1).getPropertyValue(`border-${side}-style`))).toEqual(['dashed', 'dashed', 'dashed', 'dashed'])
    expect(look(1)).toEqual(look(0))
    expect(style('button', 1).borderTopColor).toBe(role('border-strong'))
    expect(style('button', 1).color).toBe(role('primary'))
  })

  it('takes the background, the border, the text and the shadow of the outline hooks', () => {
    const probes: Probe[] = [
      ['--enchase-button-background-outline', 'rgb(1, 2, 3)', target(), 'background-color'],
      ['--enchase-button-border-color-outline', 'rgb(4, 5, 6)', target(), 'border-top-color'],
      ['--enchase-button-color-outline', 'rgb(7, 8, 9)', target(), 'color'],
      ['--enchase-button-shadow-outline', '0px 1px 2px 0px rgb(10, 11, 12)', target(), 'box-shadow', resolved('boxShadow', '0px 1px 2px 0px rgb(10, 11, 12)')]
    ]

    setHooks(probes)
    renderInBrowser(<Button variant="dashed">Add</Button>)

    expectHooks(probes)
  })

  it('has a hook for the background, the line, the border color, the text color and the shadow, ahead of the outline hooks', () => {
    const probes: Probe[] = [
      ['--enchase-button-background-dashed', 'rgb(11, 12, 13)', target(), 'background-color'],
      ['--enchase-button-border-style-dashed', 'dotted', target(), 'border-top-style'],
      ['--enchase-button-border-color-dashed', 'rgb(14, 15, 16)', target(), 'border-top-color'],
      ['--enchase-button-color-dashed', 'rgb(17, 18, 19)', target(), 'color'],
      ['--enchase-button-shadow-dashed', '0px 2px 3px 0px rgb(20, 21, 22)', target(), 'box-shadow', resolved('boxShadow', '0px 2px 3px 0px rgb(20, 21, 22)')]
    ]

    onRoot({ '--enchase-button-background-outline': 'rgb(1, 2, 3)', '--enchase-button-color-outline': 'rgb(7, 8, 9)' })
    setHooks(probes)
    renderInBrowser(<Button variant="dashed">Add</Button>)

    expectHooks(probes)
  })

  it('takes the text color under the pointer from its hook, and from the outline hover hook before the theme', async () => {
    onRoot({ '--enchase-button-color-outline-hover': 'rgb(1, 2, 3)' })
    renderInBrowser(<Button variant="dashed">Add</Button>)
    await hover()

    expect(style('button').color).toBe('rgb(1, 2, 3)')

    onRoot({ '--enchase-button-color-dashed-hover': 'rgb(4, 5, 6)' })

    await becomes(target(), 'color', 'rgb(4, 5, 6)')
  })

  it('looks like the disabled outline button, with the dashed line', () => {
    renderInBrowser(
      <>
        <Button variant="outline" disabled>
          Add
        </Button>
        <Button variant="dashed" disabled>
          Add
        </Button>
      </>
    )

    expect(look(1)).toEqual(look(0))
    expect(style('button', 1).borderTopStyle).toBe('dashed')
    expect(style('button', 1).cursor).toBe('not-allowed')
  })

  it('has a hook for the text, the background and the border of a disabled button, ahead of the outline hooks', () => {
    const probes: Probe[] = [
      ['--enchase-button-color-dashed-disabled', 'rgb(1, 2, 3)', target(), 'color'],
      ['--enchase-button-background-dashed-disabled', 'rgb(4, 5, 6)', target(), 'background-color'],
      ['--enchase-button-border-color-dashed-disabled', 'rgb(7, 8, 9)', target(), 'border-top-color']
    ]

    onRoot({ '--enchase-button-color-outline-disabled': 'rgb(21, 22, 23)', '--enchase-button-background-outline-disabled': 'rgb(24, 25, 26)' })
    setHooks(probes)
    renderInBrowser(
      <Button variant="dashed" disabled>
        Add
      </Button>
    )

    expectHooks(probes)
  })

  it('draws the same outline hooks of a disabled button on the dashed one that the outline variant takes', () => {
    onRoot({ '--enchase-button-color-outline-disabled': 'rgb(1, 2, 3)', '--enchase-button-background-outline-disabled': 'rgb(4, 5, 6)', '--enchase-button-border-color-outline-disabled': 'rgb(7, 8, 9)' })
    renderInBrowser(
      <>
        <Button variant="outline" disabled>
          Add
        </Button>
        <Button variant="dashed" disabled>
          Add
        </Button>
      </>
    )

    expect(look(1)).toEqual(look(0))
    expect(style('button', 1).color).toBe('rgb(1, 2, 3)')
  })

  it('is the same on a link that looks like a button', () => {
    renderInBrowser(
      <>
        <Button variant="dashed">Add</Button>
        <ButtonLink href="/add" variant="dashed">
          Add
        </ButtonLink>
      </>
    )

    expect(['top', 'right', 'bottom', 'left'].map((side) => style('button-link').getPropertyValue(`border-${side}-style`))).toEqual(['dashed', 'dashed', 'dashed', 'dashed'])
    expect([style('button-link').backgroundColor, style('button-link').borderTopColor, style('button-link').color]).toEqual(look(0).slice(0, 3))
  })
})

describe('the link button in a real browser', () => {
  it('has no fill, no border and no shadow, and the color of the links of the theme', () => {
    renderInBrowser(
      <>
        <Button variant="link">Learn more</Button>
        <Button variant="outline">Learn more</Button>
      </>
    )

    expect(style('button', 0).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(style('button', 0).borderTopColor).toBe('rgba(0, 0, 0, 0)')
    expect(style('button', 0).boxShadow).toBe('none')
    expect(style('button', 0).color).toBe(role('primary'))
    expect(style('button', 0).textDecorationLine).toBe('none')
    expect([style('button', 0).minHeight, style('button', 0).paddingLeft]).toEqual([style('button', 1).minHeight, style('button', 1).paddingLeft])
  })

  it('has no state layer, so nothing is painted over it under the pointer', async () => {
    renderInBrowser(<Button variant="link">Learn more</Button>)

    expect(getComputedStyle(button(), '::after').display).toBe('none')

    await hover()

    expect(style('button').backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(button(), '::after').display).toBe('none')
  })

  it('takes the color of the Link, and its own hook before that', () => {
    onRoot({ '--enchase-link-color': 'rgb(1, 2, 3)' })
    renderInBrowser(<Button variant="link">Learn more</Button>)

    expect(style('button').color).toBe('rgb(1, 2, 3)')

    onRoot({ '--enchase-button-color-link': 'rgb(4, 5, 6)' })

    expect(style('button').color).toBe('rgb(4, 5, 6)')
  })

  it('takes the hover color of the theme and underlines the text under the pointer', async () => {
    renderInBrowser(<Button variant="link">Learn more</Button>)
    await hover()

    expect(style('button').color).toBe(role('primary-hover'))
    expect(style('button').textDecorationLine).toBe('underline')
    expect(style('button').backgroundColor).toBe('rgba(0, 0, 0, 0)')
  })

  it('takes the color under the pointer from the Link hook and then from its own hook, and lets a hook take the underline away', async () => {
    onRoot({ '--enchase-link-color-hover': 'rgb(1, 2, 3)' })
    renderInBrowser(<Button variant="link">Learn more</Button>)
    await hover()

    expect(style('button').color).toBe('rgb(1, 2, 3)')

    onRoot({ '--enchase-button-color-link-hover': 'rgb(4, 5, 6)', '--enchase-button-text-decoration-link-hover': 'none' })

    await becomes(target(), 'color', 'rgb(4, 5, 6)')
    expect(style('button').textDecorationLine).toBe('none')
  })

  it('takes the color of a disabled button from the shared hook, and from its own hook before that, and is not underlined under the pointer', async () => {
    onRoot({ '--enchase-button-color-disabled': 'rgb(1, 2, 3)' })
    renderInBrowser(
      <Button variant="link" disabled>
        Learn more
      </Button>
    )
    await hover()

    expect(style('button').color).toBe('rgb(1, 2, 3)')
    expect(style('button').backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(style('button').textDecorationLine).toBe('none')
    expect(style('button').cursor).toBe('not-allowed')

    onRoot({ '--enchase-button-color-link-disabled': 'rgb(4, 5, 6)' })

    expect(style('button').color).toBe('rgb(4, 5, 6)')
  })

  it('draws the focus ring of the other variants when focused by the keyboard', async () => {
    renderInBrowser(
      <>
        <Button variant="link">Learn more</Button>
        <Button variant="dashed">Add</Button>
        <Button variant="outline">Save</Button>
      </>
    )
    const ring = (index: number) => [style('button', index).outlineStyle, style('button', index).outlineWidth, style('button', index).outlineColor, style('button', index).outlineOffset]
    const rings: string[][] = []

    for (let index = 0; index < 3; index += 1) {
      await userEvent.tab()
      await waitForSettled(() => button(index))
      rings.push(ring(index))
    }

    expect(rings[0]).toEqual(rings[2])
    expect(rings[1]).toEqual(rings[2])
    expect(rings[2]).toEqual(['solid', '2px', role('primary'), '2px'])
  })

  it('is the same on a link that looks like a button', async () => {
    renderInBrowser(
      <>
        <Button variant="link">Learn more</Button>
        <ButtonLink href="/more" variant="link">
          Learn more
        </ButtonLink>
      </>
    )

    expect([style('button-link').backgroundColor, style('button-link').borderTopColor, style('button-link').color, style('button-link').textDecorationLine]).toEqual([
      style('button').backgroundColor,
      style('button').borderTopColor,
      style('button').color,
      style('button').textDecorationLine
    ])

    await userEvent.hover(part('button-link'))

    await becomes(at('button-link'), 'text-decoration-line', 'underline')
  })
})
