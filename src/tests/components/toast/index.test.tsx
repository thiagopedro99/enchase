import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import { StrictMode, useLayoutEffect, useState } from 'react'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from '@tests/axe.ts'

import UIProvider from '@components/uiProvider/index.tsx'
import { ToastProvider, useToast } from '@components/toast/index.ts'
import { ptBR } from '@locales/ptBR.ts'

const Probe = ({ duration }: { duration?: number }) => {
  const toast = useToast()

  return (
    <>
      <button onClick={() => toast.success('Saved', duration)}>success</button>
      <button onClick={() => toast.error('Failed', duration)}>error</button>
    </>
  )
}

const FiresWhileMounting = () => {
  const toast = useToast()

  useLayoutEffect(() => {
    toast.info('Hello', 0)
  }, [toast])

  return null
}

const toastCount = () => screen.queryAllByRole('button', { name: 'Fechar notificação' }).length

const expectCount = (expected: number) => waitFor(() => expect(toastCount()).toBe(expected))

const issued: string[] = []

const Remote = () => {
  const toast = useToast()
  const [id, setId] = useState('')

  return (
    <>
      <button
        onClick={() => {
          const given = toast.info('Saving', 0)
          issued.push(given)
          setId(given)
        }}
      >
        open
      </button>
      <button onClick={() => toast.removeToast(id)}>remove</button>
    </>
  )
}

const Every = () => {
  const toast = useToast()

  return (
    <button
      onClick={() => {
        issued.push(toast.addToast('a', 'info', 0), toast.success('b', 0), toast.error('c', 0), toast.warning('d', 0), toast.info('e', 0))
      }}
    >
      all
    </button>
  )
}

const renders = { current: 0 }

const Dispatcher = () => {
  const toast = useToast()

  renders.current += 1

  return <button onClick={() => toast.success('Saved', 0)}>fire</button>
}

describe('useToast consumers', () => {
  it('do not render again when toasts appear or disappear', async () => {
    const user = userEvent.setup()
    renders.current = 0
    renderWithProviders(<Dispatcher />)
    const initialRenders = renders.current

    await user.click(screen.getByRole('button', { name: 'fire' }))
    await user.click(screen.getByRole('button', { name: 'fire' }))
    await user.click(screen.getAllByRole('button', { name: 'Fechar notificação' })[0])

    expect(renders.current).toBe(initialRenders)
  })
})

