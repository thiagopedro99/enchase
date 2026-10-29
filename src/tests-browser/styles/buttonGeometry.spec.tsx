import { describe, expect, it } from 'vitest'

import { Button } from '@components/common/Button/index.tsx'
import { renderInBrowser } from '../support/harness.tsx'

import type { CSSProperties, ReactNode } from 'react'

const scoped = (style: Record<string, string>, children: ReactNode) => <div style={style as CSSProperties}>{children}</div>

const buttons = () => [...document.body.querySelectorAll<HTMLElement>('[data-slot="button"]')]

const measures = (element: HTMLElement) => {
  const style = getComputedStyle(element)

  return { block: style.paddingTop, inline: style.paddingLeft, size: style.fontSize, weight: style.fontWeight, gap: style.columnGap }
}

const all = (
  <>
    <Button size="sm">Small</Button>
    <Button size="md">Medium</Button>
    <Button size="lg">Large</Button>
    <Button size="md" variant="ghost">
      Ghost
    </Button>
  </>
)

describe('the geometry of the button from the hooks', () => {
  it('keeps the padding, the font size, the weight and the gap of every size', () => {
    renderInBrowser(all)

    expect(buttons().map(measures)).toEqual([
      { block: '4px', inline: '16px', size: '14px', weight: '600', gap: '8px' },
      { block: '4px', inline: '24px', size: '14px', weight: '600', gap: '8px' },
      { block: '4px', inline: '32px', size: '16px', weight: '600', gap: '8px' },
      { block: '4px', inline: '16px', size: '14px', weight: '600', gap: '8px' }
    ])
  })

  it('takes the padding of one size from its hooks and leaves the other sizes alone', () => {
    renderInBrowser(scoped({ '--enchase-button-padding-inline-md': '10px', '--enchase-button-padding-block-md': '9px' }, all))

    expect(buttons().map((button) => [measures(button).block, measures(button).inline])).toEqual([
      ['4px', '16px'],
      ['9px', '10px'],
      ['4px', '32px'],
      ['9px', '16px']
    ])
  })

  it('takes the padding of the small and the large size from their own hooks', () => {
    renderInBrowser(
      scoped(
        {
          '--enchase-button-padding-inline-sm': '11px',
          '--enchase-button-padding-block-sm': '6px',
          '--enchase-button-padding-inline-lg': '13px',
          '--enchase-button-padding-block-lg': '7px'
        },
        all
      )
    )

    expect(buttons().map((button) => [measures(button).block, measures(button).inline])).toEqual([
      ['6px', '11px'],
      ['4px', '24px'],
      ['7px', '13px'],
      ['4px', '16px']
    ])
  })

  it('takes the font size of each size from its own hook', () => {
    renderInBrowser(scoped({ '--enchase-button-font-size-sm': '11px', '--enchase-button-font-size-md': '12px', '--enchase-button-font-size-lg': '20px' }, all))

    expect(buttons().map((button) => measures(button).size)).toEqual(['11px', '12px', '20px', '12px'])
  })

  it('takes the weight and the gap of every button from their hooks', () => {
    renderInBrowser(scoped({ '--enchase-button-font-weight': '500', '--enchase-button-gap': '3px' }, all))

    expect(buttons().map((button) => [measures(button).weight, measures(button).gap])).toEqual([
      ['500', '3px'],
      ['500', '3px'],
      ['500', '3px'],
      ['500', '3px']
    ])
  })

  it('takes the padding of the ghost button from its own hook, whatever its size', () => {
    renderInBrowser(scoped({ '--enchase-button-padding-inline-ghost': '5px' }, all))

    expect(buttons().map((button) => measures(button).inline)).toEqual(['16px', '24px', '32px', '5px'])
  })

  it('follows the scale of the theme when no hook is set', () => {
    renderInBrowser(scoped({ '--enchase-space-lg': '2rem', '--enchase-font-weight-semibold': '700' }, all))

    expect(buttons().map((button) => [measures(button).inline, measures(button).weight])).toEqual([
      ['16px', '700'],
      ['32px', '700'],
      ['32px', '700'],
      ['16px', '700']
    ])
  })
})
