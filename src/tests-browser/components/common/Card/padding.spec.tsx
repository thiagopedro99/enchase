import { afterEach, describe, expect, it } from 'vitest'

import { Card } from '@components/common/Card/index.tsx'
import { CardButton } from '@components/common/CardButton/index.tsx'
import { CardLink } from '@components/common/CardLink/index.tsx'
import { renderInBrowser } from '../../../support/harness.tsx'
import { onRoot, parts } from '../../../support/hookProbes.ts'

import type { ReactNode } from 'react'

const sides = (element: Element) => {
  const style = getComputedStyle(element)

  return [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft]
}

const padded = (value: string) => [value, value, value, value]

const roots = (slot = 'card') => parts(slot)

const bodies = () => parts('card-body')

const stage = (children: ReactNode) => <div style={{ inlineSize: 400 }}>{children}</div>

afterEach(() => {
  document.documentElement.removeAttribute('style')
})

describe('the padding of the cards in a real browser', () => {
  it('paints the padding prop on the four sides of the card, the same as an inline padding did, and the default without it', () => {
    renderInBrowser(
      stage(
        <>
          <Card padding="10px">with</Card>
          <div data-slot="inline" style={{ padding: '10px' }}>
            inline
          </div>
          <Card>without</Card>
          <Card padding="0">none</Card>
        </>
      )
    )
    const [prop, plain, none] = roots()
    const [inline] = parts('inline')

    expect(sides(prop)).toEqual(padded('10px'))
    expect(sides(prop)).toEqual(sides(inline))
    expect(sides(plain)).toEqual(padded('24px'))
    expect(sides(none)).toEqual(padded('0px'))
  })

  it('moves the prop to the body of a card with a header, and keeps the card itself without padding', () => {
    renderInBrowser(
      stage(
        <>
          <Card header="Title" padding="10px">
            with
          </Card>
          <Card header="Title">without</Card>
        </>
      )
    )

    expect(roots().map(sides)).toEqual([padded('0px'), padded('0px')])
    expect(bodies().map(sides)).toEqual([padded('10px'), padded('24px')])
  })

  it('takes the prop in the clickable cards, with the default spacing without it', () => {
    renderInBrowser(
      stage(
        <>
          <CardButton padding="10px">button</CardButton>
          <CardButton>button</CardButton>
          <CardLink href="/docs" padding="10px">
            link
          </CardLink>
          <CardLink href="/docs">link</CardLink>
        </>
      )
    )

    expect([...roots('card-button'), ...roots('card-link')].map(sides)).toEqual([padded('10px'), padded('24px'), padded('10px'), padded('24px')])
  })

  it('does not pass the padding of a card to the cards inside it, as the inline padding never did', () => {
    renderInBrowser(
      stage(
        <Card padding="0">
          <Card>inner</Card>
          <Card padding="6px">own</Card>
          <Card header="Title">headed</Card>
          <CardButton>button</CardButton>
          <CardLink href="/docs">link</CardLink>
        </Card>
      )
    )
    const [outer, plain, own, headed] = roots()

    expect(sides(outer)).toEqual(padded('0px'))
    expect(sides(plain)).toEqual(padded('24px'))
    expect(sides(own)).toEqual(padded('6px'))
    expect(sides(headed)).toEqual(padded('0px'))
    expect(bodies().map(sides)).toEqual([padded('24px')])
    expect(roots('card-button').map(sides)).toEqual([padded('24px')])
    expect(roots('card-link').map(sides)).toEqual([padded('24px')])
  })

  it('does not pass the padding of a card with a header to the cards in its body', () => {
    renderInBrowser(
      stage(
        <Card header="Title" padding="3px">
          <Card>inner</Card>
        </Card>
      )
    )
    const [outer, inner] = roots()

    expect(sides(outer)).toEqual(padded('0px'))
    expect(sides(bodies()[0])).toEqual(padded('3px'))
    expect(sides(inner)).toEqual(padded('24px'))
  })

  it('follows the hooks when there is no prop, and the prop wins over them', () => {
    onRoot({ '--enchase-card-padding': '7px', '--enchase-card-body-padding': '9px' })
    renderInBrowser(
      stage(
        <>
          <Card>hook</Card>
          <Card padding="10px">prop</Card>
          <Card header="Title">hook</Card>
          <Card header="Title" padding="10px">
            prop
          </Card>
          <CardButton>hook</CardButton>
          <CardLink href="/docs" padding="10px">
            prop
          </CardLink>
        </>
      )
    )
    const [hook, prop, headedHook, headedProp] = roots()

    expect(sides(hook)).toEqual(padded('7px'))
    expect(sides(prop)).toEqual(padded('10px'))
    expect(sides(headedHook)).toEqual(padded('0px'))
    expect(sides(headedProp)).toEqual(padded('0px'))
    expect(bodies().map(sides)).toEqual([padded('9px'), padded('10px')])
    expect(sides(roots('card-button')[0])).toEqual(padded('7px'))
    expect(sides(roots('card-link')[0])).toEqual(padded('10px'))
  })

  it('lets a class of the author win over the prop, which an inline padding did not allow', () => {
    const sheet = document.createElement('style')

    sheet.textContent = '.mine { padding: 3px; } @media (min-width: 1px) { .responsive { padding: 5px; } }'
    document.head.append(sheet)
    renderInBrowser(
      stage(
        <>
          <Card padding="10px" className="mine">
            class
          </Card>
          <CardButton padding="10px" className="responsive">
            media
          </CardButton>
        </>
      )
    )

    expect(sides(roots()[0])).toEqual(padded('3px'))
    expect(sides(roots('card-button')[0])).toEqual(padded('5px'))
    sheet.remove()
  })
})
