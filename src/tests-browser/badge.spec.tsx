import { afterEach, describe, expect, it } from 'vitest'

import { contrastRatio } from '@styles/theme/contrast.ts'
import { Badge } from '@components/common/Badge/index.tsx'
import { renderInBrowser } from './harness.tsx'

const variants = ['neutral', 'primary', 'success', 'warning', 'error', 'info'] as const

const added: HTMLStyleElement[] = []

const addStyle = (css: string) => {
  const style = document.createElement('style')
  style.textContent = css
  document.head.prepend(style)
  added.push(style)
}

afterEach(() => {
  added.splice(0).forEach((style) => style.remove())
})

const badges = () => [...document.body.querySelectorAll<HTMLElement>('[data-slot="badge"]')]

describe('Badge in a real browser', () => {
  it.each(['light', 'dark'] as const)('keeps the text of every variant readable in the %s theme', (mode) => {
    renderInBrowser(
      <>
        {variants.map((variant) => (
          <Badge key={variant} variant={variant}>
            {variant}
          </Badge>
        ))}
      </>,
      'never',
      mode
    )
    const backgrounds = new Set<string>()

    for (const badge of badges()) {
      const style = getComputedStyle(badge)

      backgrounds.add(style.backgroundColor)
      expect(contrastRatio(style.color, style.backgroundColor), `${badge.dataset.variant} in ${mode}`).toBeGreaterThanOrEqual(4.5)
    }

    expect(backgrounds.size).toBe(variants.length)
  })

  it('is a pill that flows inline with the text and keeps its height by size', () => {
    renderInBrowser(
      <p>
        Estado <Badge size="sm">pequeno</Badge> <Badge size="md">médio</Badge>
      </p>
    )
    const [small, medium] = badges()

    expect(getComputedStyle(small).display).toBe('inline-flex')
    expect(parseFloat(getComputedStyle(small).borderTopLeftRadius)).toBeGreaterThan(100)
    expect(small.getBoundingClientRect().height).toBeCloseTo(20, 0)
    expect(medium.getBoundingClientRect().height).toBeCloseTo(24, 0)
  })

  it('lets the caller class win on layout even when its css loads before the library', () => {
    addStyle('.mine { min-block-size: 40px; padding-inline: 20px; border-radius: 3px; }')
    renderInBrowser(<Badge className="mine">Meu</Badge>)
    const style = getComputedStyle(badges()[0])

    expect(style.minHeight).toBe('40px')
    expect(style.paddingInlineStart).toBe('20px')
    expect(style.borderTopLeftRadius).toBe('3px')
  })

  it('lets the caller class win on colors even when its css loads before the library', () => {
    addStyle('.mine { background-color: rgb(1, 2, 3); color: rgb(250, 251, 252); }')
    renderInBrowser(
      <Badge className="mine" variant="error">
        Meu
      </Badge>
    )
    const style = getComputedStyle(badges()[0])

    expect(style.backgroundColor).toBe('rgb(1, 2, 3)')
    expect(style.color).toBe('rgb(250, 251, 252)')
  })
})
