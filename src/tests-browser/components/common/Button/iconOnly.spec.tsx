import { afterEach, describe, expect, it } from 'vitest'

import { Button } from '@components/common/Button/index.tsx'
import { renderInBrowser } from '../../../support/harness.tsx'
import { onRoot } from '../../../support/hookProbes.ts'
import { setDensity } from '../../../support/density.tsx'

import type { ButtonProps } from '@components/common/Button/types.ts'

const icon = (size = 20) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M12 5v14M5 12h14" />
  </svg>
)

const sizes = ['sm', 'md', 'lg'] as const

const variants = ['primary', 'secondary', 'outline', 'ghost', 'danger'] as const

const buttons = () => [...document.body.querySelectorAll<HTMLElement>('[data-slot="button"]')]

const box = (element: Element) => {
  const { width, height } = element.getBoundingClientRect()

  return [width, height]
}

const squares = (props: ButtonProps[], iconSize?: number) =>
  props.map((own, index) => (
    <Button key={index} iconOnly aria-label="Add" {...own}>
      {icon(iconSize)}
    </Button>
  ))

afterEach(() => {
  document.documentElement.removeAttribute('style')
  setDensity(null)
})

describe('the icon-only button in a real browser', () => {
  it('is as wide as it is tall in every size, as tall as a button with text of the same size', () => {
    renderInBrowser(
      <>
        {squares(sizes.map((size) => ({ size })))}
        <Button size="md">Text</Button>
      </>
    )

    expect(buttons().map(box)).toEqual([
      [32, 32],
      [40, 40],
      [48, 48],
      [expect.any(Number), 40]
    ])
  })

  it('is a square in every variant, also the ghost one, whose side padding is wider than the others', () => {
    onRoot({ '--enchase-button-padding-inline-ghost': '30px' })
    renderInBrowser(<>{squares(variants.map((variant) => ({ variant })))}</>)

    expect(buttons().map(box)).toEqual(variants.map(() => [40, 40]))
  })

  it('has the same padding at the sides as above and below, from the hook of the vertical padding', () => {
    onRoot({ '--enchase-button-padding-block-md': '7px' })
    renderInBrowser(<>{squares([{ size: 'sm' }, { size: 'md' }])}</>)
    const paddings = buttons().map((element) => {
      const style = getComputedStyle(element)

      return [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft]
    })

    expect(paddings).toEqual([
      ['4px', '4px', '4px', '4px'],
      ['7px', '7px', '7px', '7px']
    ])
  })

  it('keeps the icon in the middle of the button', () => {
    renderInBrowser(<>{squares(sizes.map((size) => ({ size })))}</>)

    for (const element of buttons()) {
      const frame = element.getBoundingClientRect()
      const mark = (element.querySelector('svg') as SVGElement).getBoundingClientRect()

      expect(Math.abs(frame.left + frame.width / 2 - (mark.left + mark.width / 2))).toBeLessThanOrEqual(0.5)
      expect(Math.abs(frame.top + frame.height / 2 - (mark.top + mark.height / 2))).toBeLessThanOrEqual(0.5)
    }
  })

  it('follows the control heights of the compact density, and stays a square', () => {
    setDensity('compact')
    renderInBrowser(<>{squares(sizes.map((size) => ({ size })), 16)}</>)

    expect(buttons().map(box)).toEqual([
      [28, 28],
      [32, 32],
      [40, 40]
    ])
  })

  it('follows the control height tokens of the page', () => {
    onRoot({ '--enchase-control-height-sm': '3rem', '--enchase-control-height-md': '3.5rem', '--enchase-control-height-lg': '4rem' })
    renderInBrowser(<>{squares(sizes.map((size) => ({ size })))}</>)

    expect(buttons().map(box)).toEqual([
      [48, 48],
      [56, 56],
      [64, 64]
    ])
  })

  it('keeps the floor of 24px in both directions when the height token is lower', () => {
    onRoot({ '--enchase-control-height-md': '10px' })
    renderInBrowser(<>{squares([{}], 8)}</>)

    expect(box(buttons()[0])).toEqual([24, 24])
  })

  it('grows with a larger icon and stays a square', () => {
    renderInBrowser(<>{squares([{}], 48)}</>)

    expect(box(buttons()[0])).toEqual([58, 58])
  })

  it('leaves a button without the prop as it is: wider than tall, with the side padding of its size and no attribute', () => {
    renderInBrowser(<Button>Save</Button>)
    const style = getComputedStyle(buttons()[0])

    expect(buttons()[0].hasAttribute('data-icon-only')).toBe(false)
    expect(style.paddingLeft).toBe('24px')
    expect(box(buttons()[0])[0]).toBeGreaterThan(box(buttons()[0])[1])
  })

  it('lets the class of the caller win over the square, as it does over the rest of the geometry', () => {
    const sheet = document.createElement('style')

    sheet.textContent = '.mine { min-inline-size: 90px; padding-inline: 7px; }'
    document.head.append(sheet)
    renderInBrowser(
      <Button className="mine" iconOnly aria-label="Add">
        {icon()}
      </Button>
    )

    expect(box(buttons()[0])).toEqual([90, 40])
    sheet.remove()
  })
})
