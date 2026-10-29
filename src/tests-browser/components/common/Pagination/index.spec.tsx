import { afterEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { contrastRatio } from '@styles/theme/contrast.ts'
import { Pagination } from '@components/common/Pagination/index.tsx'
import { renderInBrowser } from '../../../support/harness.tsx'
import { setForcedColors } from '../../../support/media.ts'
import { unlessWebkit } from '../../../support/browserSkips.ts'

const surfaces = ['surface', 'background', 'surface-container-high'] as const

const added: HTMLStyleElement[] = []

const addStyle = (css: string) => {
  const style = document.createElement('style')
  style.textContent = css
  document.head.prepend(style)
  added.push(style)
}

afterEach(async () => {
  added.splice(0).forEach((style) => style.remove())
  await setForcedColors('none')
})

const part = (name: string, index = 0) => document.body.querySelectorAll<HTMLElement>(`[data-slot="${name}"]`)[index]

const pages = () => [...document.body.querySelectorAll<HTMLElement>('[data-slot="pagination-page"]')]

const currentPage = () => document.body.querySelector('[data-slot="pagination-page"][aria-current="page"]')?.textContent

const surface = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(`--enchase-color-${name}`).trim()

const rect = (element: Element) => element.getBoundingClientRect()

describe('Pagination in a real browser', () => {
  it('is exposed as a named navigation with a button per page and the current one marked', () => {
    renderInBrowser(<Pagination pageCount={5} defaultPage={3} ariaLabel="Resultados" />)

    expect(page.getByRole('navigation', { name: 'Resultados' }).element()).toBe(part('pagination'))
    expect(page.getByRole('button', { name: 'Página anterior' }).element()).toBe(part('pagination-previous'))
    expect(page.getByRole('button', { name: 'Próxima página' }).element()).toBe(part('pagination-next'))
    expect(pages().map((button) => button.textContent)).toEqual(['1', '2', '3', '4', '5'])
    expect(currentPage()).toBe('3')
  })

  it('moves with the mouse through the pages, previous and next', async () => {
    renderInBrowser(<Pagination pageCount={5} />)

    await userEvent.click(page.getByRole('button', { name: '4' }))
    expect(currentPage()).toBe('4')

    await userEvent.click(part('pagination-next'))
    expect(currentPage()).toBe('5')

    await userEvent.click(part('pagination-previous'))
    await userEvent.click(part('pagination-previous'))
    expect(currentPage()).toBe('3')
  })

  it('is reachable by keyboard and selects with Enter and Space', async () => {
    renderInBrowser(<Pagination pageCount={5} />)

    await userEvent.tab()
    expect(document.activeElement).toBe(part('pagination-previous'))

    await userEvent.tab()
    await userEvent.tab()
    expect(document.activeElement).toBe(pages()[1])

    await userEvent.keyboard('{Enter}')
    expect(currentPage()).toBe('2')

    await userEvent.tab()
    await userEvent.keyboard(' ')
    expect(currentPage()).toBe('3')
  })

  it('keeps the focus on next when it becomes unavailable on the last page', async () => {
    renderInBrowser(<Pagination pageCount={3} defaultPage={2} />)

    await userEvent.click(part('pagination-next'))

    expect(currentPage()).toBe('3')
    expect(part('pagination-next').getAttribute('aria-disabled')).toBe('true')
    expect(document.activeElement).toBe(part('pagination-next'))
    expect(getComputedStyle(part('pagination-next')).cursor).toBe('not-allowed')

    await userEvent.click(part('pagination-next'), { force: true })

    expect(currentPage()).toBe('3')
  })

  it('draws a 40 px square button by default and a 32 px one when small', () => {
    renderInBrowser(
      <>
        <Pagination pageCount={5} ariaLabel="Média" />
        <Pagination pageCount={5} size="sm" ariaLabel="Pequena" />
      </>
    )
    const medium = pages()[0]
    const small = pages()[5]

    expect(rect(medium).width).toBeCloseTo(40, 0)
    expect(rect(medium).height).toBeCloseTo(40, 0)
    expect(rect(small).width).toBeCloseTo(32, 0)
    expect(rect(small).height).toBeCloseTo(32, 0)
    expect(rect(part('pagination-previous', 1)).height).toBeCloseTo(32, 0)
  })

  it('keeps every button at least 24 by 24 px, even with large page numbers', () => {
    renderInBrowser(<Pagination pageCount={12345} defaultPage={6172} size="sm" />)

    for (const button of [part('pagination-previous'), ...pages(), part('pagination-next')]) {
      expect(rect(button).width).toBeGreaterThanOrEqual(24)
      expect(rect(button).height).toBeGreaterThanOrEqual(24)
    }
  })

  it.each(['light', 'dark'] as const)('keeps the page numbers and the current page readable in the %s theme', (mode) => {
    renderInBrowser(<Pagination pageCount={20} defaultPage={10} />, 'never', mode)
    const current = getComputedStyle(part('pagination-page', 2))
    const other = getComputedStyle(part('pagination-page', 0))

    expect(part('pagination-page', 2).getAttribute('aria-current')).toBe('page')
    expect(contrastRatio(current.color, current.backgroundColor), 'current page').toBeGreaterThanOrEqual(4.5)

    for (const name of surfaces) {
      expect(contrastRatio(other.color, surface(name)), `page on ${name}`).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(getComputedStyle(part('pagination-ellipsis')).color, surface(name)), `ellipsis on ${name}`).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(current.backgroundColor, surface(name)), `current page fill on ${name}`).toBeGreaterThanOrEqual(3)
    }
  })

  it('shows a visible focus ring on the focused button when reached by keyboard', async () => {
    renderInBrowser(<Pagination pageCount={5} />)

    await userEvent.tab()
    await userEvent.tab()
    const style = getComputedStyle(pages()[0])

    expect(document.activeElement).toBe(pages()[0])
    expect(style.outlineStyle).toBe('solid')
    expect(parseFloat(style.outlineWidth)).toBeGreaterThanOrEqual(2)
    expect(getComputedStyle(pages()[1]).outlineStyle).toBe('none')

    for (const name of surfaces) expect(contrastRatio(style.outlineColor, surface(name)), name).toBeGreaterThanOrEqual(3)
  })

  it('lightens the button under the pointer and not the unavailable one', async () => {
    renderInBrowser(<Pagination pageCount={5} />, 'never')
    const layer = (element: HTMLElement) => parseFloat(getComputedStyle(element, '::after').opacity)

    expect(layer(pages()[2])).toBe(0)

    await userEvent.hover(pages()[2])
    expect(layer(pages()[2])).toBeGreaterThan(0)

    await userEvent.hover(part('pagination-previous'))
    expect(layer(part('pagination-previous'))).toBe(0)
  })

  it('wraps inside a narrow container without overflowing', () => {
    renderInBrowser(
      <div style={{ inlineSize: 180 }}>
        <Pagination pageCount={30} defaultPage={15} siblingCount={2} boundaryCount={2} />
      </div>
    )
    const container = part('pagination').parentElement as HTMLElement

    expect(container.scrollWidth).toBeLessThanOrEqual(container.clientWidth)
    expect(rect(pages().at(-1) as HTMLElement).top).toBeGreaterThan(rect(pages()[0]).top)
  })

  it('mirrors the order and the arrows in right-to-left text', () => {
    document.documentElement.setAttribute('dir', 'rtl')
    renderInBrowser(<Pagination pageCount={5} />)
    const arrow = (name: string) => getComputedStyle(part(name).querySelector('svg') as SVGElement).transform

    expect(rect(pages()[0]).left).toBeGreaterThan(rect(pages()[4]).left)
    expect(rect(part('pagination-previous')).left).toBeGreaterThan(rect(pages()[0]).left)
    expect(rect(part('pagination-next')).left).toBeLessThan(rect(pages()[4]).left)
    expect(arrow('pagination-previous')).toBe('matrix(-1, 0, 0, 1, 0, 0)')
    expect(arrow('pagination-next')).toBe('matrix(-1, 0, 0, 1, 0, 0)')
  })

  it('points the arrows outward in left-to-right text', () => {
    renderInBrowser(<Pagination pageCount={5} />)

    expect(rect(part('pagination-previous')).left).toBeLessThan(rect(pages()[0]).left)
    expect(rect(part('pagination-next')).left).toBeGreaterThan(rect(pages()[4]).left)
    expect(getComputedStyle(part('pagination-previous').querySelector('svg') as SVGElement).transform).toBe('none')
  })

  it('lets the caller class and slot selectors win on layout even when its css loads before the library', () => {
    addStyle('.mine { max-inline-size: 300px; } [data-slot="pagination-list"] { gap: 17px; } [data-slot="pagination-page"] { min-inline-size: 60px; }')
    renderInBrowser(<Pagination pageCount={4} className="mine" />)

    expect(getComputedStyle(part('pagination-list')).columnGap).toBe('17px')
    expect(rect(pages()[0]).width).toBeGreaterThanOrEqual(60)
    expect(rect(part('pagination')).width).toBeLessThanOrEqual(300)
  })
})

