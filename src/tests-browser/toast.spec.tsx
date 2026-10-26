import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { render } from '@testing-library/react'

import { ColorModeProvider } from '@components/colorMode/index.tsx'
import UIProvider from '@components/uiProvider/index.tsx'
import { Modal } from '@components/common/Modal/index.tsx'
import { ToastProvider, useToast } from '@components/toast/index.ts'
import { GlobalStyles } from '@styles/react.tsx'
import { ptBR } from '@locales/ptBR.ts'
import { renderInBrowser } from './harness.tsx'
import { setReducedMotion } from './media.ts'
import { isSettled, isStable, soak } from './settle.ts'

import type { ReactElement } from 'react'

const renderWithDir = (ui: ReactElement, dir: 'ltr' | 'rtl') => {
  document.documentElement.dir = dir

  return render(
    <ColorModeProvider defaultMode="light" storage={null}>
      <GlobalStyles />
      <UIProvider locale={{ ...ptBR, dir }} navigate={() => undefined} currentHref="/">
        <ToastProvider>{ui}</ToastProvider>
      </UIProvider>
    </ColorModeProvider>
  )
}


const items = () => [...document.querySelectorAll<HTMLElement>('[data-slot="toast"]')]

const itemWith = (text: string) => items().find((item) => item.textContent?.includes(text))

const flipAnimations = () => items().flatMap((item) => item.getAnimations().filter((animation) => animation.id === 'enchase-flip'))

const added: HTMLStyleElement[] = []

const addStyle = (css: string, where: 'start' | 'end') => {
  const style = document.createElement('style')
  style.textContent = css
  if (where === 'start') document.head.prepend(style)
  else document.head.append(style)
  added.push(style)
}

afterEach(async () => {
  added.splice(0).forEach((style) => style.remove())
  await setReducedMotion('no-preference')
})

const Launcher = ({ duration = 60000 }: { duration?: number }) => {
  const toast = useToast()

  const padded = { padding: '8px 16px' }

  return (
    <div style={{ margin: 40, display: 'flex', gap: 8 }}>
      <button style={padded} onClick={() => toast.success('Alfa', duration)}>
        alfa
      </button>
      <button style={padded} onClick={() => toast.info('Beta', duration, { className: 'mine' })}>
        beta
      </button>
      <button style={padded} onClick={() => toast.warning('Gama', duration)}>
        gama
      </button>
    </div>
  )
}

const fire = async (...names: string[]) => {
  for (const name of names) await userEvent.click(page.getByRole('button', { name }))
  await expect.poll(() => items().filter((item) => item.dataset.state === 'open').length).toBe(names.length)
  await expect.poll(() => items().every((item) => isSettled(item))).toBe(true)
  await expect.poll(async () => (await Promise.all(items().map((item) => isStable(() => item)))).every(Boolean), { timeout: 4000 }).toBe(true)
}

