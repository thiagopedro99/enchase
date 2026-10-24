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

import type { ComponentType } from 'react'
import type { IconProps } from '@components/common/Icon/types.ts'

const modules = import.meta.glob<Record<string, ComponentType<IconProps>>>('../components/common/Icon/icons/*.tsx', { eager: true })

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

  it('mirrors a directional icon inside a right-to-left island of a left-to-right page', () => {
    const { container } = renderInBrowser(
      <div dir="rtl">
        <ChevronRightIcon />
      </div>
    )
    document.documentElement.setAttribute('dir', 'ltr')

    expect(transformOf(container.querySelector('svg') as Element)).toBe('matrix(-1, 0, 0, 1, 0, 0)')
  })

  it('leaves a directional icon alone in a left-to-right page, whatever the language of the page', () => {
    document.documentElement.setAttribute('lang', 'ar')
    const { container } = renderInBrowser(<ChevronRightIcon />)

    expect(transformOf(container.querySelector('svg') as Element)).toBe('none')

    document.documentElement.removeAttribute('lang')
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

describe('the icons of enchase/icons in a real browser', () => {
  const entries = Object.values(modules).flatMap((module) => Object.entries(module))

  it('draws every icon with the size asked and in the color of the text around it', () => {
    const { container } = renderInBrowser(
      <div style={{ color: 'rgb(200, 0, 0)', display: 'flex' }}>
        {entries.map(([name, Component]) => (
          <Component key={name} size={20} />
        ))}
      </div>
    )
    const icons = Array.from(container.querySelectorAll('svg[data-icon]'))

    expect(icons).toHaveLength(entries.length)

    for (const icon of icons) {
      const box = icon.getBoundingClientRect()
      const style = getComputedStyle(icon)

      expect(box.width, icon.getAttribute('data-icon') ?? '').toBeCloseTo(20, 0)
      expect(box.height).toBeCloseTo(20, 0)
      expect(style.stroke).toBe('rgb(200, 0, 0)')
      expect(style.flexShrink).toBe('0')
    }
  })

  it('mirrors in right-to-left text exactly the icons that are flagged as directional', () => {
    const { container } = renderInBrowser(
      <div>
        {entries.map(([name, Component]) => (
          <Component key={name} />
        ))}
      </div>
    )
    const icons = Array.from(container.querySelectorAll('svg[data-icon]'))

    document.documentElement.setAttribute('dir', 'rtl')

    const mirrored = icons.filter((icon) => transformOf(icon) === 'matrix(-1, 0, 0, 1, 0, 0)').map((icon) => icon.getAttribute('data-icon'))
    const flagged = icons.filter((icon) => icon.hasAttribute('data-directional')).map((icon) => icon.getAttribute('data-icon'))

    expect(mirrored).toEqual(flagged)
    expect(flagged).toHaveLength(7)
  })
})
