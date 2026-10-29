import { describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { Button } from '@components/common/Button/index.tsx'
import Navbar from '@components/navbar/index.tsx'
import { renderInBrowser } from '../../support/harness.tsx'
import { waitForSettled } from '../../support/settle.ts'

const sections = [
  {
    id: 'main',
    items: [
      { id: 'recursos', label: 'Recursos', href: '#recursos' },
      { id: 'contato', label: 'Contato', href: '#contato' }
    ]
  }
]

const slotOf = (name: string) => document.querySelector(`[data-slot="${name}"]`) as HTMLElement

const start = <Button variant="primary">Começar</Button>

describe('Navbar actions in a real browser', () => {
  it('lays the actions out between the menu and the theme toggle on a wide viewport', async () => {
    await page.viewport(1280, 800)
    renderInBrowser(<Navbar sections={sections} actions={start} />)
    const menu = slotOf('navbar-menu').getBoundingClientRect()
    const cta = slotOf('navbar-cta').getBoundingClientRect()
    const toggle = page.getByRole('button', { name: 'Mudar para tema escuro' }).element().getBoundingClientRect()

    expect(cta.width).toBeGreaterThan(0)
    expect(cta.left).toBeGreaterThanOrEqual(menu.right - 1)
    expect(cta.right).toBeLessThanOrEqual(toggle.left + 1)
    expect(getComputedStyle(slotOf('navbar-menu-button')).display).toBe('none')
  })

  it('moves the actions into the drawer, below the links, on a narrow viewport', async () => {
    await page.viewport(500, 800)
    renderInBrowser(<Navbar sections={sections} actions={start} />)

    expect(document.querySelector('[data-slot="navbar-cta"]')).toBeNull()

    await page.getByRole('button', { name: 'Abrir menu' }).click()
    await expect.element(page.getByRole('button', { name: 'Começar' })).toBeVisible()
    await waitForSettled(() => page.getByRole('dialog').element())

    expect(slotOf('navbar-drawer-cta').getBoundingClientRect().top).toBeGreaterThanOrEqual(slotOf('navbar-drawer-nav').getBoundingClientRect().bottom - 1)
  })

  it('keeps the actions inside the focus loop of the drawer', async () => {
    await page.viewport(500, 800)
    renderInBrowser(<Navbar sections={sections} actions={start} />)

    await page.getByRole('button', { name: 'Abrir menu' }).click()
    await expect.element(page.getByRole('dialog')).toBeVisible()
    const reached = new Set<string>()

    for (let index = 0; index < 8; index += 1) {
      await userEvent.tab()
      reached.add(document.activeElement?.textContent || document.activeElement?.getAttribute('aria-label') || '')
    }

    expect(reached.has('Começar')).toBe(true)
    expect(page.getByRole('dialog').element().contains(document.activeElement)).toBe(true)
  })

  it('closes the drawer and returns the focus to the menu button when an action link is chosen', async () => {
    await page.viewport(500, 800)
    renderInBrowser(<Navbar actions={<a href="#contato">Contato</a>} />)
    const trigger = page.getByRole('button', { name: 'Abrir menu' })

    await trigger.click()
    await page.getByRole('dialog').getByRole('link', { name: 'Contato' }).click()

    await expect.poll(() => page.getByRole('dialog').elements().length).toBe(0)
    await expect.poll(() => document.activeElement).toBe(trigger.element())
  })
})