describe('Toast in a real browser', () => {
  it('stacks toasts from top to bottom on the same inline edge', async () => {
    renderInBrowser(<Launcher />, 'auto')
    await fire('alfa', 'beta', 'gama')
    const rects = items().map((item) => item.getBoundingClientRect())

    expect(rects[1].top).toBeGreaterThan(rects[0].bottom - 1)
    expect(rects[2].top).toBeGreaterThan(rects[1].bottom - 1)
    expect(rects[1].right).toBeCloseTo(rects[0].right, 0)
  })

  it('slides the remaining toasts into the gap instead of jumping', async () => {
    renderInBrowser(<Launcher />, 'auto')
    await fire('alfa', 'beta')
    const firstTop = itemWith('Alfa')?.getBoundingClientRect().top as number

    await userEvent.click(page.getByRole('button', { name: 'Fechar notificação' }).first())

    await expect.poll(() => flipAnimations().length).toBeGreaterThan(0)
    await expect.poll(() => items().length).toBe(1)
    await expect.poll(() => Math.round((itemWith('Beta')?.getBoundingClientRect().top as number) - firstTop)).toBe(0)
  })

  it('does not slide anything when the user prefers reduced motion', async () => {
    await setReducedMotion('reduce')
    renderInBrowser(<Launcher />, 'auto')
    await fire('alfa', 'beta')
    const animate = vi.spyOn(HTMLElement.prototype, 'animate')

    await userEvent.click(page.getByRole('button', { name: 'Fechar notificação' }).first())
    await expect.poll(() => items().length).toBe(1)

    const flips = animate.mock.calls.filter(([, options]) => typeof options === 'object' && options?.id === 'enchase-flip')
    animate.mockRestore()

    expect(flips).toHaveLength(0)
  })

  it('drains the progress bar and pauses it, and the timer, while hovered', async () => {
    renderInBrowser(<Launcher duration={4000} />, 'auto')
    await fire('alfa')
    const item = items()[0]
    const bar = () => item.querySelector<HTMLElement>('[data-slot="toast-progress"]') as HTMLElement
    const state = () => bar().getAnimations()[0]?.playState

    await expect.poll(state).toBe('running')

    await page.elementLocator(item).hover()
    await expect.poll(state).toBe('paused')
    const timing = bar().getAnimations()[0]?.effect?.getComputedTiming()
    await soak(Number(timing?.endTime ?? 1200) - Number(timing?.localTime ?? 0) + 400)

    expect(items()).toHaveLength(1)

    await page.elementLocator(document.body).hover({ position: { x: 2, y: 2 } })
    await expect.poll(state).toBe('running')
    await expect.poll(() => items().length, { timeout: 4000 }).toBe(0)
  })

  it.each([
    ['ltr', 1],
    ['rtl', -1]
  ] as const)('leaves through the inline end in %s', async (dir, sign) => {
    renderWithDir(<Launcher />, dir)
    await fire('alfa')
    let shift = 0

    await userEvent.click(page.getByRole('button', { name: 'Fechar notificação' }).first())
    await expect
      .poll(() => {
        const item = items()[0]
        shift = item ? new DOMMatrixReadOnly(getComputedStyle(item).transform).m41 : 0

        return Math.abs(shift) > 1
      })
      .toBe(true)

    expect(Math.sign(shift)).toBe(sign)
  })

  it.each([
    ['ltr', false],
    ['rtl', true]
  ] as const)('drains the progress bar from the start edge in %s', async (dir, atEnd) => {
    renderWithDir(<Launcher />, dir)
    await fire('alfa')
    const bar = items()[0].querySelector<HTMLElement>('[data-slot="toast-progress"]') as HTMLElement
    const originX = Number.parseFloat(getComputedStyle(bar).transformOrigin)

    expect(originX > bar.getBoundingClientRect().width / 2).toBe(atEnd)
  })

  it('lets the caller className win on layout even when its css loads first', async () => {
    addStyle('.mine { padding-inline: 33px; border-radius: 4px; min-block-size: 90px; }', 'start')
    renderInBrowser(<Launcher />, 'auto')
    await fire('beta')
    const style = getComputedStyle(itemWith('Beta') as HTMLElement)

    expect(style.paddingInlineStart).toBe('33px')
    expect(style.borderStartStartRadius).toBe('4px')
    expect(style.minBlockSize).toBe('90px')
  })

  it('lets the caller className win on colors when its css loads after', async () => {
    addStyle('.mine { background-color: rgb(1, 2, 3); }', 'end')
    renderInBrowser(<Launcher />, 'auto')
    await fire('beta')

    expect(getComputedStyle(itemWith('Beta') as HTMLElement).backgroundColor).toBe('rgb(1, 2, 3)')
  })

  it('gives the close button a target of at least 24 by 24', async () => {
    renderInBrowser(<Launcher />, 'auto')
    await fire('alfa')
    const rect = page.getByRole('button', { name: 'Fechar notificação' }).element().getBoundingClientRect()

    expect(rect.width).toBeGreaterThanOrEqual(24)
    expect(rect.height).toBeGreaterThanOrEqual(24)
  })
})

const ModalThatToasts = () => {
  const toast = useToast()
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)}>Abrir</button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Título">
        <button onClick={() => toast.error('Falha ao salvar', 60000)}>Disparar</button>
      </Modal>
    </>
  )
}

const viewport = () => document.querySelector<HTMLElement>('[data-slot="toast-viewport"]')

const openModalAndToast = async () => {
  renderInBrowser(<ModalThatToasts />)
  await userEvent.click(page.getByRole('button', { name: 'Abrir' }))
  await expect.element(page.getByRole('dialog')).toBeVisible()
  await userEvent.click(page.getByRole('button', { name: 'Disparar' }))
  await expect.poll(() => items().length).toBe(1)
}

