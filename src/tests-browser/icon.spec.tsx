import { afterEach, describe, expect, it } from 'vitest'

import { ChevronRightIcon } from '@components/common/Icon/icons/ChevronRightIcon.tsx'
import { ChevronLeftIcon } from '@components/common/Icon/icons/ChevronLeftIcon.tsx'
import { ExternalLinkIcon } from '@components/common/Icon/icons/ExternalLinkIcon.tsx'
import { LogOutIcon } from '@components/common/Icon/icons/LogOutIcon.tsx'
import { MenuOpenIcon } from '@components/common/Icon/icons/MenuOpenIcon.tsx'
import { ChevronsLeftIcon } from '@components/common/Icon/icons/ChevronsLeftIcon.tsx'
import { ChevronsRightIcon } from '@components/common/Icon/icons/ChevronsRightIcon.tsx'
import { MenuIcon } from '@components/common/Icon/icons/MenuIcon.tsx'
import { Icon } from '@components/common/Icon/index.tsx'
import { renderInBrowser } from './harness.tsx'

const directional = [ChevronRightIcon, ChevronLeftIcon, ChevronsLeftIcon, ChevronsRightIcon, ExternalLinkIcon, LogOutIcon, MenuOpenIcon]

const transformOf = (element: Element) => getComputedStyle(element).transform

afterEach(() => {
  document.documentElement.removeAttribute('dir')
  document.body.innerHTML = ''
})

describe('Icon in a real browser', () => {
  it('mirrors the directional icons in right-to-left and leaves them alone in left-to-right', () => {
    const { container } = renderInBrowser(
      <div>
        {directional.map((Component, index) => (
          <Component key={index} />
        ))}
        <MenuIcon />
      </div>
    )
    const icons = Array.from(container.querySelectorAll('svg[data-icon]'))

    for (const icon of icons) expect(transformOf(icon)).toBe('none')

    document.documentElement.setAttribute('dir', 'rtl')

    for (const icon of icons) {
      const mirrored = icon.hasAttribute('data-directional')
      expect(transformOf(icon), icon.getAttribute('data-icon') ?? '').toBe(mirrored ? 'matrix(-1, 0, 0, 1, 0, 0)' : 'none')
    }
  })

  it('does not mirror a directional icon outside a right-to-left tree', () => {
    const { container } = renderInBrowser(
      <div dir="ltr">
        <ChevronRightIcon />
      </div>
    )
    document.documentElement.setAttribute('dir', 'rtl')

    expect(transformOf(container.querySelector('svg') as Element)).toBe('none')
  })

  it('lets the class of the user win over the icon own style', () => {
    const style = document.createElement('style')
    style.textContent = '.user-icon { display: block; vertical-align: top; }'
    document.head.append(style)
    const { container } = renderInBrowser(
      <Icon name="dot" className="user-icon">
        <circle cx="12" cy="12" r="1" />
      </Icon>
    )
    const svg = container.querySelector('svg') as SVGSVGElement
    const computed = getComputedStyle(svg)

    expect(computed.display).toBe('block')
    expect(computed.verticalAlign).toBe('top')

    style.remove()
  })
})
