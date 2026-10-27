import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { Loading } from '@components/common/Loading/index.tsx'
import { Tooltip } from '@components/common/Tooltip/index.tsx'
import { Popover } from '@components/common/Popover/index.tsx'
import { Modal } from '@components/common/Modal/index.tsx'
import { ToastProvider, useToast } from '@components/toast/index.ts'
import { renderInBrowser } from './harness.tsx'

import type { CSSProperties, ReactNode } from 'react'

const island = () => document.querySelector<HTMLElement>('[data-island]') as HTMLElement

const slotOf = (slot: string) => document.querySelector<HTMLElement>(`[data-slot="${slot}"]`) as HTMLElement

const viewport = () => {
  const probe = document.createElement('div')

  probe.style.cssText = 'position: fixed; inset: 0; visibility: hidden; pointer-events: none'
  document.body.append(probe)

  const box = probe.getBoundingClientRect()

  probe.remove()

  return box
}

const buttonNamed = (name: string) => Array.from(document.querySelectorAll('button')).find((button) => button.textContent === name) as HTMLButtonElement

const paint = (token: string, parent: HTMLElement) => {
  const probe = document.createElement('div')

  probe.style.backgroundColor = `var(${token})`
  parent.append(probe)

  const color = getComputedStyle(probe).backgroundColor

  probe.remove()

  return color
}

const Island = ({ inside, style, children }: { inside: boolean; style?: CSSProperties; children: (container: HTMLElement | undefined) => ReactNode }) => {
  const [element, setElement] = useState<HTMLElement | null>(null)

  return (
    <div ref={setElement} data-island="" data-theme="dark" dir="rtl" style={{ padding: '2rem', ...style }}>
      {children(inside && element ? element : undefined)}
    </div>
  )
}

const OpenModal = ({ inside, style }: { inside: boolean; style?: CSSProperties }) => {
  const [open, setOpen] = useState(false)

  return (
    <main>
      <button>Outside</button>
      <Island inside={inside} style={style}>
        {(container) => (
          <>
            <button onClick={() => setOpen(true)}>Open</button>
            <button>Beside</button>
            <Modal isOpen={open} onClose={() => setOpen(false)} title="Inside" container={container}>
              <p>Body</p>
            </Modal>
          </>
        )}
      </Island>
    </main>
  )
}

