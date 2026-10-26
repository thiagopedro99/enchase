import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'

import { contrastRatio } from '@styles/theme/contrast.ts'
import { Tag } from '@components/common/Tag/index.tsx'
import { renderInBrowser } from './harness.tsx'
import { at, becomes, hooked, part, style } from './hookProbes.ts'

const noop = () => undefined

const added: HTMLStyleElement[] = []

const addStyle = (css: string) => {
  const element = document.createElement('style')
  element.textContent = css
  document.head.prepend(element)
  added.push(element)
}

afterEach(() => {
  document.documentElement.removeAttribute('style')
  added.splice(0).forEach((element) => element.remove())
})

const box = (name: string, index = 0) => part(name, index).getBoundingClientRect()

describe('Tag in a real browser', () => {
  it('is 28 or 32 pixels tall by size, with or without the button', () => {
    renderInBrowser(
      <>
        <Tag size="sm">Small</Tag>
        <Tag size="sm" onRemove={noop}>
          Small
        </Tag>
        <Tag>Medium</Tag>
        <Tag onRemove={noop}>Medium</Tag>
      </>
    )

    expect([0, 1, 2, 3].map((index) => box('tag', index).height)).toEqual([28, 28, 32, 32])
  })

  it('keeps the remove button a 24 pixel target that is hit where it is drawn', () => {
    renderInBrowser(<Tag onRemove={noop}>React</Tag>)
    const button = box('tag-remove')
    const hit = document.elementFromPoint(button.left + button.width / 2, button.top + button.height / 2)

    expect([button.width, button.height]).toEqual([24, 24])
    expect(hit?.closest('[data-slot="tag-remove"]')).toBe(part('tag-remove'))
  })

  it('puts the remove button at the end of the line, which is the left side in a right to left page', () => {
    renderInBrowser(
      <>
        <div dir="ltr">
          <Tag onRemove={noop}>React</Tag>
        </div>
        <div dir="rtl">
          <Tag onRemove={noop}>React</Tag>
        </div>
      </>
    )
    const [ltrLabel, rtlLabel] = [box('tag-label', 0), box('tag-label', 1)]
    const [ltrButton, rtlButton] = [box('tag-remove', 0), box('tag-remove', 1)]

    expect(ltrButton.left).toBeGreaterThan(ltrLabel.right - 1)
    expect(rtlButton.right).toBeLessThan(rtlLabel.left + 1)
  })

  it('shows a focus ring on the button when it is reached by the keyboard', async () => {
    renderInBrowser(<Tag onRemove={noop}>React</Tag>)

    await userEvent.tab()

    expect(document.activeElement).toBe(part('tag-remove'))
    expect(style('tag-remove').outlineStyle).toBe('solid')
    expect(style('tag-remove').outlineWidth).toBe('2px')
  })

  it('tints the button under the pointer', async () => {
    renderInBrowser(<Tag onRemove={noop}>React</Tag>)

    expect(style('tag-remove').backgroundColor).toBe('rgba(0, 0, 0, 0)')

    await userEvent.hover(part('tag-remove'))
    await becomes(at('tag-remove'), 'background-color', /^(?!rgba\(0, 0, 0, 0\)).+/)
  })

  it('cuts a long text with an ellipsis and keeps the button inside the tag', () => {
    renderInBrowser(
      <div style={{ inlineSize: 192 }}>
        <Tag onRemove={noop}>A keyword that is far too long for the room this tag has</Tag>
      </div>
    )
    const tag = box('tag')
    const label = part('tag-label')

    expect(tag.width).toBeLessThanOrEqual(192)
    expect(label.scrollWidth).toBeGreaterThan(label.clientWidth)
    expect(style('tag-label').textOverflow).toBe('ellipsis')
    expect(box('tag-remove').right).toBeLessThanOrEqual(tag.right)
    expect(box('tag-remove').width).toBe(24)
  })

  it.each(['light', 'dark'] as const)('keeps the text readable on the page in the %s theme', (mode) => {
    renderInBrowser(<Tag>React</Tag>, 'never', mode)

    const page = getComputedStyle(document.documentElement).getPropertyValue('--enchase-color-background').trim()

    expect(page).not.toBe('')
    expect(contrastRatio(style('tag').color, page)).toBeGreaterThanOrEqual(4.5)
  })

  it('reads its look, its space and its type from hooks', () => {
    hooked(
      [
        ['--enchase-tag-background', 'rgb(1, 2, 3)', at('tag'), 'background-color'],
        ['--enchase-tag-border-color', 'rgb(4, 5, 6)', at('tag'), 'border-top-color'],
        ['--enchase-tag-color', 'rgb(7, 8, 9)', at('tag'), 'color'],
        ['--enchase-tag-radius', '5px', at('tag'), 'border-top-left-radius'],
        ['--enchase-tag-gap', '11px', at('tag'), 'column-gap'],
        ['--enchase-tag-padding-inline-md', '13px', at('tag'), 'padding-left'],
        ['--enchase-tag-padding-inline-end', '3px', at('tag'), 'padding-right'],
        ['--enchase-tag-min-height-md', '41px', at('tag'), 'min-height'],
        ['--enchase-tag-font-size-md', '17px', at('tag'), 'font-size'],
        ['--enchase-tag-font-weight', '700', at('tag'), 'font-weight'],
        ['--enchase-tag-line-height', '2', at('tag'), 'line-height', '34px'],
        ['--enchase-tag-remove-size', '2rem', at('tag-remove'), 'width', '32px'],
        ['--enchase-tag-remove-radius', '3px', at('tag-remove'), 'border-top-left-radius']
      ],
      <Tag onRemove={noop}>React</Tag>
    )
  })

  it('reads the small size from its own hooks and the largest width from a hook', () => {
    hooked(
      [
        ['--enchase-tag-padding-inline-sm', '9px', at('tag', 0), 'padding-left'],
        ['--enchase-tag-min-height-sm', '35px', at('tag', 0), 'min-height'],
        ['--enchase-tag-font-size-sm', '15px', at('tag', 0), 'font-size'],
        ['--enchase-tag-max-width', '90px', at('tag', 1), 'max-width']
      ],
      <>
        <Tag size="sm">Small</Tag>
        <Tag>Wide</Tag>
      </>
    )
  })

  it('lets the caller class win on the colors and the space even when its css loads before the library', () => {
    addStyle('.mine { background-color: rgb(0, 128, 0); border-top-color: rgb(255, 0, 0); padding-inline-start: 30px; }')
    renderInBrowser(<Tag className="mine">React</Tag>)

    expect(style('tag').backgroundColor).toBe('rgb(0, 128, 0)')
    expect(style('tag').borderTopColor).toBe('rgb(255, 0, 0)')
    expect(style('tag').paddingLeft).toBe('30px')
  })
})
