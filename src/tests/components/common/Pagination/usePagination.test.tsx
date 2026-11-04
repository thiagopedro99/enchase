import { act, render, renderHook, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { useState } from 'react'
import { axe } from '@tests/axe.ts'

import { usePagination } from '@components/common/Pagination/usePagination.ts'

import type { UsePaginationOptions } from '@components/common/Pagination/types.ts'

interface ShellProps extends UsePaginationOptions {
  previousProps?: Record<string, unknown>
  nextProps?: Record<string, unknown>
  pageProps?: (page: number) => Record<string, unknown>
}

const Shell = ({ previousProps, nextProps, pageProps, ...options }: ShellProps) => {
  const pagination = usePagination(options)

  return (
    <nav aria-label="Pages">
      <button {...pagination.getPreviousProps({ 'aria-label': 'Previous', ...previousProps })} />

      {pagination.items.map((item) =>
        typeof item === 'number' ? (
          <button key={item} {...pagination.getPageProps(item, pageProps?.(item))}>
            {item}
          </button>
        ) : (
          <span key={item}>…</span>
        )
      )}

      <button {...pagination.getNextProps({ 'aria-label': 'Next', ...nextProps })} />
    </nav>
  )
}

const Controlled = ({ onPageChange }: { onPageChange: (page: number) => void }) => {
  const [page, setPage] = useState(2)

  return (
    <>
      <button type="button" onClick={() => setPage(4)}>
        jump
      </button>

      <Shell pageCount={5} page={page} onPageChange={onPageChange} />
    </>
  )
}

const current = () => screen.getByRole('button', { current: 'page' })

const previous = () => screen.getByRole('button', { name: 'Previous' })

const next = () => screen.getByRole('button', { name: 'Next' })

describe('usePagination', () => {
  it('lists the pages around the current one with the ellipsis, and tells where the page is', () => {
    const { result } = renderHook(() => usePagination({ pageCount: 12, defaultPage: 6 }))

    expect(result.current.items).toEqual([1, 'start-ellipsis', 5, 6, 7, 'end-ellipsis', 12])
    expect(result.current).toMatchObject({ page: 6, pageCount: 12, hasPrevious: true, hasNext: true })
  })

  it('widens the window with siblingCount and boundaryCount', () => {
    const { result } = renderHook(() => usePagination({ pageCount: 20, defaultPage: 10, siblingCount: 2, boundaryCount: 2 }))

    expect(result.current.items).toEqual([1, 2, 'start-ellipsis', 8, 9, 10, 11, 12, 'end-ellipsis', 19, 20])
  })

  it('starts on the first page, or on the default page, and keeps the page inside the range', () => {
    expect(renderHook(() => usePagination({ pageCount: 5 })).result.current.page).toBe(1)
    expect(renderHook(() => usePagination({ pageCount: 5, defaultPage: 3 })).result.current.page).toBe(3)
    expect(renderHook(() => usePagination({ pageCount: 5, defaultPage: 99 })).result.current.page).toBe(5)
    expect(renderHook(() => usePagination({ pageCount: 5, defaultPage: -4 })).result.current.page).toBe(1)
    expect(renderHook(() => usePagination({ pageCount: 5, page: Number.NaN })).result.current.page).toBe(1)
  })

  it('reads the counts as whole numbers that are not negative', () => {
    expect(renderHook(() => usePagination({ pageCount: 5.9 })).result.current.pageCount).toBe(5)
    expect(renderHook(() => usePagination({ pageCount: -3 })).result.current.pageCount).toBe(0)
    expect(renderHook(() => usePagination({ pageCount: Number.NaN })).result.current).toMatchObject({ pageCount: 0, items: [], hasPrevious: false, hasNext: false })
  })

  it('marks the current page, and only it', () => {
    render(<Shell pageCount={5} defaultPage={3} />)

    expect(current()).toHaveTextContent('3')
    expect(screen.getAllByRole('button', { current: 'page' })).toHaveLength(1)
  })

  it('goes to the previous and the next page, reports each change once and stops at the ends', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()

    render(<Shell pageCount={3} onPageChange={onPageChange} />)

    expect(previous()).toHaveAttribute('aria-disabled', 'true')
    expect(next()).not.toHaveAttribute('aria-disabled')

    await user.click(previous())

    expect(onPageChange).not.toHaveBeenCalled()

    await user.click(next())

    expect(current()).toHaveTextContent('2')
    expect(onPageChange).toHaveBeenLastCalledWith(2)

    await user.click(next())

    expect(current()).toHaveTextContent('3')
    expect(next()).toHaveAttribute('aria-disabled', 'true')

    await user.click(next())

    expect(onPageChange).toHaveBeenCalledTimes(2)

    await user.click(previous())

    expect(current()).toHaveTextContent('2')
  })

  it('goes to a page by clicking it, and says nothing when it is the current one', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()

    render(<Shell pageCount={5} onPageChange={onPageChange} />)
    await user.click(screen.getByRole('button', { name: '4' }))
    await user.click(screen.getByRole('button', { name: '4' }))

    expect(current()).toHaveTextContent('4')
    expect(onPageChange).toHaveBeenCalledTimes(1)
    expect(onPageChange).toHaveBeenCalledWith(4)
  })

  it('goes to a page from outside with goTo, and keeps it inside the range', () => {
    const onPageChange = vi.fn()
    const { result } = renderHook(() => usePagination({ pageCount: 5, onPageChange }))

    act(() => result.current.goTo(4))

    expect(result.current.page).toBe(4)
    expect(onPageChange).toHaveBeenLastCalledWith(4)

    act(() => result.current.goTo(99))

    expect(result.current.page).toBe(5)

    act(() => result.current.goTo(-2))

    expect(result.current.page).toBe(1)
  })

  it('reports the choice and waits for the parent when it is controlled, then follows the parent', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()

    render(<Controlled onPageChange={onPageChange} />)
    await user.click(next())

    expect(onPageChange).toHaveBeenCalledWith(3)
    expect(current()).toHaveTextContent('2')

    await user.click(screen.getByRole('button', { name: 'jump' }))

    expect(current()).toHaveTextContent('4')
  })

  it('passes the props of the consumer through, and chains its handlers before its own', async () => {
    const user = userEvent.setup()
    const clicked = vi.fn()

    render(<Shell pageCount={3} nextProps={{ id: 'mine', className: 'next', onClick: clicked }} pageProps={() => ({ className: 'page' })} />)

    expect(next()).toHaveAttribute('id', 'mine')
    expect(next()).toHaveClass('next')
    expect(current()).toHaveClass('page')

    await user.click(next())

    expect(clicked).toHaveBeenCalledTimes(1)
    expect(current()).toHaveTextContent('2')
  })

  it('still runs its own handler when the handler of the consumer prevents the default', async () => {
    const user = userEvent.setup()

    render(<Shell pageCount={3} nextProps={{ onClick: (event: { preventDefault: () => void }) => event.preventDefault() }} />)
    await user.click(next())

    expect(current()).toHaveTextContent('2')
  })

  it('has no accessibility violations in a shell of its own', async () => {
    const { container } = render(<Shell pageCount={12} defaultPage={6} />)

    expect(await axe(container)).toHaveNoViolations()
  })
})
