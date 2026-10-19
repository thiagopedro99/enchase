import { afterEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { contrastRatio } from '@styles/theme/contrast.ts'
import { Table } from '@components/common/Table/index.tsx'
import { renderInBrowser } from './harness.tsx'
import { setForcedColors } from './media.ts'
import { unlessWebkit } from './browserSkips.ts'

import type { TableColumn } from '@components/common/Table/types.ts'

type Order = { id: string; customer: string; city: string; status: string; total: number }

const orders: Order[] = [
  { id: '#1001', customer: 'Ana Souza', city: 'São Paulo', status: 'Pago', total: 1289.9 },
  { id: '#1002', customer: 'Bruno Lima', city: 'Recife', status: 'Pendente', total: 349 },
  { id: '#1003', customer: 'Carla Mendes', city: 'Curitiba', status: 'Pago', total: 87.5 },
  { id: '#1004', customer: 'Diego Alves', city: 'Salvador', status: 'Atrasado', total: 2150 }
]

const columns: TableColumn<Order>[] = [
  { key: 'id', header: 'Pedido', rowHeader: true },
  { key: 'customer', header: 'Cliente' },
  { key: 'city', header: 'Cidade' },
  { key: 'status', header: 'Situação' },
  { key: 'total', header: 'Total', align: 'end', cell: (row) => `R$ ${row.total.toFixed(2)}` }
]

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

const parts = (name: string) => [...document.body.querySelectorAll<HTMLElement>(`[data-slot="${name}"]`)]

const surface = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(`--enchase-color-${name}`).trim()

const rect = (element: Element) => element.getBoundingClientRect()

const textRect = (element: HTMLElement) => {
  const range = document.createRange()

  range.selectNodeContents(element)

  return range.getBoundingClientRect()
}

describe('Table in a real browser', () => {
  it('is exposed as a named table with column headers, row headers and cells', () => {
    renderInBrowser(<Table caption="Pedidos" columns={columns} rows={orders} />)

    expect(page.getByRole('table', { name: 'Pedidos' }).element()).toBe(part('table-element'))
    expect(page.getByRole('columnheader').elements()).toHaveLength(5)
    expect(page.getByRole('rowheader').elements()).toHaveLength(4)
    expect(page.getByRole('cell').elements()).toHaveLength(16)
    expect(page.getByRole('row').elements()).toHaveLength(5)
  })

  it('fills the width of its container and lines every header up with the cells of its column', () => {
    renderInBrowser(
      <div style={{ inlineSize: 700 }}>
        <Table caption="Pedidos" columns={columns} rows={orders} />
      </div>
    )
    const headers = parts('table-header')
    const firstRow = [part('table-row-header'), ...parts('table-cell').slice(0, 4)]

    expect(rect(part('table')).width).toBeCloseTo(700, 0)
    expect(rect(part('table-element')).width).toBeGreaterThan(690)

    headers.forEach((header, index) => {
      expect(rect(header).left, `column ${index}`).toBeCloseTo(rect(firstRow[index]).left, 0)
      expect(rect(header).width, `column ${index}`).toBeCloseTo(rect(firstRow[index]).width, 0)
    })
  })

  it('divides the rows with a line and leaves the last one to the border of the container', () => {
    renderInBrowser(<Table columns={columns} rows={orders} />)
    const bottom = (row: number) => parseFloat(getComputedStyle(parts('table-row')[row].querySelector('td') as HTMLElement).borderBottomWidth)

    expect(bottom(0)).toBe(1)
    expect(bottom(2)).toBe(1)
    expect(bottom(3)).toBe(0)
    expect(parseFloat(getComputedStyle(part('table-header')).borderBottomWidth)).toBe(1)
    expect(parseFloat(getComputedStyle(part('table')).borderTopWidth)).toBe(1)
  })

  it('aligns the text of an end column to the end of its cell in both directions', () => {
    renderInBrowser(<Table columns={columns} rows={orders} />)
    const cell = parts('table-cell')[3]
    const padding = parseFloat(getComputedStyle(cell).paddingInlineEnd)

    expect(textRect(cell).right).toBeCloseTo(rect(cell).right - padding, 0)
    expect(textRect(cell).left).toBeGreaterThan(rect(cell).left + padding + 5)
  })

  it('aligns the text of an end column to the left in right-to-left text', () => {
    document.documentElement.setAttribute('dir', 'rtl')
    renderInBrowser(<Table columns={columns} rows={orders} />)
    const cell = parts('table-cell')[3]
    const padding = parseFloat(getComputedStyle(cell).paddingInlineEnd)

    expect(textRect(cell).left).toBeCloseTo(rect(cell).left + padding, 0)
    expect(rect(parts('table-header')[0]).left).toBeGreaterThan(rect(parts('table-header')[4]).left)
  })

  it('centers the text of a center column and starts the others at the start', () => {
    renderInBrowser(<Table columns={[{ key: 'id', header: 'Pedido' }, { key: 'status', header: 'Situação', align: 'center' }]} rows={orders} />)
    const [first, second] = parts('table-cell').slice(0, 2)
    const middle = (element: HTMLElement) => (textRect(element).left + textRect(element).right) / 2

    expect(textRect(first).left).toBeCloseTo(rect(first).left + parseFloat(getComputedStyle(first).paddingInlineStart), 0)
    expect(middle(second)).toBeCloseTo((rect(second).left + rect(second).right) / 2, 0)
  })

  it.each(['light', 'dark'] as const)('keeps the headers, the cells and the empty text readable in the %s theme', (mode) => {
    renderInBrowser(
      <>
        <Table caption="Cheia" columns={columns} rows={orders} striped />
        <Table caption="Vazia" columns={columns} rows={[]} empty="Nenhum pedido" />
      </>,
      'never',
      mode
    )
    const header = getComputedStyle(part('table-header'))
    const cell = getComputedStyle(part('table-cell'))
    const striped = getComputedStyle(parts('table-row')[1])

    expect(contrastRatio(header.color, header.backgroundColor), 'header').toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(cell.color, striped.backgroundColor), 'cell on a striped row').toBeGreaterThanOrEqual(4.5)

    for (const name of surfaces) {
      expect(contrastRatio(cell.color, surface(name)), `cell on ${name}`).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(getComputedStyle(part('table-caption')).color, surface(name)), `caption on ${name}`).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(getComputedStyle(part('table-empty')).color, surface(name)), `empty on ${name}`).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('shades every other row when striped and none when plain', () => {
    renderInBrowser(
      <>
        <Table caption="Zebra" columns={columns} rows={orders} striped />
        <Table caption="Lisa" columns={columns} rows={orders} />
      </>
    )
    const background = (index: number) => getComputedStyle(parts('table-row')[index]).backgroundColor
    const transparent = 'rgba(0, 0, 0, 0)'

    expect([background(0), background(1), background(2), background(3)]).toEqual([transparent, expect.not.stringMatching(/^rgba\(0, 0, 0, 0\)$/), transparent, expect.not.stringMatching(/^rgba\(0, 0, 0, 0\)$/)])
    expect([background(4), background(5), background(6), background(7)]).toEqual([transparent, transparent, transparent, transparent])
  })

  it('highlights the row under the pointer, over the stripes, and never the header', async () => {
    renderInBrowser(<Table columns={columns} rows={orders} striped />)
    const background = (element: HTMLElement) => getComputedStyle(element).backgroundColor
    const stripe = background(parts('table-row')[1])

    await userEvent.hover(parts('table-row')[1])
    expect(background(parts('table-row')[1])).not.toBe(stripe)

    await userEvent.hover(parts('table-row')[0])
    expect(background(parts('table-row')[0])).not.toBe('rgba(0, 0, 0, 0)')
    expect(background(parts('table-row')[1])).toBe(stripe)

    await userEvent.hover(part('table-header'))
    expect(getComputedStyle(part('table-header')).backgroundColor).toBe(getComputedStyle(parts('table-header')[1]).backgroundColor)
  })

  it('packs the rows tighter and the text smaller when small', () => {
    renderInBrowser(
      <>
        <Table caption="Média" columns={columns} rows={orders} />
        <Table caption="Pequena" columns={columns} rows={orders} size="sm" />
      </>
    )
    const medium = getComputedStyle(parts('table-cell')[0])
    const small = getComputedStyle(parts('table-cell')[20])

    expect(rect(parts('table-row')[4]).height).toBeLessThan(rect(parts('table-row')[0]).height)
    expect(parseFloat(small.paddingBlockStart)).toBeLessThan(parseFloat(medium.paddingBlockStart))
    expect(parseFloat(small.paddingInlineStart)).toBeLessThan(parseFloat(medium.paddingInlineStart))
    expect(parseFloat(small.fontSize)).toBeLessThan(parseFloat(medium.fontSize))
    expect(parseFloat(getComputedStyle(parts('table-header')[5]).paddingBlockStart)).toBeLessThan(parseFloat(getComputedStyle(parts('table-header')[0]).paddingBlockStart))
  })

  it('keeps long unbreakable content inside the box and the page out of horizontal scroll', () => {
    renderInBrowser(
      <div style={{ inlineSize: 240 }}>
        <Table columns={[{ key: 'id', header: 'Pedido' }, { key: 'customer', header: 'Cliente' }]} rows={[{ id: '#1', customer: 'bartholomew.fitzgerald@northwind-industries-holdings.example.com' }]} />
      </div>
    )

    expect(rect(part('table')).width).toBeLessThanOrEqual(240)
    expect(part('table').scrollWidth).toBeGreaterThan(part('table').clientWidth)
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(document.documentElement.clientWidth)
  })

  it('lets the caller class and slot selectors win on layout even when its css loads before the library', () => {
    addStyle('.mine { max-inline-size: 500px; } [data-slot="table-cell"] { padding-block: 21px; } [data-slot="table-header"] { text-align: center; }')
    renderInBrowser(<Table columns={columns} rows={orders} className="mine" />)

    expect(rect(part('table')).width).toBeLessThanOrEqual(500)
    expect(getComputedStyle(part('table-cell')).paddingBlockStart).toBe('21px')
    expect(getComputedStyle(part('table-header')).textAlign).toBe('center')
  })
})

describe('Table scrolling in a real browser', () => {
  const wide = (
    <div style={{ inlineSize: 260 }}>
      <Table caption="Pedidos" columns={columns} rows={orders} />
    </div>
  )

  it('becomes a focusable region named after the caption when the table is wider than its box', () => {
    renderInBrowser(wide)

    expect(part('table').scrollWidth).toBeGreaterThan(part('table').clientWidth)
    expect(part('table').getAttribute('tabindex')).toBe('0')
    expect(page.getByRole('region', { name: 'Pedidos' }).element()).toBe(part('table'))
  })

  it('takes the focus once with Tab and scrolls with the arrow keys', async () => {
    renderInBrowser(
      <>
        <button>Antes</button>
        {wide}
        <button>Depois</button>
      </>
    )

    await userEvent.tab()
    expect(document.activeElement).toBe(page.getByRole('button', { name: 'Antes' }).element())

    await userEvent.tab()
    expect(document.activeElement).toBe(part('table'))
    expect(part('table').scrollLeft).toBe(0)

    await userEvent.keyboard('{ArrowRight}{ArrowRight}')
    await expect.poll(() => part('table').scrollLeft).toBeGreaterThan(0)

    await userEvent.tab()
    expect(document.activeElement).toBe(page.getByRole('button', { name: 'Depois' }).element())
  })

  it('shows a visible focus ring on the region when reached by keyboard', async () => {
    renderInBrowser(wide)

    await userEvent.tab()
    const style = getComputedStyle(part('table'))

    expect(style.outlineStyle).toBe('solid')
    expect(parseFloat(style.outlineWidth)).toBeGreaterThanOrEqual(2)

    for (const name of surfaces) expect(contrastRatio(style.outlineColor, surface(name)), name).toBeGreaterThanOrEqual(3)
  })

  it('is not a tab stop while the table fits', async () => {
    renderInBrowser(
      <>
        <button>Antes</button>
        <div style={{ inlineSize: 900 }}>
          <Table caption="Pedidos" columns={columns} rows={orders} />
        </div>
        <button>Depois</button>
      </>
    )

    expect(part('table').hasAttribute('tabindex')).toBe(false)
    expect(part('table').hasAttribute('role')).toBe(false)

    await userEvent.tab()
    await userEvent.tab()

    expect(document.activeElement).toBe(page.getByRole('button', { name: 'Depois' }).element())
  })

  it('follows the width of its box: focusable when it shrinks and plain again when it grows', async () => {
    renderInBrowser(
      <div id="box" style={{ inlineSize: 900 }}>
        <Table caption="Pedidos" columns={columns} rows={orders} />
      </div>
    )
    const box = document.getElementById('box') as HTMLElement

    expect(part('table').hasAttribute('tabindex')).toBe(false)

    box.style.inlineSize = '260px'
    await expect.poll(() => part('table').getAttribute('tabindex')).toBe('0')

    box.style.inlineSize = '900px'
    await expect.poll(() => part('table').hasAttribute('tabindex')).toBe(false)
  })

  it('follows a change of the rows that makes the table wider', async () => {
    const Growing = () => (
      <div style={{ inlineSize: 320 }}>
        <Table caption="Pedidos" columns={[{ key: 'id', header: 'Pedido' }, { key: 'customer', header: 'Cliente' }]} rows={[{ id: '#1', customer: 'Ana' }]} />
      </div>
    )
    renderInBrowser(<Growing />)

    expect(part('table').hasAttribute('tabindex')).toBe(false)

    part('table-cell', 1).textContent = 'bartholomew.fitzgerald@northwind-industries-holdings.example.com'

    await expect.poll(() => part('table').getAttribute('tabindex')).toBe('0')
  })
})

describe('Table in forced colors', () => {
  const run = unlessWebkit('forcedColors') ? it : it.skip

  run('keeps the lines between the rows and under the header so the structure still shows', async () => {
    renderInBrowser(<Table columns={columns} rows={orders} />)

    await setForcedColors('active')
    const cell = getComputedStyle(part('table-cell'))
    const header = getComputedStyle(part('table-header'))

    expect(cell.borderBottomStyle).toBe('solid')
    expect(cell.borderBottomColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(header.borderBottomColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(parseInt(header.fontWeight)).toBeGreaterThanOrEqual(600)
    expect(getComputedStyle(part('table')).borderTopStyle).toBe('solid')
  })
})