describe.each([
  ['an island with its own theme', true],
  ['the body', false]
])('Overlays rendered in %s', (_name, inside) => {
  const expected = (token: string) => paint(token, inside ? island() : document.body)

  const where = (element: HTMLElement) => (inside ? island().contains(element) : element.parentElement === document.body)

  it('gives the modal the tokens and the direction of where it renders', async () => {
    renderInBrowser(<OpenModal inside={inside} />)
    await userEvent.click(page.getByRole('button', { name: 'Open' }))
    await expect.element(page.getByRole('dialog')).toBeVisible()
    const panel = slotOf('modal-panel')

    expect(where(slotOf('modal'))).toBe(true)
    expect(getComputedStyle(panel).backgroundColor).toBe(expected('--enchase-color-surface-container-high'))
    expect(getComputedStyle(panel).direction).toBe(inside ? 'rtl' : 'ltr')
  })

  it('gives the popover the tokens of where it renders and keeps it below the trigger', async () => {
    renderInBrowser(
      <Island inside={inside}>
        {(container) => (
          <Popover content={<p>Details</p>} container={container}>
            <button>Trigger</button>
          </Popover>
        )}
      </Island>
    )
    await userEvent.click(page.getByRole('button', { name: 'Trigger' }))
    await expect.poll(() => document.querySelector('[data-slot="popover-content"]')).not.toBeNull()
    const content = slotOf('popover-content')
    const trigger = page.getByRole('button', { name: 'Trigger' }).element().getBoundingClientRect()

    expect(where(content)).toBe(true)
    expect(getComputedStyle(content).backgroundColor).toBe(expected('--enchase-color-surface-container-high'))
    expect(content.getBoundingClientRect().top).toBeGreaterThanOrEqual(trigger.bottom)
    expect(content.getBoundingClientRect().top - trigger.bottom).toBeLessThan(40)
  })

  it('gives the tooltip the tokens of where it renders and keeps it above the trigger', async () => {
    renderInBrowser(
      <Island inside={inside} style={{ paddingBlockStart: '6rem' }}>
        {(container) => (
          <Tooltip text="Hint" openDelay={0} container={container}>
            <button>Trigger</button>
          </Tooltip>
        )}
      </Island>
    )
    await userEvent.hover(page.getByRole('button', { name: 'Trigger' }))
    await expect.poll(() => document.querySelector('[data-slot="tooltip-bubble"]')).not.toBeNull()
    const bubble = slotOf('tooltip-bubble')
    const trigger = page.getByRole('button', { name: 'Trigger' }).element().getBoundingClientRect()

    expect(where(bubble)).toBe(true)
    expect(getComputedStyle(bubble).backgroundColor).toBe(expected('--enchase-color-inverse-surface'))
    expect(bubble.getBoundingClientRect().bottom).toBeLessThanOrEqual(trigger.top)
    expect(trigger.top - bubble.getBoundingClientRect().bottom).toBeLessThan(40)
  })

  it('gives the loading overlay the tokens of where it renders and still covers the viewport', async () => {
    renderInBrowser(
      <Island inside={inside}>{(container) => <Loading overlay text="Saving" container={container} />}</Island>
    )
    await expect.poll(() => document.querySelector('[data-slot="loading-backdrop"]')).not.toBeNull()
    const backdrop = slotOf('loading-backdrop')
    const box = backdrop.getBoundingClientRect()

    expect(where(slotOf('loading'))).toBe(true)
    expect(getComputedStyle(backdrop).backgroundColor).toBe(expected('--enchase-color-overlay'))
    const view = viewport()

    expect([box.left, box.top, box.width, box.height]).toEqual([view.left, view.top, view.width, view.height])
  })
})

describe('A modal rendered in a container', () => {
  it('makes the rest of the page and of the container inert, and gives them back when it closes', async () => {
    renderInBrowser(<OpenModal inside />)
    await userEvent.click(page.getByRole('button', { name: 'Open' }))
    await expect.element(page.getByRole('dialog')).toBeVisible()
    const panel = slotOf('modal-panel')

    expect(panel.closest('[inert]')).toBeNull()
    expect(panel.contains(document.activeElement)).toBe(true)
    expect(buttonNamed('Outside').closest('[inert]')).not.toBeNull()
    expect(buttonNamed('Beside').closest('[inert]')).not.toBeNull()

    await userEvent.keyboard('{Escape}')
    await expect.poll(() => document.querySelector('[data-slot="modal"]')).toBeNull()

    await expect.poll(() => document.querySelectorAll('[inert]').length).toBe(0)
  })

  it('stays centered in the viewport inside a container that clips and scrolls', async () => {
    renderInBrowser(<OpenModal inside style={{ position: 'relative', overflow: 'auto', blockSize: 120 }} />)
    await userEvent.click(page.getByRole('button', { name: 'Open' }))
    await expect.element(page.getByRole('dialog')).toBeVisible()
    const box = slotOf('modal-panel').getBoundingClientRect()

    const view = viewport()

    expect(Math.abs(box.left + box.width / 2 - (view.left + view.width / 2))).toBeLessThan(2)
    expect(Math.abs(box.top + box.height / 2 - (view.top + view.height / 2))).toBeLessThan(2)
  })
})

const ModalThatFires = () => {
  const [open, setOpen] = useState(false)
  const toast = useToast()

  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Over the toast">
        <button onClick={() => toast.info('Saved', 0)}>Fire</button>
      </Modal>
    </>
  )
}

