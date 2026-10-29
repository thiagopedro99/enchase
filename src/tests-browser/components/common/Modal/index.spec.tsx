import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { Modal } from '@components/common/Modal/index.tsx'
import Layout from '@components/layout/index.tsx'
import { demoSections } from '@tests/shared/fixtures/layoutBranding.tsx'
import { renderInBrowser } from '../../../support/harness.tsx'

const ModalPage = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)}>Abrir</button>
      <main>
        <button>Atrás</button>
        <div style={{ height: 3000 }}>Conteúdo longo</div>
      </main>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Título" footer={<button>Salvar</button>}>
        <input aria-label="Nome" />
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
