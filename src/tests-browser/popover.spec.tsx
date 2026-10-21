import { useState } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { Popover } from '@components/common/Popover/index.tsx'
import { Modal } from '@components/common/Modal/index.tsx'
import UIProvider from '@components/uiProvider/index.tsx'
import { ptBR } from '@locales/ptBR.ts'
import { renderInBrowser } from './harness.tsx'
import { setReducedMotion } from './media.ts'

import type { CSSProperties, ReactNode } from 'react'

const content = () => document.body.querySelector<HTMLElement>('[data-slot="popover-content"]')

const body = () => document.body.querySelector<HTMLElement>('[data-slot="popover-body"]')

const added: HTMLStyleElement[] = []

afterEach(async () => {
  added.splice(0).forEach((style) => style.remove())
  await setReducedMotion('no-preference')
  await page.viewport(1280, 800)
})

const placed = (css: string, children: ReactNode) => <div style={{ position: 'absolute', ...parse(css) }}>{children}</div>

const parse = (css: string) => Object.fromEntries(css.split(';').filter(Boolean).map((rule) => rule.split(':').map((part) => part.trim()))) as CSSProperties

describe('Popover placement in a real browser', () => {
  it('opens below the trigger and clear of it', async () => {
    renderInBrowser(
      placed('top: 200px; left: 400px', (
        <Popover content={<p style={{ width: 160 }}>Conteúdo</p>}>
          <button>Abrir</button>
        </Popover>
      ))
    )
    await userEvent.click(page.getByRole('button', { name: 'Abrir' }))
    await expect.poll(content).toBeTruthy()
    const trigger = page.getByRole('button', { name: 'Abrir' }).element().getBoundingClientRect()
    const box = (content() as HTMLElement).getBoundingClientRect()

    expect(content()).toHaveAttribute('data-placement', 'bottom')
    expect(box.top).toBeGreaterThanOrEqual(trigger.bottom)
  })

  it('flips to the top when there is no room below', async () => {
    await page.viewport(1280, 400)
    renderInBrowser(
      placed('top: 330px; left: 400px', (
        <Popover placement="bottom" content={<p style={{ width: 160, height: 120 }}>Conteúdo</p>}>
          <button>Abrir</button>
        </Popover>
      ))
    )
    await userEvent.click(page.getByRole('button', { name: 'Abrir' }))
    await expect.poll(content).toBeTruthy()

    expect(content()).toHaveAttribute('data-placement', 'top')
  })

  it('shifts along the edge so a wide popover stays inside the window', async () => {
    renderInBrowser(
      placed('top: 100px; right: 0', (
        <Popover content={<p style={{ width: 320 }}>Conteúdo largo</p>}>
          <button>Abrir</button>
        </Popover>
      ))
    )
    await userEvent.click(page.getByRole('button', { name: 'Abrir' }))
    await expect.poll(content).toBeTruthy()

    await expect.poll(() => (content() as HTMLElement).getBoundingClientRect().right).toBeLessThanOrEqual(document.documentElement.clientWidth - 7.5)
  })

  it('follows the trigger when an ancestor scrolls', async () => {
    renderInBrowser(
      <div data-testid="scroller" style={{ position: 'absolute', top: 20, left: 20, width: 400, height: 300, overflow: 'auto' }}>
        <div style={{ height: 120 }} />
        <Popover defaultOpen content={<p style={{ width: 140 }}>Conteúdo</p>}>
          <button>Abrir</button>
        </Popover>
        <div style={{ height: 900 }} />
      </div>
    )
    await expect.poll(content).toBeTruthy()
    const before = (content() as HTMLElement).getBoundingClientRect().top
    page.getByTestId('scroller').element().scrollTop = 50

    await expect.poll(() => (content() as HTMLElement).getBoundingClientRect().top).toBeCloseTo(before - 50, 0)
  })

  it('hides the popover when the trigger scrolls out of its clipping ancestor', async () => {
    renderInBrowser(
      <div data-testid="scroller" style={{ position: 'absolute', top: 20, left: 20, width: 400, height: 200, overflow: 'auto' }}>
        <Popover defaultOpen content={<p style={{ width: 140 }}>Conteúdo</p>}>
          <button>Abrir</button>
        </Popover>
        <div style={{ height: 1200 }} />
      </div>
    )
    await expect.poll(content).toBeTruthy()
    page.getByTestId('scroller').element().scrollTop = 600

    await expect.poll(() => content()?.hasAttribute('data-reference-hidden')).toBe(true)
  })

  it('maps start to the right of the trigger in right to left', async () => {
    renderInBrowser(
      <div dir="rtl">
        <UIProvider locale={{ ...ptBR, dir: 'rtl' }}>
          {placed('top: 300px; left: 500px', (
            <Popover placement="start" content={<p style={{ width: 120 }}>Conteúdo</p>}>
              <button>Abrir</button>
            </Popover>
          ))}
        </UIProvider>
      </div>
    )
    await userEvent.click(page.getByRole('button', { name: 'Abrir' }))
    await expect.poll(content).toBeTruthy()

    expect(content()).toHaveAttribute('data-placement', 'right')
    expect(content()).toHaveAttribute('dir', 'rtl')
  })

  it('shrinks to the available height and scrolls inside', async () => {
    await page.viewport(1280, 400)
    renderInBrowser(
      placed('top: 150px; left: 400px', (
        <Popover content={<div style={{ width: 200, height: 900 }}>Conteúdo alto</div>}>
          <button>Abrir</button>
        </Popover>
      ))
    )
    await userEvent.click(page.getByRole('button', { name: 'Abrir' }))
    await expect.poll(content).toBeTruthy()

    await expect.poll(() => (content() as HTMLElement).getBoundingClientRect().bottom).toBeLessThan(400)

    expect(getComputedStyle(body() as HTMLElement).overflowY).toBe('auto')
    expect((body() as HTMLElement).scrollHeight).toBeGreaterThan((body() as HTMLElement).clientHeight)
    expect(getComputedStyle(content() as HTMLElement).overflowY).toBe('visible')
  })

  it('shrinks to the available width', async () => {
    await page.viewport(600, 400)
    renderInBrowser(
      placed('top: 150px; left: 100px', (
        <Popover content={<div style={{ width: 2000, height: 40 }}>Conteúdo largo</div>}>
          <button>Abrir</button>
        </Popover>
      ))
    )
    await userEvent.click(page.getByRole('button', { name: 'Abrir' }))
    await expect.poll(content).toBeTruthy()

    await expect.poll(() => (content() as HTMLElement).getBoundingClientRect().width).toBeLessThan(600)

    const box = (content() as HTMLElement).getBoundingClientRect()

    expect([box.left >= 0, box.right <= document.documentElement.clientWidth]).toEqual([true, true])
  })
})

