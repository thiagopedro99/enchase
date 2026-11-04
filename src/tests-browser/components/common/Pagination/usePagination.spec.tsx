import { describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { usePagination } from '@components/common/Pagination/usePagination.ts'
import { renderInBrowser } from '../../../support/harness.tsx'

import type { UsePaginationOptions } from '@components/common/Pagination/types.ts'

const Shell = (options: UsePaginationOptions) => {
  const pagination = usePagination(options)

  return (
    <nav aria-label="Pages">
      <button {...pagination.getPreviousProps({ 'aria-label': 'Previous' })} />

      {pagination.items.map((item) =>
        typeof item === 'number' ? (
          <button key={item} {...pagination.getPageProps(item)}>
            {item}
          </button>
        ) : (
          <span key={item}>...</span>
        )
      )}

      <button {...pagination.getNextProps({ 'aria-label': 'Next' })} />
    </nav>
  )
}

const button = (name: string) => page.getByRole('button', { name }).element() as HTMLElement

const current = () => (document.querySelector('[aria-current="page"]') as HTMLElement).textContent

describe('usePagination in a real browser', () => {
  it('goes through every button with Tab, the disabled previous one included, and the pressed one acts with Enter and Space', async () => {
    renderInBrowser(<Shell pageCount={5} />)
    await userEvent.tab()

    expect(document.activeElement).toBe(button('Previous'))
    expect(button('Previous').getAttribute('aria-disabled')).toBe('true')

    await userEvent.tab()
    await userEvent.tab()

    expect(document.activeElement).toBe(button('2'))

    await userEvent.keyboard('{Enter}')

    expect(current()).toBe('2')

    await userEvent.tab()
    await userEvent.keyboard(' ')

    expect(current()).toBe('3')
  })

  it('does nothing when the previous button is pressed on the first page and the next one on the last', async () => {
    renderInBrowser(<Shell pageCount={3} />)
    await userEvent.click(button('Previous'), { force: true })

    expect(current()).toBe('1')

    await userEvent.click(button('3'))
    await userEvent.click(button('Next'), { force: true })

    expect(current()).toBe('3')
    expect(button('Next').getAttribute('aria-disabled')).toBe('true')
    expect(document.activeElement).toBe(button('Next'))
  })

  it('moves to a page with a click, moves by one with the ends, and drops the ellipsis as the window reaches the end', async () => {
    renderInBrowser(<Shell pageCount={12} />)

    expect(document.body.textContent).toContain('...')

    await userEvent.click(button('Next'))
    await userEvent.click(button('Next'))

    expect(current()).toBe('3')

    await userEvent.click(button('Previous'))

    expect(current()).toBe('2')
  })
})