describe('a toast fired while a modal is open, in a real browser', () => {
  it('stays out of the inert part of the page', async () => {
    await openModalAndToast()

    expect(document.querySelectorAll('[inert]').length).toBeGreaterThan(0)
    expect(viewport()?.closest('[inert]')).toBeNull()
    expect(viewport()?.closest('[data-slot="toast-host"]')?.parentElement).toBe(document.body)
  })

  it('can be closed with the pointer', async () => {
    await openModalAndToast()

    await userEvent.click(page.getByRole('button', { name: 'Fechar notificação' }))

    await expect.poll(() => items().length).toBe(0)
  })

  it('does not take the focus away from the dialog when it appears', async () => {
    await openModalAndToast()

    expect(page.getByRole('dialog').element().contains(document.activeElement)).toBe(true)
  })

  it('is announced by an announcer that is not inert', async () => {
    await openModalAndToast()
    const announcer = document.querySelector<HTMLElement>('[data-slot="toast-host"] [role="alert"]') as HTMLElement

    expect(announcer.closest('[inert]')).toBeNull()
    await expect.poll(() => announcer.textContent).toBe('Falha ao salvar')
  })
})

describe('the announcers of the notification region in a real browser', () => {
  const announcers = () => ['status', 'alert'].map((role) => document.querySelector<HTMLElement>(`[data-slot="toast-host"] [role="${role}"]`) as HTMLElement)

  it('are there before any toast, and nobody can see them', async () => {
    renderInBrowser(<Launcher />, 'auto')

    for (const announcer of announcers()) {
      const box = announcer.getBoundingClientRect()

      expect(announcer.textContent).toBe('')
      expect(box.width).toBeLessThanOrEqual(1)
      expect(box.height).toBeLessThanOrEqual(1)
      expect(getComputedStyle(announcer).clipPath).toBe('inset(50%)')
    }
  })

  it('say the text of a toast while the visible toast keeps no role', async () => {
    renderInBrowser(<Launcher />, 'auto')
    await fire('alfa')
    const [status, alert] = announcers()

    await expect.poll(() => status.textContent).toBe('Alfa')

    expect(alert.textContent).toBe('')
    expect(itemWith('Alfa')?.hasAttribute('role')).toBe(false)
    expect(document.querySelector('[data-slot="toast-viewport"]')?.hasAttribute('aria-live')).toBe(false)
  })
})

const WithAction = ({ onUndo }: { onUndo: () => void }) => {
  const toast = useToast()

  return (
    <div style={{ margin: 40, display: 'flex', gap: 8 }}>
      <button onClick={() => toast.success('Deleted', 60000, { action: { label: 'Undo', onClick: onUndo } })}>delete</button>
      <button onClick={() => toast.info('Syncing', 60000, { dismissible: false })}>sync</button>
    </div>
  )
}

const part = (name: string) => document.querySelector<HTMLElement>(`[data-slot="toast-${name}"]`) as HTMLElement

