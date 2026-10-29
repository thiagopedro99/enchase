import { render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { Link } from '@components/common/Link/index.tsx'
import UIProvider from '@components/uiProvider/index.tsx'
import { renderInBrowser } from '../../../support/harness.tsx'

afterEach(() => {
  document.head.querySelectorAll('style[data-test]').forEach((style) => style.remove())
  document.body.innerHTML = ''
  window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
})

describe('Link in a real browser', () => {
  it('lets the class of the user win over the own style without !important', () => {
    const style = document.createElement('style')
    style.dataset.test = ''
    style.textContent = '.user-link { color: rgb(1, 2, 3); text-decoration: none; }'
    document.head.append(style)
    const { container } = renderInBrowser(
      <Link href="/docs" className="user-link">
        Docs
      </Link>
    )
    const computed = getComputedStyle(container.querySelector('a') as Element)

    expect(computed.color).toBe('rgb(1, 2, 3)')
    expect(computed.textDecorationLine).toBe('none')
  })

  it('keeps its underline and shows a focus ring on keyboard focus', async () => {
    const { container } = renderInBrowser(
      <Link href="/docs" data-testid="docs">
        Docs
      </Link>
    )
    const anchor = container.querySelector('a') as HTMLAnchorElement

    expect(getComputedStyle(anchor).textDecorationLine).toBe('underline')

    await userEvent.tab()
    if (document.activeElement !== anchor) {
      await userEvent.keyboard('{Shift}')
      anchor.focus()
    }

    await expect.poll(() => document.activeElement).toBe(anchor)

    expect(getComputedStyle(anchor).outlineStyle).toBe('solid')
    expect(getComputedStyle(anchor).outlineWidth).toBe('2px')
  })

  it('scrolls to a section of the current page without handing the click to navigate', async () => {
    const navigate = vi.fn()
    const { pathname, search } = window.location

    render(
      <UIProvider navigate={navigate} currentHref={pathname}>
        <Link href={`${pathname}${search}#fim`}>Ir ao fim</Link>
        <div style={{ height: 3000 }} />
        <section id="fim">Fim</section>
      </UIProvider>
    )

    await userEvent.click(page.getByRole('link', { name: 'Ir ao fim' }))

    await expect.poll(() => window.scrollY).toBeGreaterThan(1000)

    expect(window.location.hash).toBe('#fim')
    expect(window.location.pathname).toBe(pathname)
    expect(navigate).not.toHaveBeenCalled()
  })
})