describe('Popover focus and dismissal in a real browser', () => {
  it('moves the focus into the content when opened by keyboard and returns it on Escape', async () => {
    renderInBrowser(
      placed('top: 200px; left: 400px', (
        <Popover content={<button>Dentro</button>}>
          <button>Abrir</button>
        </Popover>
      ))
    )
    page.getByRole('button', { name: 'Abrir' }).element().focus()
    await userEvent.keyboard('{Enter}')

    await expect.poll(() => document.activeElement?.textContent).toBe('Dentro')

    await userEvent.keyboard('{Escape}')

    await expect.poll(content).toBeNull()
    expect(document.activeElement?.textContent).toBe('Abrir')
  })

  it('closes on a click outside without taking the focus back', async () => {
    renderInBrowser(
      <div>
        <input aria-label="Campo" />
        {placed('top: 200px; left: 400px', (
          <Popover content={<button>Dentro</button>}>
            <button>Abrir</button>
          </Popover>
        ))}
      </div>
    )
    await userEvent.click(page.getByRole('button', { name: 'Abrir' }))
    await expect.poll(content).toBeTruthy()
    await userEvent.click(page.getByLabelText('Campo'))

    await expect.poll(content).toBeNull()
    expect(document.activeElement).toBe(page.getByLabelText('Campo').element())
  })

  it('leaves Tab through the last element to the element after the trigger', async () => {
    renderInBrowser(
      <div>
        {placed('top: 200px; left: 400px', (
          <Popover content={<button>Dentro</button>}>
            <button>Abrir</button>
          </Popover>
        ))}
        {placed('top: 260px; left: 400px', <button>Depois</button>)}
      </div>
    )
    page.getByRole('button', { name: 'Abrir' }).element().focus()
    await userEvent.keyboard('{Enter}')
    await expect.poll(() => document.activeElement?.textContent).toBe('Dentro')
    await userEvent.keyboard('{Tab}')

    await expect.poll(() => document.activeElement?.textContent).toBe('Depois')
    await expect.poll(content).toBeNull()
  })

  it('sends Tab on the trigger into an open popover and Shift+Tab on its first element back to the trigger', async () => {
    renderInBrowser(
      placed('top: 200px; left: 400px', (
        <Popover content={<button>Dentro</button>}>
          <button>Abrir</button>
        </Popover>
      ))
    )
    await userEvent.click(page.getByRole('button', { name: 'Abrir' }))
    await expect.poll(content).toBeTruthy()
    await userEvent.keyboard('{Tab}')

    await expect.poll(() => document.activeElement?.textContent).toBe('Dentro')

    await userEvent.keyboard('{Shift>}{Tab}{/Shift}')

    await expect.poll(() => document.activeElement?.textContent).toBe('Abrir')
    expect(content()).toBeTruthy()
  })

  it('moves the focus to the body when there is nothing to tab to and lets the keys scroll it instead of the page', async () => {
    await page.viewport(1280, 400)
    renderInBrowser(
      <>
        {placed('top: 150px; left: 400px', (
          <Popover content={<p style={{ width: 200 }}>{'texto '.repeat(600)}</p>}>
            <button>Abrir</button>
          </Popover>
        ))}
        <div style={{ height: 3000 }} />
      </>
    )
    page.getByRole('button', { name: 'Abrir' }).element().focus()
    await userEvent.keyboard('{Enter}')

    await expect.poll(() => document.activeElement?.getAttribute('data-slot')).toBe('popover-body')

    await userEvent.keyboard('{PageDown}')

    await expect.poll(() => (body() as HTMLElement).scrollTop).toBeGreaterThan(0)
    expect(window.scrollY).toBe(0)
  })

  it('lets the keys scroll the content after a click inside it instead of the page behind', async () => {
    await page.viewport(1280, 400)
    renderInBrowser(
      <>
        {placed('top: 150px; left: 400px', (
          <Popover defaultOpen content={<p style={{ width: 200 }}>{'texto '.repeat(600)}</p>}>
            <button>Abrir</button>
          </Popover>
        ))}
        <div style={{ height: 3000 }} />
      </>
    )
    await expect.poll(body).toBeTruthy()
    await page.elementLocator(body() as HTMLElement).click({ position: { x: 8, y: 8 } })
    await userEvent.keyboard('{PageDown}')

    await expect.poll(() => (body() as HTMLElement).scrollTop).toBeGreaterThan(0)
    expect(window.scrollY).toBe(0)
  })

  it('takes Tab from the body to the element after the trigger when there is nothing to tab to', async () => {
    renderInBrowser(
      <div>
        {placed('top: 200px; left: 400px', (
          <Popover content={<p>Só texto</p>}>
            <button>Abrir</button>
          </Popover>
        ))}
        {placed('top: 260px; left: 400px', <button>Depois</button>)}
      </div>
    )
    page.getByRole('button', { name: 'Abrir' }).element().focus()
    await userEvent.keyboard('{Enter}')
    await expect.poll(() => document.activeElement?.getAttribute('data-slot')).toBe('popover-body')
    await userEvent.keyboard('{Tab}')

    await expect.poll(() => document.activeElement?.textContent).toBe('Depois')
    await expect.poll(content).toBeNull()
  })

  it('takes Shift+Tab from the body back to the trigger and keeps the popover open when there is nothing to tab to', async () => {
    renderInBrowser(
      placed('top: 200px; left: 400px', (
        <Popover content={<p>Só texto</p>}>
          <button>Abrir</button>
        </Popover>
      ))
    )
    page.getByRole('button', { name: 'Abrir' }).element().focus()
    await userEvent.keyboard('{Enter}')
    await expect.poll(() => document.activeElement?.getAttribute('data-slot')).toBe('popover-body')
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}')

    await expect.poll(() => document.activeElement?.textContent).toBe('Abrir')
    expect(content()).toBeTruthy()
  })

  it('closes only the popover with Escape and then the modal, when the popover is open over the modal', async () => {
    const Host = () => {
      const [open, setOpen] = useState(true)

      return (
        <Modal isOpen={open} onClose={() => setOpen(false)} title="Modal">
          <Popover content={<button>Dentro</button>}>
            <button>Abrir</button>
          </Popover>
        </Modal>
      )
    }
    renderInBrowser(<Host />)
    await userEvent.click(page.getByRole('button', { name: 'Abrir' }))
    await expect.poll(content).toBeTruthy()
    await userEvent.keyboard('{Escape}')

    await expect.poll(content).toBeNull()
    expect(page.getByRole('dialog', { name: 'Modal' }).element()).toBeTruthy()

    await userEvent.keyboard('{Escape}')

    await expect.poll(() => document.querySelector('[data-slot="modal-panel"]')).toBeNull()
  })

  it('closes only the popover when the click lands on the modal backdrop, and then the modal on the next one', async () => {
    const Host = () => {
      const [open, setOpen] = useState(true)

      return (
        <Modal isOpen={open} onClose={() => setOpen(false)} title="Modal">
          <Popover content={<button>Dentro</button>}>
            <button>Abrir</button>
          </Popover>
        </Modal>
      )
    }
    renderInBrowser(<Host />)
    await userEvent.click(page.getByRole('button', { name: 'Abrir' }))
    await expect.poll(content).toBeTruthy()
    const backdrop = document.querySelector('[data-slot="modal-overlay"]') as HTMLElement
    await page.elementLocator(backdrop).click({ position: { x: 4, y: 4 } })

    await expect.poll(content).toBeNull()
    expect(document.querySelector('[data-slot="modal-panel"]')).toBeTruthy()

    await page.elementLocator(backdrop).click({ position: { x: 4, y: 4 } })

    await expect.poll(() => document.querySelector('[data-slot="modal-panel"]')).toBeNull()
  })

  it('stays open while Escape closes the modal that was opened from it', async () => {
    const Host = () => {
      const [modal, setModal] = useState(false)

      return (
        <>
          <Popover content={<button onClick={() => setModal(true)}>Abrir modal</button>}>
            <button>Abrir</button>
          </Popover>
          <Modal isOpen={modal} onClose={() => setModal(false)} title="Aberto">
            <p>Conteúdo</p>
          </Modal>
        </>
      )
    }
    renderInBrowser(<Host />)
    await userEvent.click(page.getByRole('button', { name: 'Abrir' }))
    await userEvent.click(page.getByRole('button', { name: 'Abrir modal' }))
    await expect.poll(() => document.querySelector('[data-slot="modal-panel"]')).toBeTruthy()
    await userEvent.keyboard('{Escape}')

    await expect.poll(() => document.querySelector('[data-slot="modal-panel"]')).toBeNull()
    expect(content()).toBeTruthy()
  })

  it('is not inert while the page behind the modal is', async () => {
    renderInBrowser(
      <Modal isOpen onClose={() => undefined} title="Modal">
        <Popover content={<button>Dentro</button>}>
          <button>Abrir</button>
        </Popover>
      </Modal>
    )
    await userEvent.click(page.getByRole('button', { name: 'Abrir' }))
    await expect.poll(content).toBeTruthy()

    expect((content() as HTMLElement).closest('[inert]')).toBeNull()
    expect(page.getByRole('button', { name: 'Dentro' }).element()).toBeTruthy()
  })
})

