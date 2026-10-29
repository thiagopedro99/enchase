import { render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'

import { Grid } from '@components/common/Grid/index.tsx'
import UIProvider from '@components/uiProvider/index.tsx'
import { renderInBrowser } from '../../../support/harness.tsx'

import type { GridProps } from '@components/common/Grid/types.ts'
import type { ReactNode } from 'react'

afterEach(async () => {
  await page.viewport(1280, 800)
})

const cells = (count: number) => Array.from({ length: count }, (_, index) => <div key={index}>{`Cell ${index + 1}`}</div>)

const grid = (id = 'grid') => page.getByTestId(id).element() as HTMLElement

const boxes = (id = 'grid') => Array.from(grid(id).children).map((child) => child.getBoundingClientRect())

const rowsOf = (id = 'grid') =>
  boxes(id).reduce<DOMRect[][]>((rows, box) => {
    const last = rows.at(-1)

    if (last && Math.abs(last[0].top - box.top) < 1) last.push(box)
    else rows.push([box])

    return rows
  }, [])

const columnsOf = () => new Set(boxes().map((box) => Math.round(box.left))).size

const marginsOf = (row: DOMRect[]) => {
  const outer = grid().getBoundingClientRect()

  return { start: row[0].left - outer.left, end: outer.right - row.at(-1)!.right }
}

const show = (ui: ReactNode) => renderInBrowser(<div style={{ inlineSize: '100%' }}>{ui}</div>)

const widthOf = (columns: GridProps['columns'], count = 6) => {
  show(
    <Grid data-testid="grid" columns={columns}>
      {cells(count)}
    </Grid>
  )
}

describe('Grid with columns by breakpoint in a real browser', () => {
  it('changes the number of columns at the default breakpoints, mobile first', async () => {
    widthOf({ xs: 1, md: 2, xl: 4 }, 8)

    for (const [width, expected] of [
      [400, 1],
      [767, 1],
      [768, 2],
      [1199, 2],
      [1200, 4],
      [1500, 4]
    ] as const) {
      await page.viewport(width, 800)
      await expect.poll(columnsOf, { message: `${width}px` }).toBe(expected)
    }
  })

  it('keeps the value of the smaller breakpoint until a bigger one is given', async () => {
    widthOf({ md: 3 }, 6)

    await page.viewport(500, 800)
    await expect.poll(columnsOf).toBe(1)

    await page.viewport(900, 800)
    await expect.poll(columnsOf).toBe(3)

    await page.viewport(1500, 800)
    await expect.poll(columnsOf).toBe(3)
  })

  it('uses one column when the object has no valid number', async () => {
    widthOf({ md: Number.NaN, lg: 0 } as GridProps['columns'], 4)

    await page.viewport(1500, 800)
    await expect.poll(columnsOf).toBe(1)
  })

  it('follows the breakpoints of the provider, even where the default ones would apply', async () => {
    renderInBrowser(
      <UIProvider breakpoints={{ md: '900px' }}>
        <Grid data-testid="grid" columns={{ xs: 1, sm: 2, md: 4 }}>
          {cells(8)}
        </Grid>
      </UIProvider>
    )

    for (const [width, expected] of [
      [500, 1],
      [600, 2],
      [800, 2],
      [899, 2],
      [900, 4],
      [1300, 4]
    ] as const) {
      await page.viewport(width, 800)
      await expect.poll(columnsOf, { message: `${width}px` }).toBe(expected)
    }
  })

  it('works with no provider, by the default breakpoints', async () => {
    render(
      <Grid data-testid="grid" columns={{ xs: 1, md: 3 }}>
        {cells(6)}
      </Grid>
    )

    await page.viewport(500, 800)
    await expect.poll(columnsOf).toBe(1)

    await page.viewport(1000, 800)
    await expect.poll(columnsOf).toBe(3)
  })

  it('does not take the columns of a Grid around it', async () => {
    show(
      <Grid data-testid="outer" columns={{ xs: 1, md: 3 }}>
        <Grid data-testid="grid" columns={{ xs: 1 }}>
          {cells(4)}
        </Grid>
      </Grid>
    )

    await page.viewport(1200, 800)
    await expect.poll(columnsOf).toBe(1)
  })

  it('shares the width evenly, with the gap of the prop', async () => {
    show(
      <Grid data-testid="grid" columns={{ xs: 3 }} gap="2rem">
        {cells(6)}
      </Grid>
    )
    await page.viewport(1000, 800)
    await expect.poll(() => rowsOf().length).toBe(2)
    const [first] = rowsOf()
    const width = (grid().getBoundingClientRect().width - 64) / 3

    expect(first.map((box) => Math.round(box.width))).toEqual([Math.round(width), Math.round(width), Math.round(width)])
    expect(Math.round(first[1].left - first[0].right)).toBe(32)
  })

  it('prefers the minimum column width over the columns of any shape', async () => {
    show(
      <Grid data-testid="grid" columns={{ xs: 1 }} minColumnWidth="200px">
        {cells(6)}
      </Grid>
    )
    await page.viewport(1000, 800)

    await expect.poll(columnsOf).toBeGreaterThan(3)
    expect(grid().hasAttribute('data-responsive')).toBe(false)
  })
})

describe('Grid centering the last row in a real browser', () => {
  it('keeps the full rows in their columns and centers the last one', async () => {
    show(
      <Grid data-testid="grid" columns={3} centerLastRow>
        {cells(5)}
      </Grid>
    )
    await page.viewport(1000, 800)
    await expect.poll(() => rowsOf().length).toBe(2)
    const [full, last] = rowsOf()
    const outer = grid().getBoundingClientRect()
    const width = (outer.width - 2 * 16) / 3

    expect(full).toHaveLength(3)
    expect(last).toHaveLength(2)
    expect(Math.abs(marginsOf(full).start)).toBeLessThan(1)
    expect(Math.abs(marginsOf(full).end)).toBeLessThan(1)
    for (const box of [...full, ...last]) expect(Math.abs(box.width - width)).toBeLessThan(1)
    expect(Math.abs(marginsOf(last).start - marginsOf(last).end)).toBeLessThan(1)
    expect(marginsOf(last).start).toBeGreaterThan(width / 2 - 1)
  })

  it('centers a single orphan', async () => {
    show(
      <Grid data-testid="grid" columns={4} centerLastRow>
        {cells(5)}
      </Grid>
    )
    await page.viewport(1200, 800)
    await expect.poll(() => rowsOf().length).toBe(2)
    const [, last] = rowsOf()

    expect(last).toHaveLength(1)
    expect(Math.abs(marginsOf(last).start - marginsOf(last).end)).toBeLessThan(1)
  })

  it('has no empty space when the row is complete', async () => {
    show(
      <Grid data-testid="grid" columns={3} centerLastRow>
        {cells(6)}
      </Grid>
    )
    await page.viewport(1000, 800)
    await expect.poll(() => rowsOf().length).toBe(2)

    for (const row of rowsOf()) {
      expect(row).toHaveLength(3)
      expect(Math.abs(marginsOf(row).start)).toBeLessThan(1)
      expect(Math.abs(marginsOf(row).end)).toBeLessThan(1)
    }
  })

  it('follows the columns of each breakpoint and centers the last row of each one', async () => {
    show(
      <Grid data-testid="grid" columns={{ xs: 2, lg: 4 }} centerLastRow>
        {cells(7)}
      </Grid>
    )

    await page.viewport(1100, 800)
    await expect.poll(() => rowsOf().map((row) => row.length)).toEqual([4, 3])
    expect(Math.abs(marginsOf(rowsOf()[1]).start - marginsOf(rowsOf()[1]).end)).toBeLessThan(1)

    await page.viewport(700, 800)
    await expect.poll(() => rowsOf().map((row) => row.length)).toEqual([2, 2, 2, 1])
    expect(Math.abs(marginsOf(rowsOf()[3]).start - marginsOf(rowsOf()[3]).end)).toBeLessThan(1)
  })

  it('never wraps a full row early, whatever the width or the number of columns', async () => {
    show(
      <>
        <Grid data-testid="grid" columns={{ xs: 3 }} centerLastRow gap="0.7rem">
          {cells(9)}
        </Grid>
        <Grid data-testid="four" columns={{ xs: 4 }} centerLastRow gap="0.37rem">
          {cells(8)}
        </Grid>
        <Grid data-testid="seven" columns={{ xs: 7 }} centerLastRow gap="0.13rem">
          {cells(14)}
        </Grid>
      </>
    )
    const expected = { grid: '3,3,3', four: '4,4', seven: '7,7' }
    const failures: string[] = []

    for (let width = 320; width <= 1400; width += 5) {
      await page.viewport(width, 800)
      await expect.poll(() => grid().getBoundingClientRect().width).toBeGreaterThan(0)
      for (const [id, rows] of Object.entries(expected)) if (rowsOf(id).map((row) => row.length).join() !== rows) failures.push(`${id} at ${width}px`)
    }

    expect(failures).toEqual([])
  })

  it('shrinks to fewer columns when the numeric columns do not fit, still centered', async () => {
    show(
      <Grid data-testid="grid" columns={4} centerLastRow>
        {cells(5)}
      </Grid>
    )
    await page.viewport(520, 800)
    await expect.poll(() => rowsOf().map((row) => row.length)).toEqual([2, 2, 1])

    for (const row of rowsOf()) expect(Math.abs(marginsOf(row).start - marginsOf(row).end)).toBeLessThan(1)
  })

  it('stretches the cells of a row to the same height', async () => {
    show(
      <Grid data-testid="grid" columns={3} centerLastRow>
        <div>Short</div>
        <div style={{ blockSize: '6rem' }}>Tall</div>
        <div>Short</div>
        <div>Short</div>
      </Grid>
    )
    await page.viewport(1000, 800)
    await expect.poll(() => rowsOf().length).toBe(2)
    const [first] = rowsOf()

    expect(new Set(first.map((box) => Math.round(box.height))).size).toBe(1)
    expect(first[0].height).toBeGreaterThanOrEqual(96)
  })

  it('mirrors in right-to-left text and keeps the last row centered', async () => {
    document.documentElement.setAttribute('dir', 'rtl')
    show(
      <Grid data-testid="grid" columns={3} centerLastRow>
        {cells(5)}
      </Grid>
    )
    await page.viewport(1000, 800)
    await expect.poll(() => rowsOf().length).toBe(2)
    const [full, last] = rowsOf()

    expect(full[0].left).toBeGreaterThan(full[2].left)
    expect(Math.abs(marginsOf(last).start - marginsOf(last).end)).toBeLessThan(1)
  })

  it('leaves the cells alone without the prop and with a minimum column width', async () => {
    show(
      <Grid data-testid="grid" columns={3}>
        {cells(5)}
      </Grid>
    )
    await page.viewport(1000, 800)
    await expect.poll(() => rowsOf().length).toBe(2)

    expect(marginsOf(rowsOf()[1]).start).toBeLessThan(1)
    expect(grid().hasAttribute('data-center-last')).toBe(false)
  })

  it('ignores the prop with a minimum column width', async () => {
    show(
      <Grid data-testid="grid" minColumnWidth="200px" centerLastRow>
        {cells(5)}
      </Grid>
    )

    expect(grid().hasAttribute('data-center-last')).toBe(false)
    expect(getComputedStyle(grid()).display).toBe('grid')
  })

  it('lets the className and the style of the caller win', async () => {
    const sheet = document.createElement('style')

    sheet.textContent = '.mine { grid-template-columns: 1fr 3fr; }'
    document.head.append(sheet)
    show(
      <Grid data-testid="grid" columns={{ xs: 4 }} className="mine">
        {cells(4)}
      </Grid>
    )
    await page.viewport(1000, 800)

    await expect.poll(columnsOf).toBe(2)
    sheet.remove()
  })
})
