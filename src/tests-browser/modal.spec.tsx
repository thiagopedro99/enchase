import { useState } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp, page, userEvent } from 'vitest/browser'

import { Modal } from '@components/common/Modal/index.tsx'
import { renderInBrowser } from './harness.tsx'

import type { MotionOverride } from '@motion/types.ts'

const panel = () => document.querySelector<HTMLElement>('[data-slot="modal-panel"]')

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const setReducedMotion = (value: 'reduce' | 'no-preference') => cdp().send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value }] })

const Page = ({ className, animation }: { className?: string; animation?: MotionOverride }) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)}>Abrir</button>
      <button onClick={() => setOpen(false)}>Fechar fora</button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Título" className={className} animation={animation}>
        <p>Corpo</p>
      </Modal>
    </>
  )
}

const slow: MotionOverride = { tuning: { duration: 0.6 } }

afterEach(async () => {
  await setReducedMotion('no-preference')
})

describe('Modal motion in a real browser', () => {
  it('lets the className of the user win over the styles of the lib', async () => {
    const style = document.createElement('style')
    style.textContent = '.minha-classe { background-color: rgb(10, 20, 30); }'
    document.head.appendChild(style)
    renderInBrowser(<Page className="minha-classe" />, 'auto')
    await userEvent.click(page.getByRole('button', { name: 'Abrir' }))
    await expect.element(page.getByRole('dialog')).toBeVisible()

    expect(getComputedStyle(panel() as HTMLElement).backgroundColor).toBe('rgb(10, 20, 30)')
    style.remove()
  })

  it('reaches full opacity after entering', async () => {
    renderInBrowser(<Page />, 'auto')
    await userEvent.click(page.getByRole('button', { name: 'Abrir' }))
    await expect.element(page.getByRole('dialog')).toBeVisible()
    await wait(500)

    expect(panel()?.getAttribute('data-state')).toBe('open')
    expect(getComputedStyle(panel() as HTMLElement).opacity).toBe('1')
  })

  it('keeps the dialog mounted while the exit runs and removes it afterwards', async () => {
    renderInBrowser(<Page animation={slow} />, 'auto')
    await userEvent.click(page.getByRole('button', { name: 'Abrir' }))
    await expect.element(page.getByRole('dialog')).toBeVisible()
    await wait(800)

    await userEvent.keyboard('{Escape}')
    await wait(60)

    expect(panel()).not.toBeNull()
    expect(panel()?.getAttribute('data-state')).toBe('exiting')

    await expect.poll(() => panel(), { timeout: 2000 }).toBeNull()
  })

  it('reopens in the middle of the exit and ends fully open', async () => {
    renderInBrowser(<Page animation={slow} />, 'auto')
    await userEvent.click(page.getByRole('button', { name: 'Abrir' }))
    await expect.element(page.getByRole('dialog')).toBeVisible()
    await wait(800)

    await userEvent.keyboard('{Escape}')
    await wait(80)
    expect(panel()?.getAttribute('data-state')).toBe('exiting')
    ;(document.querySelector('button') as HTMLButtonElement).click()
    await wait(1200)

    expect(document.querySelectorAll('[data-slot="modal-panel"]')).toHaveLength(1)
    expect(panel()?.getAttribute('data-state')).toBe('open')
    expect(getComputedStyle(panel() as HTMLElement).opacity).toBe('1')
  })

  it('under reduced motion shows no movement but still fades', async () => {
    await setReducedMotion('reduce')
    renderInBrowser(<Page animation={slow} />, 'auto')
    await userEvent.click(page.getByRole('button', { name: 'Abrir' }))
    await expect.element(page.getByRole('dialog')).toBeVisible()

    const style = getComputedStyle(panel() as HTMLElement)

    expect(style.transitionProperty).toBe('opacity')
    expect(parseFloat(style.transitionDuration)).toBeGreaterThan(0.01)
    expect(['none', 'matrix(1, 0, 0, 1, 0, 0)']).toContain(style.transform)

    const transforms = new Set<string>()
    const sample = new MutationObserver(() => {
      const current = panel()
      if (current) transforms.add(getComputedStyle(current).transform)
    })
    sample.observe(document.body, { attributes: true, childList: true, subtree: true })

    await userEvent.keyboard('{Escape}')
    await expect.poll(() => panel(), { timeout: 3000 }).toBeNull()
    sample.disconnect()

    for (const transform of transforms) expect(['none', 'matrix(1, 0, 0, 1, 0, 0)']).toContain(transform)
  })

  it('centers the panel horizontally and vertically without physical offsets', async () => {
    renderInBrowser(<Page />, 'auto')
    await userEvent.click(page.getByRole('button', { name: 'Abrir' }))
    await expect.element(page.getByRole('dialog')).toBeVisible()
    await wait(500)
    const box = (panel() as HTMLElement).getBoundingClientRect()
    const overlay = (document.querySelector('[data-slot="modal-overlay"]') as HTMLElement).getBoundingClientRect()

    expect(Math.abs(box.left + box.width / 2 - (overlay.left + overlay.width / 2))).toBeLessThan(2)
    expect(Math.abs(box.top + box.height / 2 - (overlay.top + overlay.height / 2))).toBeLessThan(2)
  })

  it('stays centered in right to left', async () => {
    document.documentElement.dir = 'rtl'
    renderInBrowser(<Page />, 'auto')
    await userEvent.click(page.getByRole('button', { name: 'Abrir' }))
    await expect.element(page.getByRole('dialog')).toBeVisible()
    await wait(500)
    const box = (panel() as HTMLElement).getBoundingClientRect()
    const overlay = (document.querySelector('[data-slot="modal-overlay"]') as HTMLElement).getBoundingClientRect()

    expect(Math.abs(box.left + box.width / 2 - (overlay.left + overlay.width / 2))).toBeLessThan(2)
    document.documentElement.dir = 'ltr'
  })
})
