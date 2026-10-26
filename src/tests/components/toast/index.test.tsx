import { describePortalContainerContract } from '@tests/shared/contracts/portalContainerContract.tsx'
import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import { StrictMode, useLayoutEffect, useState } from 'react'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from '@tests/axe.ts'

import UIProvider from '@components/uiProvider/index.tsx'
import { ToastProvider, useToast } from '@components/toast/index.ts'
import { ptBR } from '@locales/ptBR.ts'

import type { RenderWithProvidersOptions } from '@tests/types.ts'
import type { ToastOptions, ToastPromiseMessages, ToastProviderProps } from '@components/toast/types.ts'
import type { ReactElement } from 'react'

const renderWithToasts = (ui: ReactElement, options: RenderWithProvidersOptions = {}) => renderWithProviders(ui, { ...options, toasts: true })

describePortalContainerContract({
  name: 'ToastProvider',
  slot: 'toast-host',
  plain: true,
  render: (container) => (
    <ToastProvider container={container}>
      <p>app</p>
    </ToastProvider>
  )
})

const Probe = ({ duration }: { duration?: number }) => {
  const toast = useToast()

  return (
    <>
      <button onClick={() => toast.success('Saved', duration)}>success</button>
      <button onClick={() => toast.error('Failed', duration)}>error</button>
    </>
  )
}

const Typed = () => {
  const toast = useToast()

  return (
    <>
      <button onClick={() => toast.success('Saved', 0)}>success</button>
      <button onClick={() => toast.info('Heads up', 0)}>info</button>
      <button onClick={() => toast.warning('Careful', 0)}>warning</button>
      <button onClick={() => toast.error('Failed', 0)}>error</button>
    </>
  )
}

const NodeProbe = () => {
  const toast = useToast()

  return (
    <button
      onClick={() =>
        toast.success(
          <>
            <strong>Saved</strong> to <em>Drive</em>
          </>,
          0
        )
      }
    >
      node
    </button>
  )
}

const host = () => document.querySelector('[data-slot="toast-host"]') as HTMLElement

const announcer = (role: 'status' | 'alert') => within(host()).getByRole(role)

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
    renderWithToasts(<Dispatcher />)
    const initialRenders = renders.current

    await user.click(screen.getByRole('button', { name: 'fire' }))
    await user.click(screen.getByRole('button', { name: 'fire' }))
    await user.click(screen.getAllByRole('button', { name: 'Fechar notificação' })[0])

    expect(renders.current).toBe(initialRenders)
  })
})

