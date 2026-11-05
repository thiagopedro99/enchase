import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import { StrictMode, useRef, useState } from 'react'
import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import UIProvider from '@components/uiProvider/index.tsx'
import { ToastProvider, useToast } from '@components/toast/index.ts'
import { ptBR } from '@locales/ptBR.ts'

import type { ToastPosition } from '@components/toast/types.ts'

const Launcher = ({ name, duration = 0 }: { name: string; duration?: number }) => {
  const toast = useToast()
  const count = useRef(0)

  return (
    <button
      onClick={() => {
        count.current += 1
        toast.info(`${name}${count.current}`, duration)
      }}
    >
      {name}
    </button>
  )
}

const regions = () => screen.queryAllByRole('region', { name: 'Notificações' })

const region = () => {
  const found = regions()

  expect(found).toHaveLength(1)

  return found[0]
}

const titles = (element: HTMLElement) => Array.from(element.querySelectorAll('[data-slot="toast-title"]')).map((title) => title.textContent)

const items = () => Array.from(document.querySelectorAll<HTMLElement>('[data-slot="toast"]'))

const hosts = () => Array.from(document.querySelectorAll<HTMLElement>('[data-slot="toast-host"]'))

const toastCount = () => screen.queryAllByRole('button', { name: 'Fechar notificação' }).length

const arrive = async (user: ReturnType<typeof userEvent.setup>, name: string, title: string) => {
  await user.click(screen.getByRole('button', { name }))
  await screen.findByText(title, { selector: '[data-slot="toast-title"]' })
}

const store = globalThis as unknown as Record<symbol, WeakMap<Element, unknown> | undefined>

afterEach(() => {
  vi.useRealTimers()
})