describe('Toast', () => {
  it('renders its live region in the body, outside the tree of the app', () => {
    const { container } = renderWithProviders(<Probe />)
    const region = screen.getByRole('region', { name: 'Notificações' })

    expect(container.contains(region)).toBe(false)
    expect(region.closest('body')).toBe(document.body)
    expect(document.body.contains(region)).toBe(true)
  })

  it('unmounts without error when something emptied the body in the meantime', () => {
    const { unmount } = renderWithProviders(<Probe />)

    document.body.innerHTML = ''

    expect(() => unmount()).not.toThrow()
  })

  it('keeps one host in the body under StrictMode, and none once it unmounts', () => {
    const { unmount } = render(
      <StrictMode>
        <UIProvider locale={ptBR}>
          <ToastProvider>
            <Probe />
          </ToastProvider>
        </UIProvider>
      </StrictMode>
    )

    expect(document.querySelectorAll('[data-slot="toast-host"]')).toHaveLength(1)
    expect(document.querySelectorAll('[data-slot="toast-viewport"]')).toHaveLength(1)

    unmount()

    expect(document.querySelectorAll('[data-slot="toast-host"]')).toHaveLength(0)
  })

  it('does not pile up hosts when the provider is mounted again with another key', () => {
    const tree = (key: string) => (
      <UIProvider locale={ptBR}>
        <ToastProvider key={key}>
          <Probe />
        </ToastProvider>
      </UIProvider>
    )
    const { rerender, unmount } = render(tree('first'))

    rerender(tree('second'))
    rerender(tree('third'))

    expect(document.querySelectorAll('[data-slot="toast-host"]')).toHaveLength(1)
    expect(document.querySelectorAll('[data-slot="toast-viewport"]')).toHaveLength(1)

    unmount()

    expect(document.querySelectorAll('[data-slot="toast-host"]')).toHaveLength(0)
  })

  it('shows a toast that a child fires while it mounts, before the host is attached to the body', () => {
    renderWithProviders(<FiresWhileMounting />)

    expect(within(screen.getByRole('region', { name: 'Notificações' })).getByText('Hello')).toBeInTheDocument()
  })

  it('leaves nothing of its own in the body once it unmounts', () => {
    const { unmount } = renderWithProviders(<Probe />)

    unmount()

    expect(screen.queryByRole('region', { name: 'Notificações' })).toBeNull()
    expect(document.body.querySelector('[data-slot="toast-host"]')).toBeNull()
    expect(document.body.querySelector('[data-slot="toast-viewport"]')).toBeNull()
  })

  it('gives back the id of the toast, which removeToast takes to close it', async () => {
    const user = userEvent.setup()
    issued.length = 0
    renderWithProviders(<Remote />)

    await user.click(screen.getByRole('button', { name: 'open' }))
    await expectCount(1)

    expect(typeof issued[0]).toBe('string')
    expect(issued[0]).not.toBe('')

    await user.click(screen.getByRole('button', { name: 'remove' }))

    await expectCount(0)
  })

  it('gives a different id for each toast, whichever method opened it', async () => {
    const user = userEvent.setup()
    issued.length = 0
    renderWithProviders(<Every />)

    await user.click(screen.getByRole('button', { name: 'all' }))

    expect(issued).toHaveLength(5)
    expect(new Set(issued).size).toBe(5)
    expect(issued.every((id) => typeof id === 'string' && id !== '')).toBe(true)
  })

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
    await expectCount(2)

    await user.click(screen.getAllByRole('button', { name: 'Fechar notificação' })[0])

    await expectCount(1)
  })

  it('dismisses the focused toast with Escape', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Probe duration={0} />)

    await user.click(screen.getByRole('button', { name: 'success' }))
    const close = await screen.findByRole('button', { name: 'Fechar notificação' })
    act(() => close.focus())
    await user.keyboard('{Escape}')

    await expectCount(0)
  })

  it('auto dismisses after the duration', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderWithProviders(<Probe duration={1000} />)

    await user.click(screen.getByRole('button', { name: 'success' }))
    await expectCount(1)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1100)
    })

    await expectCount(0)
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
    expect(toastCount()).toBe(1)

    await user.unhover(toastItem)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1500)
    })
    await expectCount(0)
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
    expect(toastCount()).toBe(1)

    act(() => close.blur())
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1500)
    })
    await expectCount(0)
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

    expect(toastCount()).toBe(1)
    vi.useRealTimers()
  })

  it('marks the viewport, the toast and its parts with slots and states', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Probe duration={0} />)

    await user.click(screen.getByRole('button', { name: 'success' }))
    const item = (await screen.findByText('Saved')).closest('[data-slot="toast"]') as HTMLElement

    expect(screen.getByRole('region', { name: 'Notificações' })).toHaveAttribute('data-slot', 'toast-viewport')
    expect(item).toHaveAttribute('data-type', 'success')
    expect(['entering', 'open']).toContain(item.getAttribute('data-state'))
    expect(item.querySelector('[data-slot="toast-title"]')).toHaveTextContent('Saved')
    expect(item.querySelector('[data-slot="toast-close"]')).toBeInTheDocument()
  })

  it('has a progress bar slot only when the toast expires', async () => {
    const user = userEvent.setup()
    const { unmount } = renderWithProviders(<Probe duration={5000} />)

    await user.click(screen.getByRole('button', { name: 'success' }))
    await screen.findByText('Saved')
    expect(document.querySelector('[data-slot="toast-progress"]')).toBeInTheDocument()

    unmount()
    renderWithProviders(<Probe duration={0} />)
    await user.click(screen.getByRole('button', { name: 'success' }))
    await screen.findByText('Saved')
    expect(document.querySelector('[data-slot="toast-progress"]')).not.toBeInTheDocument()
  })

  it('keeps the caller className and style on the viewport and on each toast', async () => {
    const user = userEvent.setup()
    const Custom = () => {
      const toast = useToast()

      return <button onClick={() => toast.info('Custom', 0, { className: 'mine', style: { color: 'rgb(255, 0, 0)' } })}>open</button>
    }
    render(
      <UIProvider locale={ptBR}>
        <ToastProvider className="viewport" style={{ opacity: 0.9 }}>
          <Custom />
        </ToastProvider>
      </UIProvider>
    )

    await user.click(screen.getByRole('button', { name: 'open' }))
    const item = (await screen.findByText('Custom')).closest('[data-slot="toast"]') as HTMLElement
    const region = screen.getByRole('region', { name: 'Notificações' })

    expect(item.className.split(' ').at(-1)).toBe('mine')
    expect(item).toHaveStyle({ color: 'rgb(255, 0, 0)' })
    expect(region.className.split(' ').at(-1)).toBe('viewport')
    expect(region).toHaveStyle({ opacity: '0.9' })
  })

  it('keeps a dismissed toast mounted and inert while it leaves', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Probe duration={0} />)

    await user.click(screen.getByRole('button', { name: 'success' }))
    await user.click(await screen.findByRole('button', { name: 'Fechar notificação' }))
    const item = screen.getByText('Saved').closest('[data-slot="toast"]') as HTMLElement

    expect(item).toHaveAttribute('data-state', 'exiting')
    expect(item).toHaveAttribute('inert')
    await expectCount(0)
  })

  it('removes the toast at once when animation is off', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Probe duration={0} />, { motion: { mode: 'never' } })

    await user.click(screen.getByRole('button', { name: 'success' }))
    await user.click(await screen.findByRole('button', { name: 'Fechar notificação' }))

    await expectCount(0)
  })

  it('marks a hovered toast as paused for the progress bar', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Probe duration={5000} />)

    await user.click(screen.getByRole('button', { name: 'success' }))
    const item = (await screen.findByText('Saved')).closest('[data-slot="toast"]') as HTMLElement
    await user.hover(item)

    expect(item).toHaveAttribute('data-paused')

    await user.unhover(item)

    expect(item).not.toHaveAttribute('data-paused')
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