describe('Toast', () => {
  it('renders its live region in the body, outside the tree of the app', () => {
    const { container } = renderWithToasts(<Probe />)
    const region = screen.getByRole('region', { name: 'Notificações' })

    expect(container.contains(region)).toBe(false)
    expect(region.closest('body')).toBe(document.body)
    expect(document.body.contains(region)).toBe(true)
  })

  it('unmounts without error when something emptied the body in the meantime', () => {
    const { unmount } = renderWithToasts(<Probe />)

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
    renderWithToasts(<FiresWhileMounting />)

    expect(within(screen.getByRole('region', { name: 'Notificações' })).getByText('Hello')).toBeInTheDocument()
  })

  it('leaves nothing of its own in the body once it unmounts', () => {
    const { unmount } = renderWithToasts(<Probe />)

    unmount()

    expect(screen.queryByRole('region', { name: 'Notificações' })).toBeNull()
    expect(document.body.querySelector('[data-slot="toast-host"]')).toBeNull()
    expect(document.body.querySelector('[data-slot="toast-viewport"]')).toBeNull()
  })

  it('gives back the id of the toast, which removeToast takes to close it', async () => {
    const user = userEvent.setup()
    issued.length = 0
    renderWithToasts(<Remote />)

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
    renderWithToasts(<Every />)

    await user.click(screen.getByRole('button', { name: 'all' }))

    expect(issued).toHaveLength(5)
    expect(new Set(issued).size).toBe(5)
    expect(issued.every((id) => typeof id === 'string' && id !== '')).toBe(true)
  })

  it('renders a persistent named region that is not a live region itself', () => {
    renderWithToasts(<Probe />)

    const region = screen.getByRole('region', { name: 'Notificações' })

    expect(region).not.toHaveAttribute('aria-live')
    expect(region).not.toHaveAttribute('aria-relevant')
  })

  it('shows a toast inside the notification region', async () => {
    const user = userEvent.setup()
    renderWithToasts(<Probe />)

    await user.click(screen.getByRole('button', { name: 'success' }))

    const region = screen.getByRole('region', { name: 'Notificações' })

    expect(await screen.findByText('Saved', { selector: '[data-slot="toast-title"]' })).toBeInTheDocument()
    expect(region).toContainElement(screen.getByText('Saved', { selector: '[data-slot="toast-title"]' }))
  })

  it('has a status announcer and an alert announcer from the start, outside the region and before any toast', () => {
    renderWithToasts(<Probe />)

    expect(announcer('status')).toBeEmptyDOMElement()
    expect(announcer('alert')).toBeEmptyDOMElement()
    expect(announcer('status')).toHaveAttribute('aria-atomic', 'true')
    expect(host()).toContainElement(announcer('status'))
    expect(screen.getByRole('region', { name: 'Notificações' })).not.toContainElement(announcer('alert'))
  })

  it('announces success, info and warning in the status announcer and nothing in the alert one', async () => {
    const user = userEvent.setup()
    renderWithToasts(<Typed />)

    for (const [name, text] of [['success', 'Saved'], ['info', 'Heads up'], ['warning', 'Careful']]) {
      await user.click(screen.getByRole('button', { name }))
      await waitFor(() => expect(announcer('status')).toHaveTextContent(text))
    }

    expect(announcer('alert')).toBeEmptyDOMElement()
  })

  it('announces an error in the alert announcer and not in the status one', async () => {
    const user = userEvent.setup()
    renderWithToasts(<Typed />)

    await user.click(screen.getByRole('button', { name: 'error' }))

    await waitFor(() => expect(announcer('alert')).toHaveTextContent('Failed'))
    expect(announcer('status')).toBeEmptyDOMElement()
  })

  it('gives the visual toasts no role of their own, so nothing is announced twice', async () => {
    const user = userEvent.setup()
    renderWithToasts(<Typed />)

    await user.click(screen.getByRole('button', { name: 'error' }))
    await user.click(screen.getByRole('button', { name: 'success' }))
    await waitFor(() => expect(document.querySelectorAll('[data-slot="toast"]')).toHaveLength(2))

    for (const item of document.querySelectorAll('[data-slot="toast"]')) expect(item).not.toHaveAttribute('role')
    expect(screen.getAllByRole('alert')).toHaveLength(1)
  })

  it('announces the text of a message that is made of nodes', async () => {
    const user = userEvent.setup()
    renderWithToasts(<NodeProbe />)

    await user.click(screen.getByRole('button', { name: 'node' }))

    await waitFor(() => expect(announcer('status')).toHaveTextContent('Saved to Drive'))
    expect(document.querySelector('[data-slot="toast-title"] strong')).toHaveTextContent('Saved')
  })

  it('clears the announcer before it says the same text again', async () => {
    const user = userEvent.setup()
    renderWithToasts(<Probe duration={0} />)
    const seen: string[] = []
    const observer = new MutationObserver(() => seen.push(announcer('status').textContent ?? ''))

    observer.observe(announcer('status'), { childList: true, characterData: true, subtree: true })
    await user.click(screen.getByRole('button', { name: 'success' }))
    await waitFor(() => expect(seen).toEqual(['Saved']))
    await user.click(screen.getByRole('button', { name: 'success' }))
    await waitFor(() => expect(seen).toEqual(['Saved', '', 'Saved']))

    observer.disconnect()
  })

  it('keeps the announcers when the last toast goes away', async () => {
    const user = userEvent.setup()
    renderWithToasts(<Probe duration={0} />)
    const status = announcer('status')

    await user.click(screen.getByRole('button', { name: 'success' }))
    await expectCount(1)
    await user.click(screen.getByRole('button', { name: 'Fechar notificação' }))
    await expectCount(0)

    expect(announcer('status')).toBe(status)
    expect(announcer('alert')).toBeInTheDocument()
  })

  it('labels the close button with a configurable label', async () => {
    const user = userEvent.setup()
    renderWithToasts(<Probe />, { labels: { closeToast: 'Dismiss' } })

    await user.click(screen.getByRole('button', { name: 'success' }))

    expect(await screen.findByRole('button', { name: 'Dismiss' })).toBeInTheDocument()
  })

  it('dismisses with the close button, keeping other toasts', async () => {
    const user = userEvent.setup()
    renderWithToasts(<Probe duration={0} />)

    await user.click(screen.getByRole('button', { name: 'success' }))
    await user.click(screen.getByRole('button', { name: 'error' }))
    await expectCount(2)

    await user.click(screen.getAllByRole('button', { name: 'Fechar notificação' })[0])

    await expectCount(1)
  })

  it('dismisses the focused toast with Escape', async () => {
    const user = userEvent.setup()
    renderWithToasts(<Probe duration={0} />)

    await user.click(screen.getByRole('button', { name: 'success' }))
    const close = await screen.findByRole('button', { name: 'Fechar notificação' })
    act(() => close.focus())
    await user.keyboard('{Escape}')

    await expectCount(0)
  })

  it('auto dismisses after the duration', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderWithToasts(<Probe duration={1000} />)

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
    renderWithToasts(<Probe duration={1000} />)

    await user.click(screen.getByRole('button', { name: 'success' }))
    const toastItem = (await screen.findByText('Saved', { selector: '[data-slot="toast-title"]' })).closest('div[class]') as HTMLElement
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
    renderWithToasts(<Probe duration={1000} />)

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
    renderWithToasts(<Probe duration={0} />)

    await user.click(screen.getByRole('button', { name: 'success' }))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000)
    })

    expect(toastCount()).toBe(1)
    vi.useRealTimers()
  })

  it('marks the viewport, the toast and its parts with slots and states', async () => {
    const user = userEvent.setup()
    renderWithToasts(<Probe duration={0} />)

    await user.click(screen.getByRole('button', { name: 'success' }))
    const item = (await screen.findByText('Saved', { selector: '[data-slot="toast-title"]' })).closest('[data-slot="toast"]') as HTMLElement

    expect(screen.getByRole('region', { name: 'Notificações' })).toHaveAttribute('data-slot', 'toast-viewport')
    expect(item).toHaveAttribute('data-type', 'success')
    expect(['entering', 'open']).toContain(item.getAttribute('data-state'))
    expect(item.querySelector('[data-slot="toast-title"]')).toHaveTextContent('Saved')
    expect(item.querySelector('[data-slot="toast-close"]')).toBeInTheDocument()
  })

  it('has a progress bar slot only when the toast expires', async () => {
    const user = userEvent.setup()
    const { unmount } = renderWithToasts(<Probe duration={5000} />)

    await user.click(screen.getByRole('button', { name: 'success' }))
    await screen.findByText('Saved', { selector: '[data-slot="toast-title"]' })
    expect(document.querySelector('[data-slot="toast-progress"]')).toBeInTheDocument()

    unmount()
    renderWithToasts(<Probe duration={0} />)
    await user.click(screen.getByRole('button', { name: 'success' }))
    await screen.findByText('Saved', { selector: '[data-slot="toast-title"]' })
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
    const item = (await screen.findByText('Custom', { selector: '[data-slot="toast-title"]' })).closest('[data-slot="toast"]') as HTMLElement
    const region = screen.getByRole('region', { name: 'Notificações' })

    expect(item.className.split(' ').at(-1)).toBe('mine')
    expect(item).toHaveStyle({ color: 'rgb(255, 0, 0)' })
    expect(region.className.split(' ').at(-1)).toBe('viewport')
    expect(region).toHaveStyle({ opacity: '0.9' })
  })

  it('keeps a dismissed toast mounted and inert while it leaves', async () => {
    const user = userEvent.setup()
    renderWithToasts(<Probe duration={0} />)

    await user.click(screen.getByRole('button', { name: 'success' }))
    await user.click(await screen.findByRole('button', { name: 'Fechar notificação' }))
    const item = screen.getByText('Saved', { selector: '[data-slot="toast-title"]' }).closest('[data-slot="toast"]') as HTMLElement

    expect(item).toHaveAttribute('data-state', 'exiting')
    expect(item).toHaveAttribute('inert')
    await expectCount(0)
  })

  it('removes the toast at once when animation is off', async () => {
    const user = userEvent.setup()
    renderWithToasts(<Probe duration={0} />, { motion: { mode: 'never' } })

    await user.click(screen.getByRole('button', { name: 'success' }))
    await user.click(await screen.findByRole('button', { name: 'Fechar notificação' }))

    await expectCount(0)
  })

  it('marks a hovered toast as paused for the progress bar', async () => {
    const user = userEvent.setup()
    renderWithToasts(<Probe duration={5000} />)

    await user.click(screen.getByRole('button', { name: 'success' }))
    const item = (await screen.findByText('Saved', { selector: '[data-slot="toast-title"]' })).closest('[data-slot="toast"]') as HTMLElement
    await user.hover(item)

    expect(item).toHaveAttribute('data-paused')

    await user.unhover(item)

    expect(item).not.toHaveAttribute('data-paused')
  })

  it('has no axe violations', async () => {
    const user = userEvent.setup()
    const { container } = renderWithToasts(<Probe duration={0} />)

    await user.click(screen.getByRole('button', { name: 'success' }))
    await user.click(screen.getByRole('button', { name: 'error' }))
    await screen.findByText('Saved', { selector: '[data-slot="toast-title"]' })

    expect(await axe(container)).toHaveNoViolations()
  })
})