describe('providers on the same position and container', () => {
  it('share one region and stack their toasts in the order they arrived', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <>
        <ToastProvider>
          <Launcher name="A" />
        </ToastProvider>
        <ToastProvider>
          <Launcher name="B" />
        </ToastProvider>
      </>
    )

    await arrive(user, 'A', 'A1')
    await arrive(user, 'B', 'B1')
    await arrive(user, 'A', 'A2')

    expect(titles(region())).toEqual(['A1', 'B1', 'A2'])
    expect(items()).toHaveLength(3)
    expect(items().every((item) => region().contains(item))).toBe(true)
  })

  it('share one region when the app is in strict mode', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <StrictMode>
        <ToastProvider>
          <Launcher name="A" />
        </ToastProvider>
        <ToastProvider>
          <Launcher name="B" />
        </ToastProvider>
      </StrictMode>
    )

    await arrive(user, 'A', 'A1')
    await arrive(user, 'B', 'B1')

    expect(titles(region())).toEqual(['A1', 'B1'])
  })

  it('keep the labels of the provider of each toast', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <>
        <ToastProvider>
          <Launcher name="A" />
        </ToastProvider>
        <UIProvider locale={ptBR} labels={{ closeToast: 'Dismiss B' }}>
          <ToastProvider>
            <Launcher name="B" />
          </ToastProvider>
        </UIProvider>
      </>
    )

    await arrive(user, 'A', 'A1')
    await arrive(user, 'B', 'B1')

    expect(within(items()[0]).getByRole('button', { name: 'Fechar notificação' })).toBeInTheDocument()
    expect(within(items()[1]).getByRole('button', { name: 'Dismiss B' })).toBeInTheDocument()
    expect(region()).toHaveAccessibleName('Notificações')
  })

  it('keep their toasts apart when the positions differ', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <>
        <ToastProvider>
          <Launcher name="A" />
        </ToastProvider>
        <ToastProvider position="bottom-start">
          <Launcher name="B" />
        </ToastProvider>
      </>
    )

    await arrive(user, 'A', 'A1')
    await arrive(user, 'B', 'B1')

    const found = regions()
    const top = found.find((element) => element.getAttribute('data-position') === 'top-end')
    const bottom = found.find((element) => element.getAttribute('data-position') === 'bottom-start')

    expect(found).toHaveLength(2)
    expect(titles(top as HTMLElement)).toEqual(['A1'])
    expect(titles(bottom as HTMLElement)).toEqual(['B1'])
  })

  it('keep their toasts apart when the containers differ', async () => {
    const user = userEvent.setup()
    const first = document.body.appendChild(document.createElement('div'))
    const second = document.body.appendChild(document.createElement('div'))
    renderWithProviders(
      <>
        <ToastProvider container={first}>
          <Launcher name="A" />
        </ToastProvider>
        <ToastProvider container={second}>
          <Launcher name="B" />
        </ToastProvider>
      </>
    )

    await arrive(user, 'A', 'A1')
    await arrive(user, 'B', 'B1')

    expect(regions()).toHaveLength(2)
    expect(titles(within(first).getByRole('region', { name: 'Notificações' }))).toEqual(['A1'])
    expect(titles(within(second).getByRole('region', { name: 'Notificações' }))).toEqual(['B1'])

    first.remove()
    second.remove()
  })

  it('take the class and the style of the region from the first one only', () => {
    renderWithProviders(
      <>
        <ToastProvider className="from-a" style={{ opacity: 0.9 }}>
          <p>A</p>
        </ToastProvider>
        <ToastProvider className="from-b" style={{ opacity: 0.5 }}>
          <p>B</p>
        </ToastProvider>
      </>
    )

    expect(region()).toHaveClass('from-a')
    expect(region()).not.toHaveClass('from-b')
    expect(region()).toHaveStyle({ opacity: '0.9' })
  })

  it('count the limit of each provider on its own', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <>
        <ToastProvider limit={1}>
          <Launcher name="A" />
        </ToastProvider>
        <ToastProvider>
          <Launcher name="B" />
        </ToastProvider>
      </>
    )

    await arrive(user, 'A', 'A1')
    await user.click(screen.getByRole('button', { name: 'A' }))
    await arrive(user, 'B', 'B1')
    await arrive(user, 'B', 'B2')

    expect(titles(region())).toEqual(['A1', 'B1', 'B2'])

    await user.click(within(items()[0]).getByRole('button', { name: 'Fechar notificação' }))

    await waitFor(() => expect(titles(region())).toEqual(['B1', 'B2', 'A2']))
  })

  it('announce each toast in the announcers of its own provider', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <>
        <ToastProvider>
          <Launcher name="A" />
        </ToastProvider>
        <ToastProvider>
          <Launcher name="B" />
        </ToastProvider>
      </>
    )

    await arrive(user, 'B', 'B1')

    const [first, second] = hosts()

    await waitFor(() => expect(within(second).getByRole('status')).toHaveTextContent('B1'))
    expect(within(first).getByRole('status')).toBeEmptyDOMElement()
    expect(within(first).getByRole('alert')).toBeEmptyDOMElement()
  })
})

describe('the pause of the providers that share a region', () => {
  const Pair = () => (
    <>
      <ToastProvider>
        <Launcher name="A" duration={60000} />
      </ToastProvider>
      <ToastProvider>
        <Launcher name="B" duration={60000} />
      </ToastProvider>
    </>
  )

  it('stops every toast of the region while the pointer is over one of them', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderWithProviders(<Pair />)

    await arrive(user, 'A', 'A1')
    await arrive(user, 'B', 'B1')
    await user.hover(items()[1])

    expect(items().every((item) => item.hasAttribute('data-paused'))).toBe(true)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(180000)
    })
    expect(toastCount()).toBe(2)

    await user.unhover(items()[1])
    expect(items().some((item) => item.hasAttribute('data-paused'))).toBe(false)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(90000)
    })
    await waitFor(() => expect(toastCount()).toBe(0))
  })

  it('stops every toast of the region while the focus is inside one of them', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderWithProviders(<Pair />)

    await arrive(user, 'A', 'A1')
    await arrive(user, 'B', 'B1')
    const close = within(items()[1]).getByRole('button', { name: 'Fechar notificação' })
    act(() => close.focus())

    expect(items().every((item) => item.hasAttribute('data-paused'))).toBe(true)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(180000)
    })
    expect(toastCount()).toBe(2)

    act(() => close.blur())
    expect(items().some((item) => item.hasAttribute('data-paused'))).toBe(false)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(90000)
    })
    await waitFor(() => expect(toastCount()).toBe(0))
  })

  it('keeps the pause while the focus moves between the toasts of different providers', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Pair />)

    await arrive(user, 'A', 'A1')
    await arrive(user, 'B', 'B1')
    const closes = items().map((item) => within(item).getByRole('button', { name: 'Fechar notificação' }))
    act(() => closes[0].focus())
    act(() => closes[1].focus())

    expect(items().every((item) => item.hasAttribute('data-paused'))).toBe(true)

    act(() => closes[1].blur())

    expect(items().some((item) => item.hasAttribute('data-paused'))).toBe(false)
  })
})

