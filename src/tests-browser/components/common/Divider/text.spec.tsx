import { afterEach, describe, expect, it } from 'vitest'

import { contrastRatio } from '@styles/theme/contrast.ts'
import { Divider } from '@components/common/Divider/index.tsx'
import { renderInBrowser } from '../../../support/harness.tsx'
import { at, expectHooks, onRoot, part, parts, setHooks, style } from '../../../support/hookProbes.ts'

import type { Probe } from '../../../support/hookProbes.ts'

const surfaces = ['surface', 'background', 'surface-container-high'] as const

const box = (name: string, index = 0) => part(name, index).getBoundingClientRect()

const surface = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(`--enchase-color-${name}`).trim()

const stage = (children: React.ReactNode) => <div style={{ inlineSize: 400 }}>{children}</div>

afterEach(() => {
  document.documentElement.removeAttribute('style')
  document.documentElement.removeAttribute('dir')
})

describe('the divider with a text in a real browser', () => {
  it('draws no line of its own, and the line of the plain divider is the same on both sides of the text', () => {
    renderInBrowser(
      stage(
        <>
          <Divider />
          <Divider>or</Divider>
        </>
      )
    )

    expect(style('divider', 0).borderBlockStartWidth).toBe('1px')
    expect(style('divider', 1).borderBlockStartWidth).toBe('0px')
    expect(parts('divider-line').map((line) => getComputedStyle(line).borderBlockStartWidth)).toEqual(['1px', '1px'])
    expect(getComputedStyle(part('divider-line')).borderBlockStartColor).toBe(style('divider', 0).borderBlockStartColor)
  })

  it('puts the text in the middle with a line of the same length on each side, a gap away', () => {
    renderInBrowser(stage(<Divider>or</Divider>))
    const [before, text, after, root] = [box('divider-line', 0), box('divider-text'), box('divider-line', 1), box('divider')]

    expect(Math.abs(before.width - after.width)).toBeLessThanOrEqual(1)
    expect(Math.round(text.left - before.right)).toBe(16)
    expect(Math.round(after.left - text.right)).toBe(16)
    expect(Math.abs(before.left - root.left)).toBeLessThanOrEqual(1)
    expect(Math.abs(after.right - root.right)).toBeLessThanOrEqual(1)
    expect(Math.abs(before.top - (text.top + text.height / 2))).toBeLessThanOrEqual(1)
  })

  it.each([
    ['start', 'left'],
    ['end', 'right']
  ] as const)('puts the text at the %s, with a short line on that side and the rest of the row on the other', (align, side) => {
    renderInBrowser(stage(<Divider textAlign={align}>Details</Divider>))
    const [before, after] = [box('divider-line', 0), box('divider-line', 1)]
    const [short, long] = side === 'left' ? [before, after] : [after, before]

    expect(Math.round(short.width)).toBe(24)
    expect(long.width).toBeGreaterThan(short.width * 5)
  })

  it('puts the start of the text on the right when the text runs from right to left', () => {
    document.documentElement.setAttribute('dir', 'rtl')
    renderInBrowser(stage(<Divider textAlign="start">Detalhes</Divider>))

    expect(box('divider-text').left).toBeGreaterThan(box('divider').left + box('divider').width / 2)
    expect(Math.round(box('divider-line', 0).width)).toBe(24)
    expect(box('divider-line', 0).left).toBeGreaterThan(box('divider-text').left)
  })

  it('wraps a long text inside its row, and keeps the lines', () => {
    renderInBrowser(stage(<Divider>{'A text so long that it cannot fit in one row of the divider and has to go on in the next one'}</Divider>))

    expect(box('divider').width).toBeLessThanOrEqual(401)
    expect(box('divider-text').height).toBeGreaterThan(24)
    expect(box('divider-text').right).toBeLessThanOrEqual(box('divider').right + 1)
  })

  it('keeps the vertical margin of the plain divider', () => {
    onRoot({ '--enchase-divider-margin-block': '12px' })
    renderInBrowser(stage(<Divider>or</Divider>))

    expect([style('divider').marginTop, style('divider').marginBottom]).toEqual(['12px', '12px'])
  })

  it('reads the text in the secondary color, in the small size and in medium weight, readable on every surface', () => {
    renderInBrowser(stage(<Divider>or</Divider>))

    expect([style('divider-text').fontSize, style('divider-text').fontWeight]).toEqual(['14px', '500'])

    for (const name of surfaces) expect(contrastRatio(style('divider-text').color, surface(name)), name).toBeGreaterThanOrEqual(4.5)
  })

  it('has a hook for the color, the size, the weight and the line height of the text, and for the gap and the color of the lines', () => {
    const probes: Probe[] = [
      ['--enchase-divider-text-color', 'rgb(1, 2, 3)', at('divider-text'), 'color'],
      ['--enchase-divider-text-font-size', '21px', at('divider-text'), 'font-size'],
      ['--enchase-divider-text-font-weight', '800', at('divider-text'), 'font-weight'],
      ['--enchase-divider-text-line-height', '2', at('divider-text'), 'line-height', '42px'],
      ['--enchase-divider-gap', '30px', at('divider'), 'column-gap'],
      ['--enchase-divider-border-color', 'rgb(4, 5, 6)', at('divider-line'), 'border-block-start-color']
    ]

    setHooks(probes)
    renderInBrowser(stage(<Divider>or</Divider>))

    expectHooks(probes)
  })

  it('has a hook for the length of the short line', () => {
    onRoot({ '--enchase-divider-line-width': '5%' })
    renderInBrowser(stage(<Divider textAlign="start">Details</Divider>))

    expect(Math.round(box('divider-line', 0).width)).toBe(20)
  })
})