const ActionProbe = ({ onUndo, duration = 0 }: { onUndo: () => void; duration?: number }) => {
  const toast = useToast()

  return <button onClick={() => toast.success('Message deleted', duration, { action: { label: 'Undo', onClick: onUndo } })}>delete</button>
}

const Pinned = ({ dismissible, duration = 0, action }: { dismissible?: boolean; duration?: number; action?: () => void }) => {
  const toast = useToast()
  const [id, setId] = useState('')

  return (
    <>
      <button onClick={() => setId(toast.info('Syncing', duration, { dismissible, action: action ? { label: 'Retry', onClick: action } : undefined }))}>sync</button>
      <button onClick={() => toast.removeToast(id)}>remove</button>
    </>
  )
}

const itemOf = (text: string) => screen.getByText(text, { selector: '[data-slot="toast-title"]' }).closest('[data-slot="toast"]') as HTMLElement

describe('Toast action', () => {
  it('renders a button named after the label, between the message and the close button', async () => {
    const user = userEvent.setup()
    renderWithToasts(<ActionProbe onUndo={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'delete' }))
    const buttons = within(itemOf('Message deleted')).getAllByRole('button')

    expect(buttons).toHaveLength(2)
    expect(buttons[0]).toHaveAccessibleName('Undo')
    expect(buttons[0]).toHaveAttribute('data-slot', 'toast-action')
    expect(buttons[0]).toHaveAttribute('type', 'button')
    expect(buttons[1]).toHaveAccessibleName('Fechar notificação')
  })

  it('calls onClick once and closes the toast', async () => {
    const user = userEvent.setup()
    const onUndo = vi.fn()
    renderWithToasts(<ActionProbe onUndo={onUndo} />)

    await user.click(screen.getByRole('button', { name: 'delete' }))
    await user.click(await screen.findByRole('button', { name: 'Undo' }))

    expect(onUndo).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Undo' })).not.toBeInTheDocument())
  })

  it('is reached by the keyboard before the close button, and Enter presses it', async () => {
    const user = userEvent.setup()
    const onUndo = vi.fn()
    renderWithToasts(<ActionProbe onUndo={onUndo} />)

    await user.click(screen.getByRole('button', { name: 'delete' }))
    await user.tab()

    expect(screen.getByRole('button', { name: 'Undo' })).toHaveFocus()

    await user.tab()

    expect(screen.getByRole('button', { name: 'Fechar notificação' })).toHaveFocus()

    await user.tab({ shift: true })
    await user.keyboard('{Enter}')

    expect(onUndo).toHaveBeenCalledTimes(1)
  })

  it('is pressed with Space', async () => {
    const user = userEvent.setup()
    const onUndo = vi.fn()
    renderWithToasts(<ActionProbe onUndo={onUndo} />)

    await user.click(screen.getByRole('button', { name: 'delete' }))
    await user.tab()
    await user.keyboard(' ')

    expect(onUndo).toHaveBeenCalledTimes(1)
  })

  it('takes nodes as the label', async () => {
    const user = userEvent.setup()

    const Nodes = () => {
      const toast = useToast()

      return (
        <button onClick={() => toast.info('Moved', 0, { action: { label: <strong>Go there</strong>, onClick: vi.fn() } })}>move</button>
      )
    }

    renderWithToasts(<Nodes />)
    await user.click(screen.getByRole('button', { name: 'move' }))

    expect(await screen.findByRole('button', { name: 'Go there' })).toBeInTheDocument()
  })

  it('has no axe violations with an action', async () => {
    const user = userEvent.setup()
    const { container } = renderWithToasts(<ActionProbe onUndo={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'delete' }))
    await screen.findByRole('button', { name: 'Undo' })

    expect(await axe(container)).toHaveNoViolations()
    expect(await axe(host())).toHaveNoViolations()
  })
})

