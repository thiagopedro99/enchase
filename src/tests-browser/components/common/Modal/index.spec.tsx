import { page, userEvent } from 'vitest/browser'
import { describe, expect, it } from 'vitest'
import { useState } from 'react'

import { demoSections } from '@tests/shared/fixtures/layoutBranding.tsx'
import { accessibilityViolations } from '../../../support/axe.ts'
import { renderInBrowser } from '../../../support/harness.tsx'
import { Button } from '@components/common/Button/index.tsx'
import { Modal } from '@components/common/Modal/index.tsx'
import { part } from '../../../support/hookProbes.ts'
import Layout from '@components/layout/index.tsx'

import type { ModalProps } from '@components/common/Modal/types.ts'

const ModalPage = ({ children = <input aria-label="Nome" />, footer = <button>Salvar</button>, ...props }: Partial<ModalProps>) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)}>Abrir</button>
      <main>
        <button>Atrás</button>
        <div style={{ height: 3000 }}>Conteúdo longo</div>
      </main>
      <Modal title="Título" {...props} footer={footer} isOpen={open} onClose={() => setOpen(false)}>
        {children}
      </Modal>
    </>
  )
}

const dialogOf = () => page.getByRole('dialog').element() as HTMLElement

describe('Modal in a real browser', () => {
  it('moves focus into the dialog and keeps Tab and Shift+Tab inside it', async () => {
    renderInBrowser(<ModalPage />)
    await userEvent.click(page.getByRole('button', { name: 'Abrir' }))
    await expect.element(page.getByRole('dialog')).toBeVisible()

    expect(dialogOf().contains(document.activeElement)).toBe(true)

    for (let round = 0; round < 8; round += 1) {
      await userEvent.tab()
      expect(dialogOf().contains(document.activeElement)).toBe(true)
    }

    for (let round = 0; round < 8; round += 1) {
      await userEvent.tab({ shift: true })
      expect(dialogOf().contains(document.activeElement)).toBe(true)
    }
  })

  it('makes the page behind inert so it cannot be focused or hit', async () => {
    renderInBrowser(<ModalPage />)
    await userEvent.click(page.getByRole('button', { name: 'Abrir' }))
    await expect.element(page.getByRole('dialog')).toBeVisible()

    const behind = page.getByRole('button', { name: 'Atrás', includeHidden: true }).element() as HTMLButtonElement
    const box = behind.getBoundingClientRect()

    expect(behind.closest('[inert]')).not.toBeNull()
    expect(document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2)).not.toBe(behind)
    behind.focus()
    expect(document.activeElement).not.toBe(behind)
  })

  it('locks the page scroll while open and restores it on close', async () => {
    renderInBrowser(<ModalPage />)
    const before = getComputedStyle(document.body).overflow

    await userEvent.click(page.getByRole('button', { name: 'Abrir' }))
    await expect.element(page.getByRole('dialog')).toBeVisible()
    expect(getComputedStyle(document.body).overflow).toBe('hidden')

    await userEvent.keyboard('{Escape}')
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument()
    await expect.poll(() => getComputedStyle(document.body).overflow).toBe(before)
  })

  it('closes with Escape and gives focus back to the trigger', async () => {
    renderInBrowser(<ModalPage />)
    const trigger = page.getByRole('button', { name: 'Abrir' })
    await userEvent.click(trigger)
    await expect.element(page.getByRole('dialog')).toBeVisible()

    await userEvent.keyboard('{Escape}')
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument()

    await expect.poll(() => document.activeElement).toBe(trigger.element())
  })
})

