import { afterEach, describe, expect, it } from 'vitest'

import { contrastRatio } from '@styles/theme/contrast.ts'
import { Card } from '@components/common/Card/index.tsx'
import { renderInBrowser } from '../../../support/harness.tsx'
import { at, expectHooks, onRoot, part, setHooks, style } from '../../../support/hookProbes.ts'

import type { Probe } from '../../../support/hookProbes.ts'
import type { ReactNode } from 'react'

const box = (name: string, index = 0) => part(name, index).getBoundingClientRect()

const stage = (children: ReactNode) => <div style={{ inlineSize: 400 }}>{children}</div>

const extra = <button type="button">Edit</button>

afterEach(() => {
  document.documentElement.removeAttribute('style')
  document.documentElement.removeAttribute('dir')
})

describe('the card without a header in a real browser', () => {
  it('keeps the padding on the card and the children straight in it', () => {
    renderInBrowser(stage(<Card>content</Card>))

    expect(style('card').paddingLeft).toBe('24px')
    expect(part('card-header', 0)).toBeUndefined()
    expect(part('card-body', 0)).toBeUndefined()
  })
})

describe('the card with a header in a real browser', () => {
  it('draws the header across the whole card, with a line under it, and the body under the line', () => {
    renderInBrowser(
      stage(
        <Card variant="outlined" header="Invoice" headerExtra={extra}>
          content
        </Card>
      )
    )
    const [card, header, body] = [box('card'), box('card-header'), box('card-body')]

    expect(style('card').paddingLeft).toBe('0px')
    expect(style('card').paddingTop).toBe('0px')
    expect(Math.round(header.left - card.left)).toBe(1)
    expect(Math.round(card.right - header.right)).toBe(1)
    expect(style('card-header').borderBottomWidth).toBe('1px')
    expect(style('card-header').borderBottomColor).toBe(style('card').borderTopColor)
    expect(Math.abs(body.top - header.bottom)).toBeLessThanOrEqual(1)
    expect(style('card-body').paddingLeft).toBe('24px')
    expect(style('card-body').paddingBottom).toBe('24px')
  })

  it('puts the title at the start and the extra at the end of the header, in the height of the header at least', () => {
    renderInBrowser(
      stage(
        <Card header="Invoice" headerExtra={extra}>
          content
        </Card>
      )
    )
    const [header, title, end] = [box('card-header'), box('card-title'), box('card-extra')]

    expect(Math.round(title.left - header.left)).toBe(24)
    expect(Math.round(header.right - end.right)).toBe(24)
    expect(Math.round(header.height)).toBeGreaterThanOrEqual(48)
    expect(Math.abs(title.top + title.height / 2 - (end.top + end.height / 2))).toBeLessThanOrEqual(2)
  })

  it('swaps the sides when the text runs from right to left', () => {
    document.documentElement.setAttribute('dir', 'rtl')
    renderInBrowser(
      stage(
        <Card header="Fatura" headerExtra={extra}>
          content
        </Card>
      )
    )

    expect(box('card-title').left).toBeGreaterThan(box('card-extra').left)
  })

  it('keeps the extra at the end when there is only the extra', () => {
    renderInBrowser(stage(<Card headerExtra={extra}>content</Card>))

    expect(Math.round(box('card-header').right - box('card-extra').right)).toBe(24)
    expect(box('card-title').width).toBeGreaterThan(200)
  })

  it('wraps a long title inside the header, next to the extra', () => {
    renderInBrowser(
      stage(
        <Card header="An invoice title so long that it has to go on in a second line of the header" headerExtra={extra}>
          content
        </Card>
      )
    )

    expect(box('card-title').height).toBeGreaterThan(30)
    expect(box('card-title').right).toBeLessThanOrEqual(box('card-extra').left)
  })

  it('writes the title bigger and heavier than the body, and the extra smaller and in the secondary color', () => {
    renderInBrowser(
      stage(
        <Card header="Invoice" headerExtra="Extra">
          content
        </Card>
      )
    )

    expect([style('card-title').fontSize, style('card-title').fontWeight]).toEqual(['18px', '600'])
    expect(parseFloat(style('card-extra').fontSize)).toBeLessThan(parseFloat(style('card-title').fontSize))
    expect(style('card-extra').color).not.toBe(style('card-title').color)
  })

  it.each(['default', 'elevated', 'outlined'] as const)('keeps the title and the extra readable on the %s card', (variant) => {
    renderInBrowser(
      stage(
        <Card variant={variant} header="Invoice" headerExtra="Extra">
          content
        </Card>
      )
    )
    const background = style('card').backgroundColor

    expect(contrastRatio(style('card-title').color, background)).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(style('card-extra').color, background)).toBeGreaterThanOrEqual(4.5)
  })

  it('moves the padding prop to the body, and the hook of the card padding too, and leaves the header to its own hooks', () => {
    onRoot({ '--enchase-card-padding': '40px' })
    renderInBrowser(
      stage(
        <>
          <Card header="A">content</Card>
          <Card header="B" padding="10px">
            content
          </Card>
        </>
      )
    )

    expect([style('card-body', 0).paddingLeft, style('card-body', 1).paddingLeft]).toEqual(['40px', '10px'])
    expect([style('card-header', 0).paddingLeft, style('card-header', 1).paddingLeft]).toEqual(['24px', '24px'])
    expect([style('card', 0).paddingLeft, style('card', 1).paddingLeft]).toEqual(['0px', '0px'])
  })

  it('has a hook for the line, the gap, the height, the padding and the title and the extra of the header, and one for the padding of the body', () => {
    const probes: Probe[] = [
      ['--enchase-card-header-border-color', 'rgb(1, 2, 3)', at('card-header'), 'border-bottom-color'],
      ['--enchase-card-header-gap', '30px', at('card-header'), 'column-gap'],
      ['--enchase-card-header-min-height', '90px', at('card-header'), 'min-height'],
      ['--enchase-card-header-padding-block', '11px', at('card-header'), 'padding-top'],
      ['--enchase-card-header-padding-inline', '13px', at('card-header'), 'padding-left'],
      ['--enchase-card-title-font-size', '21px', at('card-title'), 'font-size'],
      ['--enchase-card-title-font-weight', '800', at('card-title'), 'font-weight'],
      ['--enchase-card-title-line-height', '2', at('card-title'), 'line-height', '42px'],
      ['--enchase-card-title-color', 'rgb(4, 5, 6)', at('card-title'), 'color'],
      ['--enchase-card-extra-font-size', '17px', at('card-extra'), 'font-size'],
      ['--enchase-card-extra-line-height', '2', at('card-extra'), 'line-height', '34px'],
      ['--enchase-card-extra-color', 'rgb(7, 8, 9)', at('card-extra'), 'color'],
      ['--enchase-card-body-padding', '19px', at('card-body'), 'padding-left']
    ]

    setHooks(probes)
    renderInBrowser(
      stage(
        <Card header="Invoice" headerExtra="Extra">
          content
        </Card>
      )
    )

    expectHooks(probes)
  })
})