describe('Toast dismissible', () => {
  it('has no close button and is marked when it is not dismissible', async () => {
    const user = userEvent.setup()
    renderWithToasts(<Pinned dismissible={false} />)

    await user.click(screen.getByRole('button', { name: 'sync' }))
    const item = itemOf('Syncing')

    expect(within(item).queryByRole('button')).not.toBeInTheDocument()
    expect(item).toHaveAttribute('data-dismissible', 'false')
  })

  it('is dismissible by default and does not carry the mark', async () => {
    const user = userEvent.setup()
    renderWithToasts(<Pinned />)

    await user.click(screen.getByRole('button', { name: 'sync' }))

    expect(itemOf('Syncing')).not.toHaveAttribute('data-dismissible')
    expect(within(itemOf('Syncing')).getByRole('button', { name: 'Fechar notificação' })).toBeInTheDocument()
  })

  it('stays when it is clicked and when Escape is pressed while it has the focus', async () => {
    const user = userEvent.setup()
    const retry = vi.fn()
    renderWithToasts(<Pinned dismissible={false} action={retry} />)

    await user.click(screen.getByRole('button', { name: 'sync' }))
    await user.click(itemOf('Syncing'))
    within(itemOf('Syncing')).getByRole('button', { name: 'Retry' }).focus()
    await user.keyboard('{Escape}')

    expect(itemOf('Syncing')).toBeInTheDocument()
    expect(retry).not.toHaveBeenCalled()
  })

  it('still closes by itself after its duration', async () => {
    const user = userEvent.setup()
    renderWithToasts(<Pinned dismissible={false} duration={80} />)

    await user.click(screen.getByRole('button', { name: 'sync' }))
    await screen.findByText('Syncing', { selector: '[data-slot="toast-title"]' })

    await waitFor(() => expect(screen.queryByText('Syncing', { selector: '[data-slot="toast-title"]' })).not.toBeInTheDocument())
  })

  it('still closes with removeToast', async () => {
    const user = userEvent.setup()
    renderWithToasts(<Pinned dismissible={false} />)

    await user.click(screen.getByRole('button', { name: 'sync' }))
    await user.click(screen.getByRole('button', { name: 'remove' }))

    await waitFor(() => expect(screen.queryByText('Syncing', { selector: '[data-slot="toast-title"]' })).not.toBeInTheDocument())
  })

  it('keeps its action, which closes the toast', async () => {
    const user = userEvent.setup()
    const retry = vi.fn()
    renderWithToasts(<Pinned dismissible={false} action={retry} />)

    await user.click(screen.getByRole('button', { name: 'sync' }))
    await user.click(await screen.findByRole('button', { name: 'Retry' }))

    expect(retry).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(screen.queryByText('Syncing', { selector: '[data-slot="toast-title"]' })).not.toBeInTheDocument())
  })
})

