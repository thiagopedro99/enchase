import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from '@tests/axe.ts'

import { useToast } from '@components/toast/index.ts'

const Probe = ({ duration }: { duration?: number }) => {
  const toast = useToast()

  return (
    <>
      <button onClick={() => toast.success('Saved', duration)}>success</button>
      <button onClick={() => toast.error('Failed', duration)}>error</button>
      <output data-testid="count">{toast.toasts.length}</output>
    </>
  )
}

const count = () => screen.getByTestId('count').textContent

describe('Toast', () => {
  it('renders into a persistent labelled live region', () => {
    renderWithProviders(<Probe />)

    const region = screen.getByRole('region', { name: 'Notificações' })
    expect(region).toHaveAttribute('aria-live', 'polite')
  })

  it('announces a toast inside the live region', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Probe />)

    await user.click(screen.getByRole('button', { name: 'success' }))

    const region = screen.getByRole('region', { name: 'Notificações' })
    expect(await screen.findByText('Saved')).toBeInTheDocument()
    expect(region).toContainElement(screen.getByText('Saved'))
  })

  it('uses role alert for errors only', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Probe />)

    await user.click(screen.getByRole('button', { name: 'success' }))
    await user.click(screen.getByRole('button', { name: 'error' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Failed')
    expect(screen.getAllByRole('alert')).toHaveLength(1)
  })

  it('labels the close button with a configurable label', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Probe />, { labels: { closeToast: 'Dismiss' } })

    await user.click(screen.getByRole('button', { name: 'success' }))

    expect(await screen.findByRole('button', { name: 'Dismiss' })).toBeInTheDocument()
  })

  it('dismisses with the close button, keeping other toasts', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Probe duration={0} />)

    await user.click(screen.getByRole('button', { name: 'success' }))
    await user.click(screen.getByRole('button', { name: 'error' }))
    expect(count()).toBe('2')

    await user.click(screen.getAllByRole('button', { name: 'Fechar notificação' })[0])

    expect(count()).toBe('1')
  })

  it('dismisses the focused toast with Escape', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Probe duration={0} />)

    await user.click(screen.getByRole('button', { name: 'success' }))
    const close = await screen.findByRole('button', { name: 'Fechar notificação' })
    act(() => close.focus())
    await user.keyboard('{Escape}')

    expect(count()).toBe('0')
  })

  it('auto dismisses after the duration', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderWithProviders(<Probe duration={1000} />)

    await user.click(screen.getByRole('button', { name: 'success' }))
    expect(count()).toBe('1')

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1100)
    })

    expect(count()).toBe('0')
    vi.useRealTimers()
  })

  it('pauses the timer while hovered', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderWithProviders(<Probe duration={1000} />)

    await user.click(screen.getByRole('button', { name: 'success' }))
    const toastItem = (await screen.findByText('Saved')).closest('div[class]') as HTMLElement
    await user.hover(toastItem)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000)
    })
    expect(count()).toBe('1')

    await user.unhover(toastItem)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1500)
    })
    expect(count()).toBe('0')
    vi.useRealTimers()
  })

  it('pauses the timer while focus is inside the toast', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderWithProviders(<Probe duration={1000} />)

    await user.click(screen.getByRole('button', { name: 'success' }))
    const close = await screen.findByRole('button', { name: 'Fechar notificação' })
    act(() => close.focus())

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000)
    })
    expect(count()).toBe('1')

    act(() => close.blur())
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1500)
    })
    expect(count()).toBe('0')
    vi.useRealTimers()
  })

  it('keeps a sticky toast (duration 0) without a progress bar', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderWithProviders(<Probe duration={0} />)

    await user.click(screen.getByRole('button', { name: 'success' }))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000)
    })

    expect(count()).toBe('1')
    vi.useRealTimers()
  })

  it('has no axe violations', async () => {
    const user = userEvent.setup()
    const { container } = renderWithProviders(<Probe duration={0} />)

    await user.click(screen.getByRole('button', { name: 'success' }))
    await user.click(screen.getByRole('button', { name: 'error' }))
    await screen.findByText('Saved')

    expect(await axe(container)).toHaveNoViolations()
  })
})
