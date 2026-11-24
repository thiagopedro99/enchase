import { afterEach, describe, expect, it } from 'vitest'

import { Pagination } from '@components/common/Pagination/index.tsx'
import { Sidebar } from '@components/common/Sidebar/index.tsx'
import { Menu } from '@components/common/Menu/index.tsx'
import { Tabs } from '@components/common/Tabs/index.tsx'
import { part, style } from '../support/hookProbes.ts'
import { material2 } from '@styles/presets/material2.ts'
import { renderInBrowser } from '../support/harness.tsx'
import { waitForSettled } from '../support/settle.ts'

import type { ReactElement } from 'react'

const styled = { style: material2 } as const

const show = (ui: ReactElement) => renderInBrowser(ui, 'never', 'light', styled)

const px = (value: string) => parseFloat(value)

afterEach(() => {
  document.documentElement.removeAttribute('style')
})

describe('the tabs of the material2 style', () => {
  it('stands the tab at 48px with 12px of block padding, the text upper case at the weight and letter-spacing of the button', () => {
    show(
      <Tabs
        label="Account"
        items={[
          { value: 'profile', label: 'Profile', content: 'Profile content' },
          { value: 'billing', label: 'Billing', content: 'Billing content' }
        ]}
        defaultValue="profile"
      />
    )
    const tab = style('tabs-tab', 0)

    expect(part('tabs-tab', 0).getBoundingClientRect().height).toBeGreaterThanOrEqual(48)
    expect(px(tab.paddingTop)).toBe(12)
    expect(tab.textTransform).toBe('uppercase')
    expect(px(tab.letterSpacing)).toBeCloseTo(0.4, 1)
    expect(tab.fontWeight).toBe('500')
  })

  it('colors the selected tab and its indicator with the primary color, the unselected tab with the secondary text', () => {
    show(
      <Tabs
        label="Account"
        items={[
          { value: 'profile', label: 'Profile', content: 'Profile content' },
          { value: 'billing', label: 'Billing', content: 'Billing content' }
        ]}
        defaultValue="profile"
      />
    )

    expect(style('tabs-tab', 0).color).toBe('rgb(6, 108, 200)')
    expect(style('tabs-tab', 1).color).toBe('rgba(0, 0, 0, 0.6)')
  })
})

describe('the sidebar of the material2 style', () => {
  it('stands the item at 48px with no radius', () => {
    show(
      <Sidebar
        ariaLabel="Navigation"
        sections={[{ id: 'main', items: [{ id: 'home', label: 'Home', onClick: () => undefined }] }]}
      />
    )

    expect(part('sidebar-item-control').getBoundingClientRect().height).toBe(48)
    expect(px(style('sidebar-item-control').borderTopLeftRadius)).toBe(0)
  })
})

describe('the pagination of the material2 style', () => {
  it('draws the page item as a 32px circle', () => {
    show(<Pagination page={1} pageCount={5} onPageChange={() => undefined} />)
    const item = part('pagination-page', 0)

    expect([item.getBoundingClientRect().width, item.getBoundingClientRect().height]).toEqual([32, 32])
    expect(style('pagination-page', 0).borderRadius).toBe('9999px')
  })

  it('fills the current page with a neutral layer and the primary color text, not a solid primary fill', () => {
    show(<Pagination page={1} pageCount={5} onPageChange={() => undefined} />)
    const current = part('pagination-page', 0)
    const computed = getComputedStyle(current)

    expect(current).toHaveAttribute('aria-current', 'page')
    expect(computed.backgroundColor).not.toBe('rgb(6, 108, 200)')
    expect(computed.color).toBe('rgb(21, 101, 192)')
  })
})

describe('the menu of the material2 style', () => {
  const opened = async () => {
    show(
      <Menu trigger={<button type="button">Open</button>} items={[{ value: 'a', label: 'Action A' }, { value: 'b', label: 'Action B' }]} defaultOpen />
    )
    await waitForSettled(() => part('menu-item'))
  }

  it('pads the item at 6px by 16px with no radius of its own, and rounds the panel at 4px', async () => {
    await opened()
    const item = style('menu-item', 0)

    expect(px(item.paddingTop)).toBe(6)
    expect(px(item.paddingLeft)).toBe(16)
    expect(px(item.borderTopLeftRadius)).toBe(0)
    expect(px(style('popover-content').borderTopLeftRadius)).toBe(4)
  })

  it('casts elevation 8 under the menu panel', async () => {
    await opened()

    expect(style('popover-content').boxShadow).toContain('rgba(0, 0, 0, 0.2) 0px 5px 5px -3px')
  })
})