const Updater = ({ duration = 0 }: { duration?: number }) => {
  const toast = useToast()
  const [id, setId] = useState('')

  return (
    <>
      <button onClick={() => setId(toast.info('Uploading', duration))}>start</button>
      <button onClick={() => toast.update(id, { message: 'Uploaded', type: 'success' })}>finish</button>
      <button onClick={() => toast.update(id, { type: 'error', message: 'Failed' })}>fail</button>
      <button onClick={() => toast.update(id, { duration: 80 })}>shorten</button>
      <button onClick={() => toast.update(id, { action: { label: 'Retry', onClick: vi.fn() } })}>action</button>
      <button onClick={() => toast.update(id, { action: undefined })}>no action</button>
      <button onClick={() => toast.update('missing', { message: 'Nothing' })}>missing</button>
    </>
  )
}

const titleOf = (text: string) => screen.queryByText(text, { selector: '[data-slot="toast-title"]' })

describe('Toast update', () => {
  it('changes the message and the type of the same toast in place', async () => {
    const user = userEvent.setup()
    renderWithToasts(<Updater />)

    await user.click(screen.getByRole('button', { name: 'start' }))
    const item = itemOf('Uploading')

    await user.click(screen.getByRole('button', { name: 'finish' }))

    expect(titleOf('Uploading')).not.toBeInTheDocument()
    expect(itemOf('Uploaded')).toBe(item)
    expect(item).toHaveAttribute('data-type', 'success')
  })

  it('announces the new text, and moves an error to the alert announcer', async () => {
    const user = userEvent.setup()
    renderWithToasts(<Updater />)

    await user.click(screen.getByRole('button', { name: 'start' }))
    await waitFor(() => expect(announcer('status')).toHaveTextContent('Uploading'))
    await user.click(screen.getByRole('button', { name: 'fail' }))

    await waitFor(() => expect(announcer('alert')).toHaveTextContent('Failed'))
  })

  it('does not say the text again when only something else changes', async () => {
    const user = userEvent.setup()
    renderWithToasts(<Updater />)

    await user.click(screen.getByRole('button', { name: 'start' }))
    await waitFor(() => expect(announcer('status')).toHaveTextContent('Uploading'))
    const seen: string[] = []
    const observer = new MutationObserver(() => seen.push(announcer('status').textContent ?? ''))

    observer.observe(announcer('status'), { childList: true, characterData: true, subtree: true })
    await user.click(screen.getByRole('button', { name: 'shorten' }))
    await user.click(screen.getByRole('button', { name: 'action' }))
    await new Promise((resolve) => setTimeout(resolve, 200))
    observer.disconnect()

    expect(seen).toEqual([])
  })

  it('restarts the countdown with the new duration, and a sticky toast starts to expire', async () => {
    const user = userEvent.setup()
    renderWithToasts(<Updater />)

    await user.click(screen.getByRole('button', { name: 'start' }))
    expect(itemOf('Uploading').querySelector('[data-slot="toast-progress"]')).toBeNull()

    await user.click(screen.getByRole('button', { name: 'shorten' }))

    await waitFor(() => expect(titleOf('Uploading')).not.toBeInTheDocument())
  })

  it('adds and removes an action', async () => {
    const user = userEvent.setup()
    renderWithToasts(<Updater />)

    await user.click(screen.getByRole('button', { name: 'start' }))
    await user.click(screen.getByRole('button', { name: 'action' }))

    expect(await screen.findByRole('button', { name: 'Retry' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'no action' }))

    await waitFor(() => expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument())
  })

  it('ignores an id that does not exist', async () => {
    const user = userEvent.setup()
    renderWithToasts(<Updater />)

    await user.click(screen.getByRole('button', { name: 'start' }))
    await user.click(screen.getByRole('button', { name: 'missing' }))

    expect(titleOf('Nothing')).not.toBeInTheDocument()
    expect(titleOf('Uploading')).toBeInTheDocument()
  })
})

