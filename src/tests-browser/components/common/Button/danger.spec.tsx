import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'

import { Button } from '@components/common/Button/index.tsx'
import { ButtonLink } from '@components/common/ButtonLink/index.tsx'
import { renderInBrowser } from '../../../support/harness.tsx'
import { letGoOfTheMouse, pressMouse } from '../../../support/pointer.ts'
import { waitForSettled } from '../../../support/settle.ts'

import type { CSSProperties, ReactNode } from 'react'

const scoped = (style: Record<string, string>, children: ReactNode) => <div style={style as CSSProperties}>{children}</div>

const button = (index = 0) => document.body.querySelectorAll<HTMLElement>('[data-slot="button"]')[index]

const style = (index = 0) => getComputedStyle(button(index))

const layerOf = (index = 0) => Number(getComputedStyle(button(index), '::after').opacity)

const resolved = (property: 'color' | 'boxShadow', value: string) => {
  const probe = document.createElement('span')

  probe.style[property] = value
  document.body.append(probe)

  const result = getComputedStyle(probe)[property]

  probe.remove()

  return result
}

const role = (name: string) => resolved('color', `var(--enchase-color-${name})`)

const outlineOf = (index: number) => {
  const computed = style(index)

  return [computed.outlineStyle, computed.outlineWidth, computed.outlineColor, computed.outlineOffset]
}

afterEach(async () => {
  await letGoOfTheMouse()
})

describe('the danger button in a real browser', () => {
  it('is filled with the error color of the theme and writes on it with the color made for it', () => {
    renderInBrowser(<Button variant="danger">Delete</Button>)

    expect([style().backgroundColor, style().color]).toEqual([role('error'), role('on-error')])
    expect(style().borderTopColor).toBe('rgba(0, 0, 0, 0)')
    expect(style().boxShadow).toBe('none')
    expect(layerOf()).toBe(0)
  })

  it('follows the error color of the dark mode', async () => {
    renderInBrowser(<Button variant="danger">Delete</Button>, 'never', 'dark')
    await waitForSettled(() => button())

    expect([style().backgroundColor, style().color]).toEqual([role('error'), role('on-error')])
  })

  it('follows an error color and an on-error color that the page gives to a part of itself', () => {
    renderInBrowser(scoped({ '--enchase-color-error': 'rgb(1, 2, 3)', '--enchase-color-on-error': 'rgb(4, 5, 6)' }, <Button variant="danger">Delete</Button>))

    expect([style().backgroundColor, style().color]).toEqual(['rgb(1, 2, 3)', 'rgb(4, 5, 6)'])
  })

  it('is the same on a link that looks like a button', () => {
    renderInBrowser(
      <ButtonLink href="/delete" variant="danger">
        Delete
      </ButtonLink>
    )
    const link = document.body.querySelector('[data-slot="button-link"]') as HTMLElement

    expect([getComputedStyle(link).backgroundColor, getComputedStyle(link).color]).toEqual([role('error'), role('on-error')])
  })

  it('keeps its color and lifts with the small shadow under the pointer, with the hover layer of the state token', async () => {
    renderInBrowser(<Button variant="danger">Delete</Button>)
    await userEvent.hover(button())
    await waitForSettled(() => button())

    expect(layerOf()).toBeCloseTo(0.08, 3)
    expect(style().color).toBe(role('on-error'))
    expect(style().backgroundColor).toBe(role('error'))
    expect(style().boxShadow).toBe(resolved('boxShadow', 'var(--enchase-shadow-sm)'))
  })

  it('lays the pressed layer of the state token over the button while the mouse is down', async () => {
    renderInBrowser(<Button variant="danger">Delete</Button>)
    await pressMouse('[data-slot="button"]')
    await waitForSettled(() => button())

    expect(layerOf()).toBeCloseTo(0.1, 3)
    expect(style().backgroundColor).toBe(role('error'))
  })

  it('draws the focus ring of the other variants when focused by the keyboard, with the pressed layer over it', async () => {
    renderInBrowser(
      <>
        <Button variant="danger">Delete</Button>
        <Button variant="primary">Save</Button>
      </>
    )
    await userEvent.tab()
    await waitForSettled(() => button(0))
    const dangerRing = outlineOf(0)

    expect(layerOf(0)).toBeCloseTo(0.1, 3)
    await userEvent.tab()
    await waitForSettled(() => button(1))

    expect(dangerRing).toEqual(outlineOf(1))
    expect(dangerRing).toEqual(['solid', '2px', role('primary'), '2px'])
  })

  it('takes the colors of a disabled button from the shared hook, as the primary variant does, and not from the error color', () => {
    renderInBrowser(
      <>
        <Button variant="danger" disabled>
          Delete
        </Button>
        <Button variant="primary" disabled>
          Save
        </Button>
      </>
    )
    const read = (index: number) => [style(index).backgroundColor, style(index).color, style(index).borderTopColor, style(index).boxShadow, style(index).opacity]

    expect(read(0)).toEqual(read(1))
    expect(style(0).backgroundColor).not.toBe(role('error'))
    expect(style(0).cursor).toBe('not-allowed')
  })
})
