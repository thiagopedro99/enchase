import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'

import { Accordion } from '@components/common/Accordion/index.tsx'
import { renderInBrowser } from '../../../support/harness.tsx'
import { onRoot, part, parts, style } from '../../../support/hookProbes.ts'
import { waitForSettled } from '../../../support/settle.ts'

const items = [
  { value: 'shipping', title: 'Envio', content: <p>Enviamos em até dois dias.</p> },
  { value: 'returns', title: 'Devoluções', content: <p>Aceitamos em até trinta dias.</p> },
  { value: 'payment', title: 'Pagamento', content: <p>Cartão, Pix e boleto.</p> }
]

const turns = (element: HTMLElement) => {
  const matrix = new DOMMatrix(getComputedStyle(element).transform)

  return Math.round((Math.atan2(matrix.b, matrix.a) * 180) / Math.PI)
}

const sides = ['top', 'right', 'bottom', 'left'] as const

const frame = () => sides.map((side) => style('accordion').getPropertyValue(`border-${side}-width`))

const itemLines = () => parts('accordion-item').map((item) => getComputedStyle(item).borderTopWidth)

const box = (name: string, index = 0) => part(name, index).getBoundingClientRect()

afterEach(() => {
  document.documentElement.removeAttribute('style')
  document.documentElement.removeAttribute('dir')
})

describe('the outline of the Accordion in a real browser', () => {
  it('draws a frame and a line between the items, with no attribute on the root, by default', () => {
    renderInBrowser(<Accordion items={items} />)

    expect(frame()).toEqual(['1px', '1px', '1px', '1px'])
    expect(itemLines()).toEqual(['0px', '1px', '1px'])
    expect(part('accordion').hasAttribute('data-variant')).toBe(false)
  })

  it('takes the frame away and keeps the lines between the items when it is borderless', () => {
    renderInBrowser(<Accordion items={items} variant="borderless" />)

    expect(frame()).toEqual(['0px', '0px', '0px', '0px'])
    expect(itemLines()).toEqual(['0px', '1px', '1px'])
  })

  it('takes the frame and the lines away when it is ghost', () => {
    renderInBrowser(<Accordion items={items} variant="ghost" />)

    expect(frame()).toEqual(['0px', '0px', '0px', '0px'])
    expect(itemLines()).toEqual(['0px', '0px', '0px'])
  })

  it('keeps the size of the triggers and of the panels in every outline', async () => {
    renderInBrowser(
      <>
        <Accordion items={items} defaultValue={['returns']} />
        <Accordion items={items} defaultValue={['returns']} variant="borderless" />
        <Accordion items={items} defaultValue={['returns']} variant="ghost" />
      </>
    )

    const sizes = (index: number) => [box('accordion-trigger', index * 3).height, box('accordion-trigger', index * 3 + 1).height, box('accordion-panel', index * 3 + 1).height]

    expect(sizes(1)).toEqual(sizes(0))
    expect(sizes(2)).toEqual(sizes(0))
  })

  it('keeps the color of the lines between the items in its hook, and the frame in its own, which a borderless list does not show', () => {
    onRoot({ '--enchase-accordion-item-border-color': 'rgb(1, 2, 3)', '--enchase-accordion-border-color': 'rgb(4, 5, 6)' })
    renderInBrowser(
      <>
        <Accordion items={items} />
        <Accordion items={items} variant="borderless" />
      </>
    )

    expect(getComputedStyle(parts('accordion-item')[1]).borderTopColor).toBe('rgb(1, 2, 3)')
    expect(getComputedStyle(parts('accordion-item')[4]).borderTopColor).toBe('rgb(1, 2, 3)')
    expect(getComputedStyle(parts('accordion')[0]).borderTopColor).toBe('rgb(4, 5, 6)')
    expect(getComputedStyle(parts('accordion')[1]).borderTopWidth).toBe('0px')
  })
})

describe('the arrow of the Accordion in a real browser', () => {
  it('is after the title, pointing down and turning up when the item opens, by default', async () => {
    renderInBrowser(<Accordion items={items} />)

    expect(box('accordion-icon').left).toBeGreaterThan(box('accordion-title').right)
    expect(turns(part('accordion-icon'))).toBe(0)

    await userEvent.click(part('accordion-trigger'))
    await waitForSettled(() => part('accordion-trigger'))

    expect(Math.abs(turns(part('accordion-icon')))).toBe(180)
  })

  it('is before the title when it is at the start, pointing forward and turning down when the item opens', async () => {
    renderInBrowser(<Accordion items={items} iconPosition="start" />)

    expect(box('accordion-icon').right).toBeLessThanOrEqual(box('accordion-title').left)
    expect(turns(part('accordion-icon'))).toBe(-90)

    await userEvent.click(part('accordion-trigger'))
    await waitForSettled(() => part('accordion-trigger'))

    expect(turns(part('accordion-icon'))).toBe(0)
  })

  it('leaves the title next to the arrow, a gap of the trigger away, and not pushed to the other side', () => {
    onRoot({ '--enchase-accordion-trigger-gap': '20px' })
    renderInBrowser(<Accordion items={items} iconPosition="start" />)

    expect(Math.round(box('accordion-title').left - box('accordion-icon').right)).toBe(20)
    expect(Math.round(box('accordion-icon').left - box('accordion-trigger').left - parseFloat(style('accordion-trigger').paddingLeft))).toBe(0)
  })

  it('goes to the other side, pointing the other way, when the text runs from right to left', async () => {
    document.documentElement.setAttribute('dir', 'rtl')
    renderInBrowser(<Accordion items={items} iconPosition="start" />)

    expect(box('accordion-icon').left).toBeGreaterThanOrEqual(box('accordion-title').right)
    expect(turns(part('accordion-icon'))).toBe(90)

    await userEvent.click(part('accordion-trigger'))
    await waitForSettled(() => part('accordion-trigger'))

    expect(turns(part('accordion-icon'))).toBe(0)
  })

  it('keeps the tab order and the arrow keys of the list, which move through the triggers', async () => {
    renderInBrowser(<Accordion items={items} iconPosition="start" variant="ghost" />)

    await userEvent.tab()
    expect(document.activeElement).toBe(parts('accordion-trigger')[0])

    await userEvent.keyboard('{ArrowDown}{ArrowDown}')
    expect(document.activeElement).toBe(parts('accordion-trigger')[2])

    await userEvent.keyboard('{Enter}')
    expect(parts('accordion-trigger')[2].getAttribute('aria-expanded')).toBe('true')
  })

  it('does not open an item that is disabled when the arrow is at the start', async () => {
    renderInBrowser(<Accordion items={[{ ...items[0], disabled: true }, items[1]]} iconPosition="start" />)

    await userEvent.click(parts('accordion-trigger')[0], { force: true })

    expect(parts('accordion-trigger')[0].getAttribute('aria-expanded')).toBe('false')
  })
})