const Promiser = ({ task, messages, options }: { task: () => Promise<string>; messages: ToastPromiseMessages<string>; options?: ToastOptions }) => {
  const toast = useToast()
  const [result, setResult] = useState('')

  return (
    <>
      <button onClick={() => toast.promise(task(), messages, options).then(setResult, (reason: unknown) => setResult(`rejected ${String(reason)}`))}>run</button>
      <output>{result}</output>
    </>
  )
}

const deferred = () => {
  const control: { resolve: (value: string) => void; reject: (reason: unknown) => void } = { resolve: () => undefined, reject: () => undefined }
  const promise = new Promise<string>((resolve, reject) => {
    control.resolve = resolve
    control.reject = reject
  })

  return { promise, ...control }
}

describe('Toast promise', () => {
  it('shows the loading message at first, as a toast that does not expire', async () => {
    const user = userEvent.setup()
    const task = deferred()
    renderWithToasts(<Promiser task={() => task.promise} messages={{ loading: 'Saving', success: 'Saved', error: 'Failed' }} />)

    await user.click(screen.getByRole('button', { name: 'run' }))

    expect(itemOf('Saving')).toHaveAttribute('data-type', 'info')
    expect(itemOf('Saving').querySelector('[data-slot="toast-progress"]')).toBeNull()
  })

  it('turns into a success that expires when the promise resolves, and hands the value back', async () => {
    const user = userEvent.setup()
    const task = deferred()
    renderWithToasts(<Promiser task={() => task.promise} messages={{ loading: 'Saving', success: (value) => `Saved ${value}`, error: 'Failed' }} />)

    await user.click(screen.getByRole('button', { name: 'run' }))
    const item = itemOf('Saving')
    await act(async () => task.resolve('draft'))

    await waitFor(() => expect(titleOf('Saved draft')).toBeInTheDocument())
    expect(itemOf('Saved draft')).toBe(item)
    expect(item).toHaveAttribute('data-type', 'success')
    expect(item.querySelector('[data-slot="toast-progress"]')).not.toBeNull()
    expect(screen.getByText('draft', { selector: 'output' })).toBeInTheDocument()
  })

  it('turns into an error when the promise rejects, and still rejects for the caller', async () => {
    const user = userEvent.setup()
    const task = deferred()
    renderWithToasts(<Promiser task={() => task.promise} messages={{ loading: 'Saving', success: 'Saved', error: (reason) => `Could not save: ${String(reason)}` }} />)

    await user.click(screen.getByRole('button', { name: 'run' }))
    await act(async () => task.reject('offline'))

    await waitFor(() => expect(titleOf('Could not save: offline')).toBeInTheDocument())
    expect(itemOf('Could not save: offline')).toHaveAttribute('data-type', 'error')
    expect(screen.getByText('rejected offline', { selector: 'output' })).toBeInTheDocument()
  })

  it('announces the loading message and then the result', async () => {
    const user = userEvent.setup()
    const task = deferred()
    renderWithToasts(<Promiser task={() => task.promise} messages={{ loading: 'Saving', success: 'Saved', error: 'Failed' }} />)

    await user.click(screen.getByRole('button', { name: 'run' }))
    await waitFor(() => expect(announcer('status')).toHaveTextContent('Saving'))
    await act(async () => task.resolve('x'))

    await waitFor(() => expect(announcer('status')).toHaveTextContent('Saved'))
  })

  it('announces a failure in the alert announcer', async () => {
    const user = userEvent.setup()
    const task = deferred()
    renderWithToasts(<Promiser task={() => task.promise} messages={{ loading: 'Saving', success: 'Saved', error: 'Failed' }} />)

    await user.click(screen.getByRole('button', { name: 'run' }))
    await act(async () => task.reject(new Error('x')))

    await waitFor(() => expect(announcer('alert')).toHaveTextContent('Failed'))
  })

  it('shows no result when the loading toast was closed before the promise settled', async () => {
    const user = userEvent.setup()
    const task = deferred()
    renderWithToasts(<Promiser task={() => task.promise} messages={{ loading: 'Saving', success: 'Saved', error: 'Failed' }} />)

    await user.click(screen.getByRole('button', { name: 'run' }))
    await user.click(within(itemOf('Saving')).getByRole('button', { name: 'Fechar notificação' }))
    await waitFor(() => expect(titleOf('Saving')).not.toBeInTheDocument())
    await act(async () => task.resolve('x'))

    expect(titleOf('Saved')).not.toBeInTheDocument()
  })

  it('keeps the options on every state of the toast', async () => {
    const user = userEvent.setup()
    const task = deferred()
    renderWithToasts(<Promiser task={() => task.promise} messages={{ loading: 'Saving', success: 'Saved', error: 'Failed' }} options={{ className: 'mine', dismissible: false }} />)

    await user.click(screen.getByRole('button', { name: 'run' }))

    expect(itemOf('Saving')).toHaveClass('mine')
    expect(itemOf('Saving')).toHaveAttribute('data-dismissible', 'false')

    await act(async () => task.resolve('x'))
    await waitFor(() => expect(titleOf('Saved')).toBeInTheDocument())

    expect(itemOf('Saved')).toHaveClass('mine')
    expect(itemOf('Saved')).toHaveAttribute('data-dismissible', 'false')
  })
})

