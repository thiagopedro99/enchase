import { afterEach, describe, expect, it } from 'vitest'
import { exceptWebkit } from './browserSkips.ts'
import { userEvent } from 'vitest/browser'

import { Link } from '@components/common/Link/index.tsx'
import { renderInBrowser } from './harness.tsx'

afterEach(() => {
  document.head.querySelectorAll('style[data-test]').forEach((style) => style.remove())
  document.body.innerHTML = ''
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

  exceptWebkit('webkitFocus')('keeps its underline and shows a focus ring on keyboard focus', async () => {
    const { container } = renderInBrowser(
      <Link href="/docs" data-testid="docs">
        Docs
      </Link>
    )
    const anchor = container.querySelector('a') as HTMLAnchorElement

    expect(getComputedStyle(anchor).textDecorationLine).toBe('underline')

    await expect.poll(async () => {
      if (document.activeElement !== anchor) await userEvent.tab()

      return document.activeElement
    }).toBe(anchor)

    expect(getComputedStyle(anchor).outlineStyle).toBe('solid')
    expect(getComputedStyle(anchor).outlineWidth).toBe('2px')
  })
})
