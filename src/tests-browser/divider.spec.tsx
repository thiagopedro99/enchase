import { afterEach, describe, expect, it } from 'vitest'

import { Divider } from '@components/common/Divider/index.tsx'
import { Flex } from '@components/common/Flex/index.tsx'
import { renderInBrowser } from './harness.tsx'
import { at, hooked, onRoot, style } from './hookProbes.ts'

const added: HTMLStyleElement[] = []

const addStyle = (css: string) => {
  const style = document.createElement('style')
  style.textContent = css
  document.head.prepend(style)
  added.push(style)
}

afterEach(() => {
  document.documentElement.removeAttribute('style')
  added.splice(0).forEach((style) => style.remove())
})

const divider = () => document.querySelector('hr') as HTMLElement

describe('Divider in a real browser', () => {
  it('draws a one pixel line across the width of its parent', () => {
    renderInBrowser(
      <div style={{ inlineSize: 320 }}>
        <Divider />
      </div>
    )
    const box = divider().getBoundingClientRect()

    expect(box.width).toBe(320)
    expect(box.height).toBe(1)
    expect(style('divider').borderBlockStartStyle).toBe('solid')
    expect(style('divider').borderBlockStartColor).not.toBe('rgba(0, 0, 0, 0)')
  })

  it('stretches a vertical line to the height of its flex row and keeps it one pixel wide', () => {
    renderInBrowser(
      <Flex style={{ blockSize: 48 }}>
        <span>One</span>
        <Divider orientation="vertical" />
        <span>Two</span>
      </Flex>
    )
    const box = divider().getBoundingClientRect()

    expect(box.width).toBe(1)
    expect(box.height).toBe(48)
  })

  it('keeps a vertical line visible when the parent gives it no height', () => {
    renderInBrowser(
      <div>
        <Divider orientation="vertical" />
      </div>
    )

    expect(divider().getBoundingClientRect().height).toBe(16)
  })

  it('puts the line of a vertical divider on the start side, in both directions', () => {
    renderInBrowser(
      <>
        <div dir="ltr">
          <Divider orientation="vertical" data-testid="ltr" />
        </div>
        <div dir="rtl">
          <Divider orientation="vertical" data-testid="rtl" />
        </div>
      </>
    )
    const [ltr, rtl] = [...document.querySelectorAll<HTMLElement>('hr')].map((element) => getComputedStyle(element))

    expect([ltr?.borderLeftWidth, ltr?.borderRightWidth]).toEqual(['1px', '0px'])
    expect([rtl?.borderLeftWidth, rtl?.borderRightWidth]).toEqual(['0px', '1px'])
  })

  it('reads its color, its minimum height and the border width from hooks and tokens', () => {
    hooked(
      [
        ['--enchase-divider-border-color', 'rgb(255, 0, 0)', at('divider'), 'border-block-start-color'],
        ['--enchase-divider-min-height', '33px', at('divider', 1), 'min-block-size']
      ],
      <>
        <Divider />
        <Divider orientation="vertical" />
      </>
    )
    onRoot({ '--enchase-border-width': '3px' })

    expect(style('divider').borderBlockStartWidth).toBe('3px')
  })

  it('lets the caller class win on the line and the margin even when its css loads before the library', () => {
    addStyle('.mine { margin-block: 9px; border-block-start-width: 5px; border-block-start-color: rgb(0, 128, 0); }')
    renderInBrowser(<Divider className="mine" />)

    expect(style('divider').marginTop).toBe('9px')
    expect(style('divider').borderBlockStartWidth).toBe('5px')
    expect(style('divider').borderBlockStartColor).toBe('rgb(0, 128, 0)')
  })

  it('follows the border color of the theme in each mode', () => {
    renderInBrowser(<Divider />, 'never', 'light')
    const light = style('divider').borderBlockStartColor

    document.body.innerHTML = ''
    renderInBrowser(<Divider />, 'never', 'dark')

    expect(style('divider').borderBlockStartColor).not.toBe(light)
  })
})