const withProvider = (props: Omit<ToastProviderProps, 'children'>, ui: ReactElement) =>
  render(
    <UIProvider locale={ptBR}>
      <ToastProvider {...props}>{ui}</ToastProvider>
    </UIProvider>
  )

const Burst = ({ count = 4, duration = 0 }: { count?: number; duration?: number }) => {
  const toast = useToast()

  return (
    <button
      onClick={() => {
        for (let number = 1; number <= count; number += 1) toast.info(`Toast ${number}`, duration)
      }}
    >
      burst
    </button>
  )
}

describe('Toast position', () => {
  it('is at the top end by default', () => {
    withProvider({}, <Probe />)

    expect(screen.getByRole('region', { name: 'Notificações' })).toHaveAttribute('data-position', 'top-end')
  })

  it.each(['top-start', 'top-end', 'bottom-start', 'bottom-end'] as const)('puts the region at %s', (position) => {
    withProvider({ position }, <Probe />)

    expect(screen.getByRole('region', { name: 'Notificações' })).toHaveAttribute('data-position', position)
  })

  it('slides in from the side of the position, unless the animation says otherwise', async () => {
    const user = userEvent.setup()
    const entry = async (props: Omit<ToastProviderProps, 'children'>) => {
      const view = withProvider(props, <Probe duration={0} />)

      await user.click(screen.getByRole('button', { name: 'success' }))
      const direction = itemOf('Saved').style.getPropertyValue('--enchase-toast-dx')

      view.unmount()

      return direction
    }

    const end = await entry({ position: 'top-end' })
    const start = await entry({ position: 'top-start' })
    const forced = await entry({ position: 'top-start', animation: { recipe: 'slide', from: 'right' } })

    expect(end).not.toBe('')
    expect(start).not.toBe(end)
    expect(forced).toBe(end)
  })
})