describe('the region of the providers that share it', () => {
  const Dropping = ({ both = false }: { both?: boolean }) => {
    const [mounted, setMounted] = useState(true)

    return (
      <>
        {mounted && (
          <ToastProvider>
            <Launcher name="A" />
          </ToastProvider>
        )}
        {(mounted || !both) && (
          <ToastProvider>
            <Launcher name="B" />
          </ToastProvider>
        )}
        <button onClick={() => setMounted(false)}>drop</button>
      </>
    )
  }

  it('goes to the next provider when the first one leaves, and keeps the toasts of the others', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Dropping />)

    await arrive(user, 'A', 'A1')
    await arrive(user, 'B', 'B1')
    await user.click(screen.getByRole('button', { name: 'drop' }))

    await waitFor(() => expect(titles(region())).toEqual(['B1']))

    await arrive(user, 'B', 'B2')

    expect(titles(region())).toEqual(['B1', 'B2'])
  })

  it('pauses the toasts of the new first provider only while it is hovered', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderWithProviders(<Dropping />)

    await arrive(user, 'B', 'B1')
    await user.hover(items()[0])
    await user.click(screen.getByRole('button', { name: 'drop' }))

    await waitFor(() => expect(titles(region())).toEqual(['B1']))
    expect(items()[0]).not.toHaveAttribute('data-paused')
  })

  it('disappears with the last provider, and leaves nothing behind', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Dropping both />)

    await arrive(user, 'A', 'A1')
    await arrive(user, 'B', 'B1')
    expect(store[Symbol.for('enchase.toastViewport.v1')]?.has(document.body)).toBe(true)

    await user.click(screen.getByRole('button', { name: 'drop' }))

    await waitFor(() => expect(regions()).toHaveLength(0))
    expect(store[Symbol.for('enchase.toastViewport.v1')]?.has(document.body)).toBe(false)
  })

  it('moves a provider to the region of its new position', async () => {
    const user = userEvent.setup()

    const Moving = () => {
      const [position, setPosition] = useState<ToastPosition>('top-end')

      return (
        <>
          <ToastProvider>
            <Launcher name="A" />
          </ToastProvider>
          <ToastProvider position={position}>
            <Launcher name="B" />
          </ToastProvider>
          <button onClick={() => setPosition('bottom-end')}>move</button>
        </>
      )
    }

    renderWithProviders(<Moving />)

    await arrive(user, 'A', 'A1')
    await arrive(user, 'B', 'B1')
    expect(titles(region())).toEqual(['A1', 'B1'])

    await user.click(screen.getByRole('button', { name: 'move' }))

    await waitFor(() => expect(regions()).toHaveLength(2))
    const top = regions().find((element) => element.getAttribute('data-position') === 'top-end')
    const bottom = regions().find((element) => element.getAttribute('data-position') === 'bottom-end')

    expect(titles(top as HTMLElement)).toEqual(['A1'])
    expect(titles(bottom as HTMLElement)).toEqual(['B1'])
  })
})
