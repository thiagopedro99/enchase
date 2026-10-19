import { describe, expect, it } from 'vitest'

import { paginationItems } from '@utils/paginationItems.ts'

const start = 'start-ellipsis'
const end = 'end-ellipsis'

describe('paginationItems', () => {
  it('lists nothing without pages', () => {
    expect(paginationItems(1, 0, 1, 1)).toEqual([])
  })

  it('lists a single page', () => {
    expect(paginationItems(1, 1, 1, 1)).toEqual([1])
  })

  it('lists every page when they fit', () => {
    expect(paginationItems(1, 3, 1, 1)).toEqual([1, 2, 3])
    expect(paginationItems(4, 7, 1, 1)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('hides the middle behind one ellipsis at the start of the list', () => {
    expect(paginationItems(1, 10, 1, 1)).toEqual([1, 2, 3, 4, 5, end, 10])
    expect(paginationItems(3, 10, 1, 1)).toEqual([1, 2, 3, 4, 5, end, 10])
  })

  it('hides both sides in the middle of the list', () => {
    expect(paginationItems(5, 10, 1, 1)).toEqual([1, start, 4, 5, 6, end, 10])
    expect(paginationItems(6, 20, 1, 1)).toEqual([1, start, 5, 6, 7, end, 20])
  })

  it('hides the middle behind one ellipsis at the end of the list', () => {
    expect(paginationItems(10, 10, 1, 1)).toEqual([1, start, 6, 7, 8, 9, 10])
    expect(paginationItems(8, 10, 1, 1)).toEqual([1, start, 6, 7, 8, 9, 10])
  })

  it('shows the page itself instead of an ellipsis that would hide only one page', () => {
    expect(paginationItems(4, 10, 1, 1)).toEqual([1, 2, 3, 4, 5, end, 10])
    expect(paginationItems(7, 10, 1, 1)).toEqual([1, start, 6, 7, 8, 9, 10])
  })

  it('takes more siblings around the current page', () => {
    expect(paginationItems(10, 20, 2, 1)).toEqual([1, start, 8, 9, 10, 11, 12, end, 20])
    expect(paginationItems(1, 20, 2, 1)).toEqual([1, 2, 3, 4, 5, 6, 7, end, 20])
  })

  it('takes more boundary pages at each end', () => {
    expect(paginationItems(10, 20, 1, 2)).toEqual([1, 2, start, 9, 10, 11, end, 19, 20])
    expect(paginationItems(1, 20, 1, 2)).toEqual([1, 2, 3, 4, 5, 6, end, 19, 20])
  })

  it('works without siblings', () => {
    expect(paginationItems(10, 20, 0, 1)).toEqual([1, start, 10, end, 20])
  })

  it('works without boundary pages', () => {
    const items = paginationItems(10, 20, 1, 0)

    expect(items).toContain(10)
    expect(items.filter((item) => typeof item === 'number')).toEqual([...items.filter((item) => typeof item === 'number')].sort((first, second) => (first as number) - (second as number)))
  })

  describe.each([0, 1, 2, 3])('with %i siblings', (siblings) => {
    describe.each([1, 2, 3])('and %i boundary pages', (boundary) => {
      for (let count = 1; count <= 30; count += 1) {
        it(`keeps a sorted, complete, constant size list for ${count} pages`, () => {
          const limit = 2 * boundary + 2 * siblings + 3

          for (let page = 1; page <= count; page += 1) {
            const items = paginationItems(page, count, siblings, boundary)
            const numbers = items.filter((item): item is number => typeof item === 'number')

            expect(numbers, `page ${page}`).toEqual([...new Set(numbers)].sort((first, second) => first - second))
            expect(numbers, `page ${page}`).toContain(page)
            expect(numbers[0], `page ${page}`).toBe(1)
            expect(numbers.at(-1), `page ${page}`).toBe(count)
            expect(items.length, `page ${page}`).toBe(Math.min(count, limit))
            expect(items.filter((item) => typeof item !== 'number').length, `page ${page}`).toBeLessThanOrEqual(2)

            items.forEach((item, index) => {
              if (typeof item === 'number') return

              const before = items[index - 1] as number
              const after = items[index + 1] as number

              expect(after - before, `page ${page}`).toBeGreaterThanOrEqual(3)
            })
          }
        })
      }
    })
  })
})