describe('Toast limit', () => {
  it('shows only that many toasts and keeps the others waiting', async () => {
    const user = userEvent.setup()
    withProvider({ limit: 2 }, <Burst />)

    await user.click(screen.getByRole('button', { name: 'burst' }))

    expect(titleOf('Toast 1')).toBeInTheDocument()
    expect(titleOf('Toast 2')).toBeInTheDocument()
    expect(titleOf('Toast 3')).not.toBeInTheDocument()
    expect(titleOf('Toast 4')).not.toBeInTheDocument()
  })

  it('shows everything without a limit', async () => {
    const user = userEvent.setup()
    withProvider({}, <Burst />)

    await user.click(screen.getByRole('button', { name: 'burst' }))

    expect(document.querySelectorAll('[data-slot="toast"]')).toHaveLength(4)
  })

  it('brings the next one in, in order, when a visible one is closed', async () => {
    const user = userEvent.setup()
    withProvider({ limit: 2 }, <Burst />)

    await user.click(screen.getByRole('button', { name: 'burst' }))
    await user.click(within(itemOf('Toast 1')).getByRole('button', { name: 'Fechar notificação' }))

    await waitFor(() => expect(titleOf('Toast 3')).toBeInTheDocument())
    expect(titleOf('Toast 4')).not.toBeInTheDocument()

    await user.click(within(itemOf('Toast 2')).getByRole('button', { name: 'Fechar notificação' }))

    await waitFor(() => expect(titleOf('Toast 4')).toBeInTheDocument())
  })

  it('announces a toast when it shows up, not while it waits', async () => {
    const user = userEvent.setup()
    withProvider({ limit: 1 }, <Burst count={2} />)

    await user.click(screen.getByRole('button', { name: 'burst' }))
    await waitFor(() => expect(announcer('status')).toHaveTextContent('Toast 1'))

    expect(announcer('status')).not.toHaveTextContent('Toast 2')

    await user.click(within(itemOf('Toast 1')).getByRole('button', { name: 'Fechar notificação' }))

    await waitFor(() => expect(announcer('status')).toHaveTextContent('Toast 2'))
  })

  it('starts the countdown of a waiting toast only when it shows up', async () => {
    const user = userEvent.setup()
    withProvider({ limit: 1 }, <Burst count={2} duration={300} />)

    await user.click(screen.getByRole('button', { name: 'burst' }))
    await waitFor(() => expect(titleOf('Toast 2')).toBeInTheDocument(), { timeout: 2000 })
    await new Promise((resolve) => setTimeout(resolve, 150))

    expect(titleOf('Toast 2')).toBeInTheDocument()

    await waitFor(() => expect(titleOf('Toast 2')).not.toBeInTheDocument(), { timeout: 2000 })
  })

  it('drops a waiting toast that is removed, without showing it', async () => {
    const user = userEvent.setup()

    const Queue = () => {
      const toast = useToast()
      const [ids, setIds] = useState<string[]>([])

      return (
        <>
          <button onClick={() => setIds([toast.info('First', 0), toast.info('Second', 0)])}>queue</button>
          <button onClick={() => toast.removeToast(ids[1] ?? '')}>drop second</button>
        </>
      )
    }

    withProvider({ limit: 1 }, <Queue />)
    await user.click(screen.getByRole('button', { name: 'queue' }))
    await user.click(screen.getByRole('button', { name: 'drop second' }))
    await user.click(within(itemOf('First')).getByRole('button', { name: 'Fechar notificação' }))

    await waitFor(() => expect(titleOf('First')).not.toBeInTheDocument())
    expect(titleOf('Second')).not.toBeInTheDocument()
  })
})

describe('Toast pause of the whole stack', () => {
  it('stops every countdown while the pointer is over the region', async () => {
    const user = userEvent.setup()
    withProvider({}, <Burst count={2} duration={250} />)

    await user.click(screen.getByRole('button', { name: 'burst' }))
    await user.hover(itemOf('Toast 1'))
    await new Promise((resolve) => setTimeout(resolve, 600))

    expect(titleOf('Toast 1')).toBeInTheDocument()
    expect(titleOf('Toast 2')).toBeInTheDocument()
    expect(itemOf('Toast 2')).toHaveAttribute('data-paused')

    await user.unhover(itemOf('Toast 1'))

    await waitFor(() => expect(titleOf('Toast 2')).not.toBeInTheDocument(), { timeout: 2000 })
    expect(titleOf('Toast 1')).not.toBeInTheDocument()
  })

  it('stops every countdown while the focus is inside the region, also when it moves between toasts', async () => {
    const user = userEvent.setup()
    withProvider({}, <Burst count={2} duration={250} />)

    await user.click(screen.getByRole('button', { name: 'burst' }))
    within(itemOf('Toast 1')).getByRole('button', { name: 'Fechar notificação' }).focus()
    within(itemOf('Toast 2')).getByRole('button', { name: 'Fechar notificação' }).focus()
    await new Promise((resolve) => setTimeout(resolve, 600))

    expect(titleOf('Toast 1')).toBeInTheDocument()
    expect(titleOf('Toast 2')).toBeInTheDocument()

    act(() => (document.activeElement as HTMLElement).blur())

    await waitFor(() => expect(titleOf('Toast 1')).not.toBeInTheDocument(), { timeout: 2000 })
  })

  it('starts a toast that arrives during the pause already paused', async () => {
    const user = userEvent.setup()
    withProvider({}, <Burst count={1} duration={250} />)

    await user.click(screen.getByRole('button', { name: 'burst' }))
    await user.hover(itemOf('Toast 1'))
    screen.getByRole('button', { name: 'burst' }).focus()
    await user.keyboard('{Enter}')
    await new Promise((resolve) => setTimeout(resolve, 500))

    expect(document.querySelectorAll('[data-slot="toast"]')).toHaveLength(2)
  })
})
