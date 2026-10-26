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
