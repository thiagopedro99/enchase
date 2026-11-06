import { afterEach, describe, expect, it } from 'vitest'

import { Button } from '@components/common/Button/index.tsx'
import { ButtonLink } from '@components/common/ButtonLink/index.tsx'
import { renderInBrowser } from '../../../support/harness.tsx'
import { onRoot } from '../../../support/hookProbes.ts'
import { setDensity } from '../../../support/density.tsx'

import type { ButtonLinkProps } from '@components/common/ButtonLink/types.ts'

const icon = (size = 20) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M12 5v14M5 12h14" />
  </svg>
)

const sizes = ['sm', 'md', 'lg'] as const

const variants = ['primary', 'secondary', 'outline', 'ghost', 'danger'] as const

const links = () => [...document.body.querySelectorAll<HTMLElement>('[data-slot="button-link"]')]

const buttons = () => [...document.body.querySelectorAll<HTMLElement>('[data-slot="button"]')]

const box = (element: Element) => {
  const { width, height } = element.getBoundingClientRect()

  return [width, height]
}

const squares = (props: Partial<ButtonLinkProps>[], iconSize?: number) =>
  props.map((own, index) => (
    <ButtonLink key={index} href="/add" iconOnly aria-label="Add" {...own}>
      {icon(iconSize)}
    </ButtonLink>
  ))

afterEach(() => {
  document.documentElement.removeAttribute('style')
  setDensity(null)
})

describe('the icon-only link in a real browser', () => {
  it('has the same box as the icon-only button in every size', () => {
    renderInBrowser(
      <>
        {squares(sizes.map((size) => ({ size })))}
        {sizes.map((size) => (
          <Button key={size} size={size} iconOnly aria-label="Add">
            {icon()}
          </Button>
        ))}
      </>
    )

    expect(links().map(box)).toEqual([
      [32, 32],
      [40, 40],
      [48, 48]
    ])
    expect(links().map(box)).toEqual(buttons().map(box))
  })

  it('is a square in every variant, also the ghost one, whose side padding is wider than the others', () => {
    onRoot({ '--enchase-button-padding-inline-ghost': '30px' })
    renderInBrowser(<>{squares(variants.map((variant) => ({ variant })))}</>)

    expect(links().map(box)).toEqual(variants.map(() => [40, 40]))
  })

  it('keeps the box and draws no external icon when it opens a new tab, and the warning text takes no room', () => {
    renderInBrowser(
      <>
        {squares([{ target: '_blank', href: 'https://example.com', 'aria-label': 'Example (opens in a new tab)' }])}
        {squares([{}])}
      </>
    )
    const [external, plain] = links()
    const warning = external.querySelector('[data-slot="visually-hidden"]') as HTMLElement
    const room = warning.getBoundingClientRect()

    expect(box(external)).toEqual(box(plain))
    expect(box(external)).toEqual([40, 40])
    expect(external.querySelectorAll('svg')).toHaveLength(1)
    expect(external.querySelector('[data-slot="button-link-icon"]')).toBeNull()
    expect(warning.textContent).toBe('(abre em nova aba)')
    expect(room.width).toBeLessThanOrEqual(1)
    expect(room.height).toBeLessThanOrEqual(1)
  })

  it('keeps the icon in the middle of the link, also when it opens a new tab', () => {
    renderInBrowser(<>{squares([...sizes.map((size) => ({ size })), { target: '_blank', href: 'https://example.com' }])}</>)

    for (const element of links()) {
      const frame = element.getBoundingClientRect()
      const mark = (element.querySelector('svg') as SVGElement).getBoundingClientRect()

      expect(Math.abs(frame.left + frame.width / 2 - (mark.left + mark.width / 2))).toBeLessThanOrEqual(0.5)
      expect(Math.abs(frame.top + frame.height / 2 - (mark.top + mark.height / 2))).toBeLessThanOrEqual(0.5)
    }
  })

  it('follows the control heights of the compact density, and stays a square', () => {
    setDensity('compact')
    renderInBrowser(<>{squares(sizes.map((size) => ({ size })), 16)}</>)

    expect(links().map(box)).toEqual([
      [28, 28],
      [32, 32],
      [40, 40]
    ])
  })

  it('follows the control height tokens of the page', () => {
    onRoot({ '--enchase-control-height-sm': '3rem', '--enchase-control-height-md': '3.5rem', '--enchase-control-height-lg': '4rem' })
    renderInBrowser(<>{squares(sizes.map((size) => ({ size })))}</>)

    expect(links().map(box)).toEqual([
      [48, 48],
      [56, 56],
      [64, 64]
    ])
  })

  it('leaves a link without the prop as it is: wider than tall, with the external icon and no attribute', () => {
    renderInBrowser(
      <ButtonLink href="https://example.com" target="_blank">
        Docs
      </ButtonLink>
    )
    const [link] = links()
    const [width, height] = box(link)

    expect(link.hasAttribute('data-icon-only')).toBe(false)
    expect(link.querySelector('[data-slot="button-link-icon"]')).not.toBeNull()
    expect(getComputedStyle(link).paddingLeft).toBe('24px')
    expect(width).toBeGreaterThan(height)
  })
})