describe('Modal body scrolling with the keyboard in a real browser', () => {
  const longContent = <div style={{ height: 3000 }}>Muito conteúdo</div>

  const save = <Button>Salvar</Button>

  const bodyOf = () => part('modal-body') as HTMLElement

  const semanticsOf = (element: HTMLElement) => element.getAttributeNames().filter((name) => name === 'tabindex' || name === 'role' || name.startsWith('aria-'))

  const ringOf = (element: HTMLElement) => {
    const ring = getComputedStyle(element)

    return { width: ring.outlineWidth, style: ring.outlineStyle, offset: ring.outlineOffset, color: ring.outlineColor }
  }

  const openIt = async () => {
    await userEvent.click(page.getByRole('button', { name: 'Abrir' }))
    await expect.element(page.getByRole('dialog')).toBeVisible()
  }

  it('puts the scrolling body in the tab order, between the close button and the footer, and scrolls it with the keys', async () => {
    renderInBrowser(<ModalPage footer={save}>{longContent}</ModalPage>)
    await openIt()

    const body = bodyOf()

    expect(body.scrollHeight).toBeGreaterThan(body.clientHeight)
    await expect.poll(() => body.getAttribute('tabindex')).toBe('0')
    expect(page.getByRole('region', { name: 'Título' }).element()).toBe(body)
    expect(document.activeElement).toBe(part('modal-close'))

    await userEvent.tab()
    expect(document.activeElement).toBe(body)

    await userEvent.keyboard('{PageDown}')
    await expect.poll(() => body.scrollTop).toBeGreaterThan(0)

    await userEvent.keyboard('{End}')
    await expect.poll(() => Math.round(body.scrollTop + body.clientHeight)).toBe(body.scrollHeight)

    await userEvent.keyboard('{Home}')
    await expect.poll(() => body.scrollTop).toBe(0)

    await userEvent.tab()
    expect(document.activeElement).toBe(page.getByRole('button', { name: 'Salvar' }).element())
    await userEvent.tab()
    expect(document.activeElement).toBe(part('modal-close'))
    await userEvent.tab({ shift: true })
    expect(document.activeElement).toBe(page.getByRole('button', { name: 'Salvar' }).element())
    await userEvent.tab({ shift: true })
    expect(document.activeElement).toBe(body)
  })

  it('names the scrolling body with the aria label when the modal has no title', async () => {
    renderInBrowser(
      <ModalPage title={undefined} ariaLabel="Termos">
        {longContent}
      </ModalPage>
    )
    await openIt()

    await expect.poll(() => bodyOf().getAttribute('tabindex')).toBe('0')
    expect(page.getByRole('region', { name: 'Termos' }).element()).toBe(bodyOf())
  })

  it('draws the focus ring of the library inside the body', async () => {
    renderInBrowser(<ModalPage>{longContent}</ModalPage>)
    await openIt()
    await expect.poll(() => bodyOf().getAttribute('tabindex')).toBe('0')
    await userEvent.tab()

    expect(document.activeElement).toBe(bodyOf())
    expect(ringOf(bodyOf())).toEqual({ width: '2px', style: 'solid', offset: '-2px', color: 'rgb(79, 70, 229)' })
  })

  it('keeps a body that fits out of the tab order, without a role or a label', async () => {
    renderInBrowser(<ModalPage footer={save}>Pouco conteúdo</ModalPage>)
    await openIt()

    expect(bodyOf().scrollHeight).toBeLessThanOrEqual(bodyOf().clientHeight)
    expect(semanticsOf(bodyOf())).toEqual([])

    const stops: Array<string | null | undefined> = []

    for (let round = 0; round < 4; round += 1) {
      await userEvent.tab()
      stops.push(document.activeElement?.getAttribute('data-slot'))
    }

    expect(stops).toEqual(['button', 'modal-close', 'button', 'modal-close'])
  })

  it('becomes reachable when a short screen makes the body scroll, and leaves the tab order when the screen grows back', async () => {
    renderInBrowser(
      <ModalPage footer={save}>
        <div style={{ height: 300 }}>Conteúdo médio</div>
      </ModalPage>
    )
    await openIt()

    expect(semanticsOf(bodyOf())).toEqual([])

    await page.viewport(1280, 300)
    await expect.poll(() => bodyOf().getAttribute('tabindex')).toBe('0')
    expect(page.getByRole('region', { name: 'Título' }).element()).toBe(bodyOf())

    await page.viewport(1280, 800)
    await expect.poll(() => semanticsOf(bodyOf())).toEqual([])
  })

  it('closes with Escape while the body has the focus and gives the focus back to the trigger', async () => {
    renderInBrowser(<ModalPage>{longContent}</ModalPage>)
    const trigger = page.getByRole('button', { name: 'Abrir' })

    await openIt()
    await expect.poll(() => bodyOf().getAttribute('tabindex')).toBe('0')
    await userEvent.tab()
    expect(document.activeElement).toBe(bodyOf())

    await userEvent.keyboard('{Escape}')
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument()
    await expect.poll(() => document.activeElement).toBe(trigger.element())
  })

  it.each([
    ['light', 'scrolls', longContent],
    ['dark', 'scrolls', longContent],
    ['light', 'fits', 'Pouco conteúdo'],
    ['dark', 'fits', 'Pouco conteúdo']
  ] as const)('has no axe violation in the %s mode when the body %s', async (mode, state, content) => {
    renderInBrowser(<ModalPage footer={save}>{content}</ModalPage>, 'never', mode)
    await openIt()
    await expect.poll(() => bodyOf().hasAttribute('tabindex')).toBe(state === 'scrolls')

    expect(await accessibilityViolations(page.getByRole('dialog').element())).toEqual([])
  })
})

describe('Layout drawer in a real browser', () => {
  const layout = () => (
    <Layout pageTitle="Teste" navigationSections={demoSections}>
      <button>Conteúdo</button>
    </Layout>
  )

  it('opens the drawer from the menu button, traps focus and returns it on Escape', async () => {
    await page.viewport(600, 800)
    renderInBrowser(layout())
    const menu = page.getByRole('button', { name: 'Abrir menu' })
    await userEvent.click(menu)
    await expect.element(page.getByRole('dialog')).toBeVisible()

    expect(dialogOf().contains(document.activeElement)).toBe(true)
    for (let round = 0; round < 6; round += 1) {
      await userEvent.tab()
      expect(dialogOf().contains(document.activeElement)).toBe(true)
    }

    await userEvent.keyboard('{Escape}')
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument()
    await expect.poll(() => document.activeElement).toBe(menu.element())
  })
})
