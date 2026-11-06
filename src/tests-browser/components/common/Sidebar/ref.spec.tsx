import { createRef, useState } from 'react'
import { describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { Sidebar } from '@components/common/Sidebar/index.tsx'
import { demoSections } from '@tests/shared/fixtures/layoutBranding.tsx'
import { renderInBrowser } from '../../../support/harness.tsx'

import type { RefObject } from 'react'

const SidebarPage = ({ target }: { target: RefObject<HTMLDivElement | null> }) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)}>Abrir</button>
      <main>
        <button>Atrás</button>
      </main>
      <Sidebar ref={target} variant="modal" open={open} onClose={() => setOpen(false)} sections={demoSections} />
    </>
  )
}

describe('the ref of the Sidebar in a real browser', () => {
  it('holds the root of the permanent sidebar, which still collapses', async () => {
    const target = createRef<HTMLDivElement>()
    const Permanent = () => {
      const [collapsed, setCollapsed] = useState(false)

      return (
        <>
          <button onClick={() => setCollapsed(!collapsed)}>Alternar</button>
          <Sidebar ref={target} sections={demoSections} collapsed={collapsed} />
        </>
      )
    }
    renderInBrowser(<Permanent />, 'auto')
    const expanded = target.current?.getBoundingClientRect().width as number

    expect(target.current).toBe(document.querySelector('[data-slot="sidebar"]'))

    await userEvent.click(page.getByRole('button', { name: 'Alternar' }))

    await expect.poll(() => target.current?.getAttribute('data-state'), { timeout: 4000 }).toBe('collapsed')
    expect(target.current?.getBoundingClientRect().width).toBeLessThan(expanded)
  })

  it('holds the panel of the modal sidebar while it is open, with the focus inside, and is null once it closes', async () => {
    const target = createRef<HTMLDivElement>()
    renderInBrowser(<SidebarPage target={target} />, 'auto')

    expect(target.current).toBeNull()

    await userEvent.click(page.getByRole('button', { name: 'Abrir' }))
    await expect.element(page.getByRole('dialog')).toBeVisible()

    expect(target.current).toBe(page.getByRole('dialog').element())
    expect(target.current?.contains(document.activeElement)).toBe(true)

    await userEvent.keyboard('{Escape}')

    await expect.poll(() => target.current, { timeout: 4000 }).toBeNull()
    await expect.poll(() => document.querySelector('[inert]')).toBeNull()
  })
})
