import { afterEach, describe, expect, it } from 'vitest'
import { chromiumOnly, isChromium } from './browserSkips.ts'
import { cdp, page } from 'vitest/browser'

import { SidebarUser } from '@components/layout/subcomponentes/SidebarUser/index.tsx'
import { renderInBrowser } from './harness.tsx'

const added: HTMLStyleElement[] = []

afterEach(async () => {
  added.splice(0).forEach((style) => style.remove())
  document.documentElement.removeAttribute('dir')
  if (isChromium) await cdp().send('Emulation.setTouchEmulationEnabled', { enabled: false })
})

describe('SidebarUser in a real browser', () => {
  it('lets the caller className win on layout even when its css loads before the library', () => {
    const style = document.createElement('style')
    style.textContent = '.mine { gap: 33px; padding-inline: 7px; }'
    document.head.prepend(style)
    added.push(style)
    renderInBrowser(<SidebarUser name="Pedro Lima" collapsed={false} className="mine" data-testid="user" />)
    const computed = getComputedStyle(page.getByTestId('user').element())

    expect(computed.columnGap).toBe('33px')
    expect(computed.paddingInlineStart).toBe('7px')
  })

  it('keeps a logout target of at least 24 by 24 px and a visible focus ring', async () => {
    renderInBrowser(<SidebarUser name="Pedro Lima" collapsed={false} onLogout={() => undefined} />)
    const button = page.getByRole('button', { name: 'Sair' }).element() as HTMLButtonElement
    const box = button.getBoundingClientRect()

    expect(box.width).toBeGreaterThanOrEqual(24)
    expect(box.height).toBeGreaterThanOrEqual(24)

    button.focus()
    await expect.poll(() => getComputedStyle(button).outlineStyle).not.toBe('none')
  })

  it('puts the logout button on the end side in right to left', () => {
    document.documentElement.setAttribute('dir', 'rtl')
    renderInBrowser(
      <div style={{ inlineSize: 240 }}>
        <SidebarUser name="Pedro Lima" collapsed={false} onLogout={() => undefined} data-testid="user" />
      </div>
    )
    const root = page.getByTestId('user').element().getBoundingClientRect()
    const button = page.getByRole('button', { name: 'Sair' }).element().getBoundingClientRect()
    const avatar = page.getByTestId('user').element().querySelector('[data-slot="sidebar-user-avatar"]') as HTMLElement

    expect(button.left).toBeLessThan(root.left + root.width / 2)
    expect(avatar.getBoundingClientRect().right).toBeGreaterThan(root.left + root.width / 2)
  })

  chromiumOnly('touchEmulation')('does not tint the logout button on hover with a touch pointer', async () => {
    renderInBrowser(<SidebarUser name="Pedro Lima" collapsed={false} onLogout={() => undefined} />)
    await cdp().send('Emulation.setTouchEmulationEnabled', { enabled: true })
    const rules = [...document.styleSheets].flatMap((sheet) => [...sheet.cssRules])
    const ungated = rules.filter((rule) => rule instanceof CSSStyleRule && rule.selectorText.includes(':hover') && rule.selectorText.includes('logout'))

    expect(ungated).toHaveLength(0)
  })
})
