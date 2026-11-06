import { createRef, useState } from 'react'
import { describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { Modal } from '@components/common/Modal/index.tsx'
import { renderInBrowser } from '../../../support/harness.tsx'

import type { RefObject } from 'react'

const ModalPage = ({ target }: { target: RefObject<HTMLDivElement | null> }) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)}>Abrir</button>
      <main>
        <button>Atrás</button>
      </main>
      <Modal ref={target} title="Título" isOpen={open} onClose={() => setOpen(false)}>
        <input aria-label="Nome" />
      </Modal>
    </>
  )
}

describe('the ref of the Modal in a real browser', () => {
  it('holds the open panel, with the focus inside and the page inert, and is null once the exit animation ends', async () => {
    const target = createRef<HTMLDivElement>()
    renderInBrowser(<ModalPage target={target} />, 'auto')

    expect(target.current).toBeNull()

    await userEvent.click(page.getByRole('button', { name: 'Abrir' }))
    await expect.element(page.getByRole('dialog')).toBeVisible()

    expect(target.current).toBe(page.getByRole('dialog').element())
    expect(target.current?.contains(document.activeElement)).toBe(true)
    expect(page.getByRole('button', { name: 'Atrás', includeHidden: true }).element().closest('[inert]')).not.toBeNull()

    await userEvent.keyboard('{Escape}')

    await expect.poll(() => target.current, { timeout: 4000 }).toBeNull()
    expect(document.querySelector('[data-slot="modal-panel"]')).toBeNull()
    await expect.poll(() => document.querySelector('[inert]')).toBeNull()
  })
})