describe('the action of a toast in a real browser', () => {
  const settle = async () => {
    await expect.poll(() => items().filter((item) => item.dataset.state === 'open').length).toBe(1)
    await expect.poll(() => items().every((item) => isSettled(item))).toBe(true)
  }

  it('lays the message, the action and the close button out side by side without overlap', async () => {
    renderInBrowser(<WithAction onUndo={vi.fn()} />, 'auto')
    await userEvent.click(page.getByRole('button', { name: 'delete' }))
    await settle()
    const [message, action, close] = ['title', 'action', 'close'].map((name) => part(name).getBoundingClientRect())

    expect(message.right).toBeLessThanOrEqual(action.left + 1)
    expect(action.right).toBeLessThanOrEqual(close.left + 1)
    expect(action.height).toBeGreaterThanOrEqual(24)
    expect(action.width).toBeGreaterThanOrEqual(24)
  })

  it('mirrors the order in a right-to-left page', async () => {
    renderWithDir(<WithAction onUndo={vi.fn()} />, 'rtl')
    await userEvent.click(page.getByRole('button', { name: 'delete' }))
    await settle()
    const [message, action, close] = ['title', 'action', 'close'].map((name) => part(name).getBoundingClientRect())

    expect(action.right).toBeLessThanOrEqual(message.left + 1)
    expect(close.right).toBeLessThanOrEqual(action.left + 1)
  })

  it('shows a focus ring when the keyboard reaches it, and Enter presses it', async () => {
    const onUndo = vi.fn()
    renderInBrowser(<WithAction onUndo={onUndo} />, 'auto')
    await userEvent.click(page.getByRole('button', { name: 'delete' }))
    await settle()
    page.getByRole('button', { name: 'sync' }).element().focus()

    await userEvent.tab()

    expect(document.activeElement).toBe(part('action'))
    expect(getComputedStyle(part('action')).outlineStyle).toBe('solid')
    expect(parseFloat(getComputedStyle(part('action')).outlineWidth)).toBeGreaterThan(0)

    await userEvent.keyboard('{Enter}')

    expect(onUndo).toHaveBeenCalledTimes(1)
    await expect.poll(() => items().length).toBe(0)
  })

  it('is pressed with the pointer and closes the toast', async () => {
    const onUndo = vi.fn()
    renderInBrowser(<WithAction onUndo={onUndo} />, 'auto')
    await userEvent.click(page.getByRole('button', { name: 'delete' }))
    await settle()

    await userEvent.click(page.getByRole('button', { name: 'Undo' }))

    expect(onUndo).toHaveBeenCalledTimes(1)
    await expect.poll(() => items().length).toBe(0)
  })
})

describe('a toast that is not dismissible in a real browser', () => {
  it('has no close button, a plain cursor, and stays when it is clicked', async () => {
    renderInBrowser(<WithAction onUndo={vi.fn()} />, 'auto')
    await userEvent.click(page.getByRole('button', { name: 'sync' }))
    await expect.poll(() => items().filter((item) => item.dataset.state === 'open').length).toBe(1)
    const item = items()[0]

    expect(item.querySelector('[data-slot="toast-close"]')).toBeNull()
    expect(getComputedStyle(item).cursor).toBe('default')

    await userEvent.click(item)
    await soak(300)

    expect(items()).toHaveLength(1)
  })
})

const Saving = ({ outcome }: { outcome: 'resolve' | 'reject' }) => {
  const toast = useToast()

  const run = () => {
    const task = new Promise<string>((resolve, reject) => setTimeout(() => (outcome === 'resolve' ? resolve('ok') : reject(new Error('offline'))), 1500))

    toast.promise(task, { loading: 'Saving', success: 'Saved', error: 'Could not save' }).catch(() => undefined)
  }

  return <button onClick={run}>save</button>
}

describe('a toast that follows a promise in a real browser', () => {
  const state = () => items()[0]?.dataset.type

  it('goes from loading to success in the same place, with the countdown starting then', async () => {
    renderInBrowser(<Saving outcome="resolve" />, 'auto')
    await userEvent.click(page.getByRole('button', { name: 'save' }))
    await expect.poll(() => items().filter((item) => item.dataset.state === 'open').length).toBe(1)
    await expect.poll(() => items().every((item) => isSettled(item))).toBe(true)
    const before = items()[0].getBoundingClientRect()
    const loadingBackground = getComputedStyle(items()[0]).backgroundColor

    expect(state()).toBe('info')
    expect(part('progress') ?? null).toBeNull()

    await expect.poll(() => state(), { timeout: 4000 }).toBe('success')
    await expect.poll(() => items().every((item) => isSettled(item))).toBe(true)
    const after = items()[0].getBoundingClientRect()

    expect(itemWith('Saved')).toBeDefined()
    expect(Math.abs(after.top - before.top)).toBeLessThan(1)
    expect(getComputedStyle(items()[0]).backgroundColor).not.toBe(loadingBackground)
    expect(part('progress').getAnimations().some((animation) => animation.playState === 'running')).toBe(true)
  })

  it('goes from loading to error when the promise rejects', async () => {
    renderInBrowser(<Saving outcome="reject" />, 'auto')
    await userEvent.click(page.getByRole('button', { name: 'save' }))

    await expect.poll(() => state(), { timeout: 4000 }).toBe('error')

    expect(itemWith('Could not save')).toBeDefined()
    await expect.poll(() => document.querySelector('[data-slot="toast-host"] [role="alert"]')?.textContent).toBe('Could not save')
  })
})