const NestedToasts = () => {
  const [app, setApp] = useState<HTMLElement | null>(null)

  return (
    <main ref={setApp}>
      <button>Beside</button>
      <ToastProvider container={app ?? undefined}>
        <ModalThatFires />
      </ToastProvider>
    </main>
  )
}

describe('A toast host in a container inside the page', () => {
  const app = () => document.querySelector('main') as HTMLElement

  const openAndFire = async () => {
    renderInBrowser(<NestedToasts />)
    await expect.poll(() => app().querySelector('[data-slot="toast-host"]')).not.toBeNull()
    await userEvent.click(page.getByRole('button', { name: 'Open' }))
    await expect.element(page.getByRole('dialog')).toBeVisible()
    await userEvent.click(page.getByRole('button', { name: 'Fire' }))
    await expect.poll(() => app().querySelectorAll('[data-slot="toast"]').length).toBe(1)
  }

  it('renders the notification region inside the container', async () => {
    renderInBrowser(<NestedToasts />)
    await expect.poll(() => app().querySelector('[data-slot="toast-host"]')).not.toBeNull()

    expect(app().querySelector('[data-slot="toast-host"]')?.parentElement).toBe(app())
  })

  it('stays reachable when a modal makes the rest of the page inert', async () => {
    await openAndFire()
    const viewport = app().querySelector('[data-slot="toast-viewport"]') as HTMLElement

    expect(app().closest('[inert]')).toBeNull()
    expect(viewport.closest('[inert]')).toBeNull()
    expect(buttonNamed('Beside').closest('[inert]')).not.toBeNull()
    expect(slotOf('modal-panel').closest('[inert]')).toBeNull()
  })

  it('can be closed with the pointer while the modal is open', async () => {
    await openAndFire()

    await userEvent.click(page.getByRole('button', { name: 'Fechar notificação' }))

    await expect.poll(() => app().querySelectorAll('[data-slot="toast"]').length).toBe(0)
  })

  it('gives the page back when the modal closes', async () => {
    await openAndFire()

    await userEvent.keyboard('{Escape}')
    await expect.poll(() => document.querySelector('[data-slot="modal"]')).toBeNull()

    await expect.poll(() => document.querySelectorAll('[inert]').length).toBe(0)
  })
})

const byQuery = () => document.querySelector<HTMLElement>('[data-island]')

const Fire = () => {
  const toast = useToast()

  return <button onClick={() => toast.info('Saved', 0)}>Fire</button>
}

describe('A container given as a function that finds an element of the same tree', () => {
  it('puts a modal that is open from the first render inside the element', async () => {
    renderInBrowser(
      <div data-island="">
        <Modal isOpen onClose={() => undefined} title="Already open" container={byQuery}>
          <p>Body</p>
        </Modal>
      </div>
    )
    await expect.element(page.getByRole('dialog')).toBeVisible()

    expect(island().contains(slotOf('modal'))).toBe(true)
  })

  it('puts a loading overlay that shows from the first render inside the element', async () => {
    renderInBrowser(
      <div data-island="">
        <Loading overlay text="Saving" container={byQuery} />
      </div>
    )
    await expect.poll(() => document.querySelector('[data-slot="loading"]')).not.toBeNull()

    expect(island().contains(slotOf('loading'))).toBe(true)
  })

  it('puts the toast host inside the element without waiting for the provider to render again', async () => {
    renderInBrowser(
      <div data-island="">
        <ToastProvider container={byQuery}>
          <Fire />
        </ToastProvider>
      </div>
    )
    await expect.poll(() => document.querySelector('[data-slot="toast-host"]')).not.toBeNull()

    expect(slotOf('toast-host').parentElement).toBe(island())

    await userEvent.click(page.getByRole('button', { name: 'Fire' }))
    await expect.poll(() => island().querySelectorAll('[data-slot="toast"]').length).toBe(1)
  })
})