describe('Pagination motion in a real browser', () => {
  it('fades the button highlight with the duration of the fade recipe', () => {
    renderInBrowser(<Pagination pageCount={5} />, 'auto')

    expect(parseFloat(getComputedStyle(pages()[0], '::after').transitionDuration)).toBeCloseTo(0.15, 2)
  })

  it('takes the duration from the animation tuning', () => {
    renderInBrowser(<Pagination pageCount={5} animation={{ tuning: { duration: 0.4 } }} />, 'auto')

    expect(parseFloat(getComputedStyle(pages()[0], '::after').transitionDuration)).toBeCloseTo(0.4, 2)
  })

  it.each([
    ['never mode', undefined, 'never'],
    ['animation={false}', false, 'auto']
  ] as const)('highlights at once with %s', (_name, animation, motion) => {
    renderInBrowser(<Pagination pageCount={5} animation={animation} />, motion)

    expect(parseFloat(getComputedStyle(pages()[0], '::after').transitionDuration)).toBe(0)
  })
})

describe('Pagination in forced colors', () => {
  const run = unlessWebkit('forcedColors') ? it : it.skip

  run('draws the current page with a thicker border so it still stands out', async () => {
    renderInBrowser(<Pagination pageCount={5} defaultPage={2} />)

    await setForcedColors('active')
    const current = getComputedStyle(pages()[1])
    const other = getComputedStyle(pages()[0])

    expect(parseFloat(current.borderTopWidth)).toBeGreaterThan(parseFloat(other.borderTopWidth))
    expect(current.borderTopColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(other.borderTopColor).not.toBe('rgba(0, 0, 0, 0)')
  })
})