describe('Popover customization and motion in a real browser', () => {
  it('lets the class of the user win on the layout without a global reset', async () => {
    const style = document.createElement('style')
    style.textContent = '.mine { padding-inline: 33px; border-radius: 3px; background-color: rgb(10, 20, 30); }'
    document.head.prepend(style)
    added.push(style)
    renderInBrowser(
      placed('top: 200px; left: 400px', (
        <Popover defaultOpen contentClassName="mine" content={<p>Conteúdo</p>}>
          <button>Abrir</button>
        </Popover>
      ))
    )
    await expect.poll(content).toBeTruthy()
    const computed = getComputedStyle(content() as HTMLElement)

    expect(computed.paddingInlineStart).toBe('33px')
    expect(computed.borderTopLeftRadius).toBe('3px')
  })

  it('animates from the placement origin with opacity and scale and ends fully open', async () => {
    renderInBrowser(
      placed('top: 200px; left: 400px', (
        <Popover content={<p>Conteúdo</p>}>
          <button>Abrir</button>
        </Popover>
      )),
      'auto'
    )
    await userEvent.click(page.getByRole('button', { name: 'Abrir' }))
    await expect.poll(content).toBeTruthy()
    await expect.poll(() => (content() as HTMLElement).dataset.state).toBe('open')
    await expect.poll(() => getComputedStyle(content() as HTMLElement).opacity).toBe('1')

    expect(getComputedStyle(content() as HTMLElement).transformOrigin.split(' ')[1]).toBe('0px')
  })

  it('keeps the dialog mounted while it leaves and removes it afterwards', async () => {
    renderInBrowser(
      placed('top: 200px; left: 400px', (
        <Popover content={<p>Conteúdo</p>}>
          <button>Abrir</button>
        </Popover>
      )),
      'auto'
    )
    await userEvent.click(page.getByRole('button', { name: 'Abrir' }))
    await expect.poll(() => (content() as HTMLElement | null)?.dataset.state).toBe('open')
    await userEvent.keyboard('{Escape}')

    await expect.poll(content).toBeNull()
  })

  it('drops the movement and keeps the fade under reduced motion', async () => {
    await setReducedMotion('reduce')
    renderInBrowser(
      placed('top: 200px; left: 400px', (
        <Popover content={<p>Conteúdo</p>}>
          <button>Abrir</button>
        </Popover>
      )),
      'auto'
    )
    await userEvent.click(page.getByRole('button', { name: 'Abrir' }))
    await expect.poll(content).toBeTruthy()
    const style = getComputedStyle(content() as HTMLElement)

    expect(style.transitionProperty).toBe('opacity')
    expect(style.transform === 'none' || style.transform === 'matrix(1, 0, 0, 1, 0, 0)').toBe(true)
  })

  it('shows an arrow pointing at the trigger on the opposite edge of the placement', async () => {
    renderInBrowser(
      placed('top: 200px; left: 400px', (
        <Popover defaultOpen arrow content={<p style={{ width: 160 }}>Conteúdo</p>}>
          <button>Abrir</button>
        </Popover>
      ))
    )
    await expect.poll(content).toBeTruthy()
    const arrow = (content() as HTMLElement).querySelector('[data-slot="popover-arrow"]') as HTMLElement
    const trigger = page.getByRole('button', { name: 'Abrir' }).element().getBoundingClientRect()

    await expect.poll(() => arrow.getBoundingClientRect().left + arrow.getBoundingClientRect().width / 2).toBeCloseTo(trigger.left + trigger.width / 2, 0)
    expect(arrow.getBoundingClientRect().top).toBeLessThan((content() as HTMLElement).getBoundingClientRect().top + 8)
  })
})
