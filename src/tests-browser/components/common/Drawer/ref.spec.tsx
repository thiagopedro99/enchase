import { createRef, useState } from 'react'
import { describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { Drawer } from '@components/common/Drawer/index.tsx'
import { renderInBrowser } from '../../../support/harness.tsx'

import type { RefObject } from 'react'

const DrawerPage = ({ target }: { target: RefObject<HTMLDivElement | null> }) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)}>Abrir</button>
      <main>
        <button>Atrás</button>
      </main>
      <Drawer ref={target} title="Filtros" open={open} onClose={() => setOpen(false)}>
        <input aria-label="Nome" />
      </Drawer>
    </>
  )
}

describe('the ref of the Drawer in a real browser', () => {
  it('holds the open panel, with the focus inside and the page inert, and is null once the exit animation ends', async () => {
    const target = createRef<HTMLDivElement>()
    renderInBrowser(<DrawerPage target={target} />, 'auto')

    expect(target.current).toBeNull()

    await userEvent.click(page.getByRole('button', { name: 'Abrir' }))
    await expect.element(page.getByRole('dialog')).toBeVisible()

    expect(target.current).toBe(page.getByRole('dialog').element())
    expect(target.current?.contains(document.activeElement)).toBe(true)
    expect(page.getByRole('button', { name: 'Atrás', includeHidden: true }).element().closest('[inert]')).not.toBeNull()

    await userEvent.keyboard('{Escape}')

    await expect.poll(() => target.current, { timeout: 4000 }).toBeNull()
    expect(document.querySelector('[data-slot="drawer-panel"]')).toBeNull()
    await expect.poll(() => document.querySelector('[inert]')).toBeNull()
  })
})
