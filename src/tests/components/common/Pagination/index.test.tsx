import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from '@tests/axe.ts'

import { Pagination } from '@components/common/Pagination/index.tsx'
import { en } from '@locales/en.ts'

const pageButtons = () => screen.getAllByRole('button').filter((button) => /^\d+$/.test(button.textContent ?? ''))

const current = () => screen.getByRole('button', { current: 'page' })

describe('Pagination', () => {
  it('is a navigation landmark with a list of buttons, named in the language of the provider', () => {
    renderWithProviders(<Pagination pageCount={5} />)

    expect(screen.getByRole('navigation', { name: 'Paginação' })).toBeInTheDocument()
    expect(within(screen.getByRole('list')).getAllByRole('listitem')).toHaveLength(7)
  })

  it('takes its name from the locale, from labels and from ariaLabel', () => {
    const { unmount } = renderWithProviders(<Pagination pageCount={5} />, { locale: en })

    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next page' })).toBeInTheDocument()
    unmount()

    const custom = renderWithProviders(<Pagination pageCount={5} />, { labels: { pagination: 'Resultados', previousPage: 'Voltar', nextPage: 'Avançar' } })

    expect(screen.getByRole('navigation', { name: 'Resultados' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Voltar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Avançar' })).toBeInTheDocument()
    custom.unmount()

    renderWithProviders(<Pagination pageCount={5} ariaLabel="Pedidos" />)

    expect(screen.getByRole('navigation', { name: 'Pedidos' })).toBeInTheDocument()
  })

  it('lists a button per page, plus previous and next, and starts on the first page', () => {
    renderWithProviders(<Pagination pageCount={5} />)

    expect(pageButtons().map((button) => button.textContent)).toEqual(['1', '2', '3', '4', '5'])
    expect(screen.getAllByRole('button')).toHaveLength(7)
    expect(current()).toHaveTextContent('1')
  })

  it('starts on the defaultPage', () => {
    renderWithProviders(<Pagination pageCount={5} defaultPage={3} />)

    expect(current()).toHaveTextContent('3')
  })

  it('goes to a page by clicking it and reports it once', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    renderWithProviders(<Pagination pageCount={5} onPageChange={onPageChange} />)

    await user.click(screen.getByRole('button', { name: '4' }))
    await user.click(screen.getByRole('button', { name: '4' }))

    expect(current()).toHaveTextContent('4')
    expect(onPageChange.mock.calls).toEqual([[4]])
  })

  it('moves one page with next and previous', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    renderWithProviders(<Pagination pageCount={5} defaultPage={3} onPageChange={onPageChange} />)

    await user.click(screen.getByRole('button', { name: 'Próxima página' }))
    expect(current()).toHaveTextContent('4')

    await user.click(screen.getByRole('button', { name: 'Página anterior' }))
    await user.click(screen.getByRole('button', { name: 'Página anterior' }))

    expect(current()).toHaveTextContent('2')
    expect(onPageChange.mock.calls).toEqual([[4], [3], [2]])
  })

  it('marks previous unavailable on the first page and next on the last, without taking the focus away', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    renderWithProviders(<Pagination pageCount={3} defaultPage={2} onPageChange={onPageChange} />)

    await user.click(screen.getByRole('button', { name: 'Próxima página' }))

    const next = screen.getByRole('button', { name: 'Próxima página' })

    expect(next).toHaveAttribute('aria-disabled', 'true')
    expect(next).toHaveFocus()

    await user.click(next)
    expect(current()).toHaveTextContent('3')

    await user.click(screen.getByRole('button', { name: '1' }))
    await user.click(screen.getByRole('button', { name: 'Página anterior' }))

    expect(screen.getByRole('button', { name: 'Página anterior' })).toHaveAttribute('aria-disabled', 'true')
    expect(current()).toHaveTextContent('1')
    expect(onPageChange.mock.calls).toEqual([[3], [1]])
  })

  it('leaves previous and next available in the middle', () => {
    renderWithProviders(<Pagination pageCount={5} defaultPage={3} />)

    expect(screen.getByRole('button', { name: 'Página anterior' })).not.toHaveAttribute('aria-disabled')
    expect(screen.getByRole('button', { name: 'Próxima página' })).not.toHaveAttribute('aria-disabled')
  })

  it('follows the page prop when controlled and reports each change', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    const Controlled = () => {
      const [page, setPage] = useState(2)

      return (
        <Pagination
          pageCount={5}
          page={page}
          onPageChange={(next) => {
            onPageChange(next)
            setPage(next)
          }}
        />
      )
    }
    renderWithProviders(<Controlled />)

    expect(current()).toHaveTextContent('2')
    await user.click(screen.getByRole('button', { name: '5' }))

    expect(current()).toHaveTextContent('5')
    expect(onPageChange.mock.calls).toEqual([[5]])
  })

  it('stays put when controlled and the owner refuses the change', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Pagination pageCount={5} page={2} onPageChange={() => undefined} />)

    await user.click(screen.getByRole('button', { name: '4' }))

    expect(current()).toHaveTextContent('2')
  })

  it('keeps the current page inside the range', () => {
    const { unmount } = renderWithProviders(<Pagination pageCount={5} page={99} onPageChange={() => undefined} />)

    expect(current()).toHaveTextContent('5')
    unmount()

    renderWithProviders(<Pagination pageCount={5} page={0} onPageChange={() => undefined} />)

    expect(current()).toHaveTextContent('1')
  })

  it('renders nothing without pages', () => {
    const { container } = renderWithProviders(<Pagination pageCount={0} />)

    expect(container.querySelector('nav')).toBeNull()
  })

  it('renders a single page without room to go anywhere', () => {
    renderWithProviders(<Pagination pageCount={1} />)

    expect(pageButtons().map((button) => button.textContent)).toEqual(['1'])
    expect(screen.getByRole('button', { name: 'Página anterior' })).toHaveAttribute('aria-disabled', 'true')
    expect(screen.getByRole('button', { name: 'Próxima página' })).toHaveAttribute('aria-disabled', 'true')
  })

  it('hides a long list behind ellipses that are not buttons and not announced', () => {
    const { container } = renderWithProviders(<Pagination pageCount={20} defaultPage={10} />)
    const ellipses = [...container.querySelectorAll('[data-slot="pagination-ellipsis"]')]

    expect(pageButtons().map((button) => button.textContent)).toEqual(['1', '9', '10', '11', '20'])
    expect(ellipses).toHaveLength(2)
    expect(ellipses.map((ellipsis) => ellipsis.textContent)).toEqual(['…', '…'])
    for (const ellipsis of ellipses) expect(ellipsis.closest('li')).toHaveAttribute('aria-hidden', 'true')
  })

  it('takes the number of siblings and boundary pages', () => {
    renderWithProviders(<Pagination pageCount={30} defaultPage={15} siblingCount={2} boundaryCount={2} />)

    expect(pageButtons().map((button) => button.textContent)).toEqual(['1', '2', '13', '14', '15', '16', '17', '29', '30'])
  })

  it('reaches a hidden page through the pages around it', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Pagination pageCount={20} />)

    expect(screen.queryByRole('button', { name: '6' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '4' }))
    await user.click(screen.getByRole('button', { name: '5' }))

    expect(screen.getByRole('button', { name: '6' })).toBeInTheDocument()
  })

  it('is reachable by keyboard and selects with Enter and Space', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Pagination pageCount={5} />)

    await user.tab()
    expect(screen.getByRole('button', { name: 'Página anterior' })).toHaveFocus()

    await user.tab()
    await user.tab()
    expect(screen.getByRole('button', { name: '2' })).toHaveFocus()

    await user.keyboard('{Enter}')
    expect(current()).toHaveTextContent('2')

    await user.tab()
    await user.keyboard(' ')
    expect(current()).toHaveTextContent('3')
  })

  it('is medium by default and takes the small size', () => {
    const { container, unmount } = renderWithProviders(<Pagination pageCount={5} />)

    expect(container.querySelector('[data-slot="pagination"]')).toHaveAttribute('data-size', 'md')
    unmount()

    const small = renderWithProviders(<Pagination pageCount={5} size="sm" />)

    expect(small.container.querySelector('[data-slot="pagination"]')).toHaveAttribute('data-size', 'sm')
  })

  it('forwards the ref to the nav', () => {
    const ref = createRef<HTMLElement>()
    renderWithProviders(<Pagination pageCount={5} ref={ref} />)

    expect(ref.current).toBe(screen.getByRole('navigation'))
  })

  it('does not pass its own props to the page', () => {
    renderWithProviders(<Pagination pageCount={20} page={3} defaultPage={2} onPageChange={() => undefined} siblingCount={2} boundaryCount={2} ariaLabel="Pedidos" animation={false} />)
    const nav = screen.getByRole('navigation')

    for (const name of ['pagecount', 'page', 'defaultpage', 'onpagechange', 'siblingcount', 'boundarycount', 'arialabel', 'animation']) {
      expect(nav, name).not.toHaveAttribute(name)
    }
  })

  it('has no axe violations in any state', async () => {
    const { container } = renderWithProviders(
      <>
        <Pagination pageCount={5} ariaLabel="Primeira" />
        <Pagination pageCount={20} defaultPage={10} ariaLabel="Segunda" />
        <Pagination pageCount={20} defaultPage={20} size="sm" ariaLabel="Terceira" />
        <Pagination pageCount={1} ariaLabel="Quarta" />
      </>
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Pagination contract', () => {
  it('marks the root and every part with a data-slot', () => {
    const { container } = renderWithProviders(<Pagination pageCount={20} defaultPage={10} />)

    for (const part of ['pagination', 'pagination-list', 'pagination-previous', 'pagination-page', 'pagination-ellipsis', 'pagination-next']) {
      expect(container.querySelector(`[data-slot="${part}"]`), part).toBeInTheDocument()
    }
  })

  it('keeps className and style on the root with the caller last', () => {
    renderWithProviders(<Pagination pageCount={5} className="mine" style={{ margin: '3px' }} />)
    const nav = screen.getByRole('navigation')

    expect(nav.className.split(' ').at(-1)).toBe('mine')
    expect(nav.style.margin).toBe('3px')
  })

  it('passes other attributes and handlers to the root', async () => {
    const user = userEvent.setup()
    const onFocus = vi.fn()
    renderWithProviders(<Pagination pageCount={5} data-testid="pager" id="pager" onFocus={onFocus} />)

    await user.tab()

    expect(screen.getByTestId('pager')).toHaveAttribute('id', 'pager')
    expect(onFocus).toHaveBeenCalled()
  })

  it('lets the caller name the navigation with aria-label', () => {
    renderWithProviders(<Pagination pageCount={5} aria-label="Minha paginação" />)

    expect(screen.getByRole('navigation', { name: 'Minha paginação' })).toBeInTheDocument()
  })

  it('sets the motion variables on the root and zeroes them for animation={false}', () => {
    const { container, unmount } = renderWithProviders(<Pagination pageCount={5} />)
    const root = () => container.querySelector('[data-slot="pagination"]') as HTMLElement

    expect(root().style.getPropertyValue('--enchase-pagination-duration')).toBe('150ms')
    unmount()

    const off = renderWithProviders(<Pagination pageCount={5} animation={false} />)

    expect((off.container.querySelector('[data-slot="pagination"]') as HTMLElement).style.getPropertyValue('--enchase-pagination-duration')).toBe('0ms')
  })

  it('takes a custom duration through the animation tuning', () => {
    const { container } = renderWithProviders(<Pagination pageCount={5} animation={{ tuning: { duration: 0.4 } }} />)

    expect((container.querySelector('[data-slot="pagination"]') as HTMLElement).style.getPropertyValue('--enchase-pagination-duration')).toBe('400ms')
  })
})
