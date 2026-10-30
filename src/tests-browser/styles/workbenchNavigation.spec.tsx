import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'

import Breadcrumbs from '@components/common/Breadcrumbs/index.tsx'
import Pagination from '@components/common/Pagination/index.tsx'
import { Sidebar } from '@components/common/Sidebar/index.tsx'
import { at, part, style } from '../support/hookProbes.ts'
import { Menu } from '@components/common/Menu/index.tsx'
import { Tabs } from '@components/common/Tabs/index.tsx'
import { workbench } from '@styles/presets/workbench.ts'
import { parseComputedColor } from '../support/color.ts'
import { renderInBrowser } from '../support/harness.tsx'
import { waitForSettled } from '../support/settle.ts'
import Navbar from '@components/navbar/index.tsx'

import type { MenuEntry } from '@components/common/Menu/types.ts'
import type { ReactElement } from 'react'

const styled = { style: workbench } as const

const show = (ui: ReactElement, mode: 'light' | 'dark' = 'light') => renderInBrowser(ui, 'never', mode, styled)

const showDark = async (ui: ReactElement) => {
  show(ui, 'dark')
  await expect.poll(() => document.documentElement.dataset.theme).toBe('dark')
  await waitForSettled(() => document.body)
}

const px = (value: string) => parseFloat(value)

const alphaOf = (value: string) => parseComputedColor(value).a

const textBox = (element: Element) => {
  const range = document.createRange()

  range.selectNodeContents(element)

  return range.getBoundingClientRect()
}

const popupShadow = 'rgba(0, 0, 0, 0.08) 0px 6px 16px 0px, rgba(0, 0, 0, 0.12) 0px 3px 6px -4px, rgba(0, 0, 0, 0.05) 0px 9px 28px 8px'

const tabs = [
  { value: 'one', label: 'One', content: <p>First</p> },
  { value: 'two', label: 'Two', content: <p>Second</p> },
  { value: 'three', label: 'Three', content: <p>Third</p>, disabled: true }
]

const sections = [
  {
    id: 's1',
    title: 'Main',
    items: [
      { id: 'home', label: 'Home', href: '/' },
      { id: 'docs', label: 'Docs', href: '/docs' },
      { id: 'about', label: 'About', href: '/about' }
    ]
  }
]

const menu = [
  {
    id: 'm',
    items: [
      { id: 'home', label: 'Home', href: '/' },
      { id: 'docs', label: 'Docs', href: '/docs' }
    ]
  }
]

const entries: MenuEntry[] = [
  { id: 'edit', label: 'Edit' },
  { id: 'duplicate', label: 'Duplicate' },
  { id: 'split', separator: true },
  { id: 'archive', label: 'Archive', disabled: true },
  { id: 'delete', label: 'Delete' }
]

const trail = [
  { id: 'a', label: 'Home', href: '/' },
  { id: 'b', label: 'Docs', href: '/docs' },
  { id: 'c', label: 'Now' }
]

const sidebar = <Sidebar variant="permanent" currentHref="/" sections={sections} />

const sidebarLink = (index: number) => () => part('sidebar-nav').querySelectorAll('a')[index]

const navbarLink = (index: number) => () => part('navbar-menu').querySelectorAll('a')[index]

const dropdown = (
  <Menu label="Actions" items={entries} defaultOpen>
    <button type="button">Open</button>
  </Menu>
)

const opened = () => waitForSettled(() => part('popover-content'))

const indicated = () => expect.poll(() => part('sidebar-nav').hasAttribute('data-indicator')).toBe(true)

afterEach(() => {
  document.documentElement.removeAttribute('style')
})

describe('the tabs of the workbench style', () => {
  it('makes the tab 46px high with 12px above and below the text and 14px regular type, as the original does', () => {
    show(<Tabs ariaLabel="Account" items={tabs} defaultValue="one" />)
    const tab = style('tabs-tab')

    expect(part('tabs-tab', 0).getBoundingClientRect().height).toBe(46)
    expect(part('tabs-list').getBoundingClientRect().height).toBe(46)
    expect([px(tab.paddingTop), px(tab.paddingBottom)]).toEqual([12, 12])
    expect(px(tab.fontSize)).toBe(14)
    expect(tab.fontWeight).toBe('400')
  })

  it('keeps the texts of two tabs 32px apart with 16px on each side of a tab, where the original has no padding and a 32px margin, because there is no hook for the gap between tabs', () => {
    show(<Tabs ariaLabel="Account" items={tabs} defaultValue="one" />)
    const tab = style('tabs-tab')

    expect([px(tab.paddingLeft), px(tab.paddingRight)]).toEqual([16, 16])
    expect(textBox(part('tabs-tab', 1)).left - textBox(part('tabs-tab', 0)).right).toBeCloseTo(32, 1)
  })

  it('draws a 2px bar in the primary blue #0958D9 under the selected tab, where the original draws #1677FF, and a 1px line in the border color along the list', () => {
    show(<Tabs ariaLabel="Account" items={tabs} defaultValue="one" />)
    const bar = style('tabs-indicator')

    expect(px(bar.height)).toBe(2)
    expect(bar.borderBottomWidth).toBe('2px')
    expect(bar.borderBottomColor).toBe('rgb(9, 88, 217)')
    expect(style('tabs-list').boxShadow).toBe('rgb(240, 240, 240) 0px -1px 0px 0px inset')
  })

  it('writes the selected tab in the primary blue, where the original #1677FF holds 4.10:1, and the others in 0.88 black, with the disabled one at 0.38 where the original has 0.25', () => {
    show(<Tabs ariaLabel="Account" items={tabs} defaultValue="one" />)

    expect(style('tabs-tab', 0).color).toBe('rgb(9, 88, 217)')
    expect(style('tabs-tab', 1).color).toBe('rgba(0, 0, 0, 0.88)')
    expect(style('tabs-tab', 2).color).toBe('rgba(0, 0, 0, 0.38)')
  })

  it('keeps the color of the tab under the pointer and lays the 6% state layer over it, where the original turns the text #4096FF, 2.99:1 against the page', async () => {
    show(<Tabs ariaLabel="Account" items={tabs} defaultValue="one" />)
    await userEvent.hover(part('tabs-tab', 1))
    await waitForSettled(at('tabs-tab', 1))

    expect(style('tabs-tab', 1).color).toBe('rgba(0, 0, 0, 0.88)')
    expect(getComputedStyle(part('tabs-tab', 1), '::after').opacity).toBe('0.06')
  })

  it('paints the selected tab and the bar in the light blue and the others in 0.85 white in the dark mode', async () => {
    await showDark(<Tabs ariaLabel="Account" items={tabs} defaultValue="one" />)

    expect(style('tabs-tab', 0).color).toBe('rgb(101, 169, 243)')
    expect(style('tabs-tab', 1).color).toBe('rgba(255, 255, 255, 0.85)')
    expect(style('tabs-indicator').borderBottomColor).toBe('rgb(101, 169, 243)')
    expect(style('tabs-list').boxShadow).toBe('rgb(48, 48, 48) 0px -1px 0px 0px inset')
  })
})

describe('the inline menu of the sidebar in the workbench style', () => {
  it('makes the item 40px high, 4px from the next one and 4px from the edge of the list, which is the 4px margin of the original', () => {
    show(sidebar)
    const first = sidebarLink(0)().getBoundingClientRect()
    const second = sidebarLink(1)().getBoundingClientRect()
    const nav = part('sidebar-nav').getBoundingClientRect()

    expect([first.height, second.height]).toEqual([40, 40])
    expect(second.top - first.bottom).toBe(4)
    expect(first.left - nav.left).toBe(4)
    expect(nav.right - first.right).toBe(4)
  })

  it('pads the item by 24px on both sides, where the original has 24px at the start and 16px at the end because the padding of the item is one hook, and puts 10px between the icon and the label', () => {
    show(sidebar)
    const item = getComputedStyle(sidebarLink(0)())

    expect([px(item.paddingLeft), px(item.paddingRight)]).toEqual([24, 24])
    expect([px(item.paddingTop), px(item.paddingBottom)]).toEqual([0, 0])
    expect(item.columnGap).toBe('10px')
  })

  it('rounds the item at 8px and writes it in 14px regular type, as the original does', () => {
    show(sidebar)
    const item = getComputedStyle(sidebarLink(1)())

    expect(px(item.borderTopLeftRadius)).toBe(8)
    expect(px(item.fontSize)).toBe(14)
    expect(item.fontWeight).toBe('400')
  })

  it('fills the current item with the primary container and writes it in #0958D9, which holds 5.50:1 against it where the #1677FF of the original holds 3.66:1', async () => {
    show(sidebar)
    await indicated()
    const indicator = style('sidebar-indicator')

    expect(indicator.backgroundColor).toBe('rgb(230, 244, 255)')
    expect(px(indicator.borderTopLeftRadius)).toBe(8)
    expect(getComputedStyle(sidebarLink(0)()).color).toBe('rgb(9, 88, 217)')
  })

  it('writes the other items in 0.88 black and lays the 6% state layer over the one under the pointer, which is 5.28% of black where the original lays 6%', async () => {
    show(sidebar)
    await userEvent.hover(sidebarLink(1)())
    await waitForSettled(at('sidebar-nav'))
    const hovered = getComputedStyle(sidebarLink(1)())

    expect(getComputedStyle(sidebarLink(2)()).color).toBe('rgba(0, 0, 0, 0.88)')
    expect(hovered.color).toBe('rgba(0, 0, 0, 0.88)')
    expect(alphaOf(hovered.backgroundColor)).toBeCloseTo(0.0528, 3)
  })

  it('fills the current item with the dark primary container and writes it in the light blue in the dark mode', async () => {
    await showDark(sidebar)
    await indicated()

    expect(style('sidebar-indicator').backgroundColor).toBe('rgb(21, 50, 91)')
    expect(getComputedStyle(sidebarLink(0)()).color).toBe('rgb(141, 197, 248)')
    expect(getComputedStyle(sidebarLink(1)()).color).toBe('rgba(255, 255, 255, 0.85)')
  })
})

describe('the horizontal menu of the navbar in the workbench style', () => {
  it('keeps the bar 64px high, as the original does, and rounds the links at 8px in 14px regular type', () => {
    show(<Navbar sections={menu} />)
    const link = getComputedStyle(navbarLink(1)())

    expect(part('navbar-bar').getBoundingClientRect().height).toBe(64)
    expect(px(link.borderTopLeftRadius)).toBe(8)
    expect(px(link.fontSize)).toBe(14)
    expect(link.fontWeight).toBe('400')
  })

  it('pads the link by 16px and keeps it 32px high, the hit size, where the original item is 46px high with a 2px underline, because the link has no hook for its height or for an underline', () => {
    show(<Navbar sections={menu} />)
    const link = getComputedStyle(navbarLink(1)())

    expect([px(link.paddingLeft), px(link.paddingRight)]).toEqual([16, 16])
    expect(navbarLink(1)().getBoundingClientRect().height).toBe(32)
    expect(link.borderBottomWidth).toBe('0px')
  })

  it('fills the current link with the primary container and writes it in #0958D9, and writes the others in 0.88 black', () => {
    show(<Navbar sections={menu} />)

    expect(getComputedStyle(navbarLink(0)()).backgroundColor).toBe('rgb(230, 244, 255)')
    expect(getComputedStyle(navbarLink(0)()).color).toBe('rgb(9, 88, 217)')
    expect(getComputedStyle(navbarLink(1)()).color).toBe('rgba(0, 0, 0, 0.88)')
  })

  it('fills the current link with the dark primary container and writes it in the light blue in the dark mode', async () => {
    await showDark(<Navbar sections={menu} />)

    expect(getComputedStyle(navbarLink(0)()).backgroundColor).toBe('rgb(21, 50, 91)')
    expect(getComputedStyle(navbarLink(0)()).color).toBe('rgb(141, 197, 248)')
    expect(getComputedStyle(navbarLink(1)()).color).toBe('rgba(255, 255, 255, 0.85)')
  })
})

describe('the dropdown menu in the workbench style', () => {
  it('fills the panel in white, rounds it at 8px and gives it the popup shadow, which the style keeps in the popover', async () => {
    show(dropdown)
    await opened()
    const panel = style('popover-content')

    expect(panel.backgroundColor).toBe('rgb(255, 255, 255)')
    expect(px(panel.borderTopLeftRadius)).toBe(8)
    expect(panel.boxShadow).toBe(popupShadow)
  })

  it('pads the list by 4px, as the original does', async () => {
    show(dropdown)
    await opened()
    const list = style('menu')

    expect([px(list.paddingTop), px(list.paddingBottom), px(list.paddingLeft), px(list.paddingRight)]).toEqual([4, 4, 4, 4])
  })

  it('makes the item 32px high with 5px by 12px of padding, 4px corners and 14px regular type, as the original does', async () => {
    show(dropdown)
    await opened()
    const item = style('menu-item')

    expect(part('menu-item').getBoundingClientRect().height).toBe(32)
    expect([px(item.paddingTop), px(item.paddingBottom)]).toEqual([5, 5])
    expect([px(item.paddingLeft), px(item.paddingRight)]).toEqual([12, 12])
    expect(px(item.borderTopLeftRadius)).toBe(4)
    expect(px(item.fontSize)).toBe(14)
    expect(item.fontWeight).toBe('400')
    expect(item.color).toBe('rgba(0, 0, 0, 0.88)')
  })

  it('draws the divider 1px high in the border color with 4px above and below it', async () => {
    show(dropdown)
    await opened()
    const divider = style('menu-separator')

    expect(px(divider.height)).toBe(1)
    expect(divider.backgroundColor).toBe('rgb(240, 240, 240)')
    expect([px(divider.marginTop), px(divider.marginBottom)]).toEqual([4, 4])
  })

  it('lays the 6% state layer over the item under the pointer, which is 5.28% of black where the original lays 4%, and writes the disabled item at 0.38 where the original has 0.25', async () => {
    show(dropdown)
    await opened()
    await userEvent.hover(part('menu-item', 1))
    await waitForSettled(at('popover-content'))

    expect(alphaOf(style('menu-item', 1).backgroundColor)).toBeCloseTo(0.0528, 3)
    expect(style('menu-item', 2).color).toBe('rgba(0, 0, 0, 0.38)')
  })

  it('fills the panel in the elevated surface #1F1F1F and writes the items in 0.85 white in the dark mode', async () => {
    await showDark(dropdown)
    await opened()

    expect(style('popover-content').backgroundColor).toBe('rgb(31, 31, 31)')
    expect(style('menu-item').color).toBe('rgba(255, 255, 255, 0.85)')
  })
})

describe('the pagination of the workbench style', () => {
  it('makes the page 32px by 32px with 6px corners, 6px of inline padding and 14px regular type, 8px from the next one, as the original does', () => {
    show(<Pagination pageCount={10} page={1} />)
    const page = style('pagination-page', 1)
    const first = part('pagination-page', 1).getBoundingClientRect()
    const second = part('pagination-page', 2).getBoundingClientRect()

    expect([first.width, first.height]).toEqual([32, 32])
    expect(second.left - first.right).toBe(8)
    expect(px(page.borderTopLeftRadius)).toBe(6)
    expect([px(page.paddingLeft), px(page.paddingRight)]).toEqual([6, 6])
    expect(px(page.fontSize)).toBe(14)
    expect(page.fontWeight).toBe('400')
  })

  it('makes the page of the small pagination 24px by 24px, as the original does', () => {
    show(<Pagination pageCount={10} page={1} size="sm" />)
    const box = part('pagination-page', 1).getBoundingClientRect()

    expect([box.width, box.height]).toEqual([24, 24])
    expect(px(style('pagination-page', 1).paddingLeft)).toBe(6)
    expect(px(style('pagination-page', 1).fontSize)).toBe(14)
  })

  it('draws the current page with a 1px border and the text in the primary blue #0958D9 over no fill, as the original does with #1677FF, in regular weight where the original writes 600 because one hook sets the weight of every page', () => {
    show(<Pagination pageCount={10} page={1} />)
    const current = style('pagination-page', 0)
    const other = style('pagination-page', 1)

    expect(current.borderTopWidth).toBe('1px')
    expect(current.borderTopColor).toBe('rgb(9, 88, 217)')
    expect(current.color).toBe('rgb(9, 88, 217)')
    expect(current.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(current.fontWeight).toBe('400')
    expect(other.borderTopColor).toBe('rgba(0, 0, 0, 0)')
    expect(other.color).toBe('rgba(0, 0, 0, 0.88)')
  })

  it('lays the 6% state layer over the page under the pointer and keeps its color, where the original lays 6% of black', async () => {
    show(<Pagination pageCount={10} page={1} />)
    await userEvent.hover(part('pagination-page', 1))
    await waitForSettled(at('pagination-page', 1))

    expect(getComputedStyle(part('pagination-page', 1), '::after').opacity).toBe('0.06')
    expect(style('pagination-page', 1).color).toBe('rgba(0, 0, 0, 0.88)')
  })

  it('writes the current page and its border in the light blue in the dark mode', async () => {
    await showDark(<Pagination pageCount={10} page={1} />)

    expect(style('pagination-page', 0).color).toBe('rgb(101, 169, 243)')
    expect(style('pagination-page', 0).borderTopColor).toBe('rgb(101, 169, 243)')
    expect(style('pagination-page', 1).color).toBe('rgba(255, 255, 255, 0.85)')
  })
})

describe('the breadcrumbs of the workbench style', () => {
  it('writes the trail in 14px regular type, the links in 0.65 black and the current page in 0.88 black, where the original writes the links in 0.45, 3.35:1 against the page', () => {
    show(<Breadcrumbs items={trail} />)
    const link = style('breadcrumbs-link')
    const current = style('breadcrumbs-current')

    expect(px(link.fontSize)).toBe(14)
    expect(link.fontWeight).toBe('400')
    expect(link.color).toBe('rgba(0, 0, 0, 0.65)')
    expect(current.fontWeight).toBe('400')
    expect(current.color).toBe('rgba(0, 0, 0, 0.88)')
  })

  it('puts 8px between the text of a link and the separator, which is 4px of padding and 4px of gap, as the original has an 8px margin on the separator', () => {
    show(<Breadcrumbs items={trail} />)

    expect(part('breadcrumbs-separator', 0).getBoundingClientRect().left - textBox(part('breadcrumbs-link', 0)).right).toBeCloseTo(8, 1)
    expect(textBox(part('breadcrumbs-current')).left - part('breadcrumbs-separator', 1).getBoundingClientRect().right).toBeCloseTo(8, 1)
  })

  it('makes the link 24px high with 4px corners and 4px of inline padding, where the original is 22px high, which is under the floor of 24px for a target', () => {
    show(<Breadcrumbs items={trail} />)
    const link = style('breadcrumbs-link')

    expect(part('breadcrumbs-link').getBoundingClientRect().height).toBe(24)
    expect(px(link.borderTopLeftRadius)).toBe(4)
    expect([px(link.paddingLeft), px(link.paddingRight)]).toEqual([4, 4])
  })

  it('writes a crumb that is not a link in 14px regular type and 0.65 black, with the same 4px of inline padding as the link', () => {
    show(
      <Breadcrumbs
        items={[
          { id: 'a', label: 'Home', href: '/' },
          { id: 'b', label: 'Section' },
          { id: 'c', label: 'Now' }
        ]}
      />
    )
    const text = style('breadcrumbs-text')

    expect(px(text.paddingLeft)).toBe(4)
    expect(px(text.fontSize)).toBe(14)
    expect(text.fontWeight).toBe('400')
    expect(text.color).toBe('rgba(0, 0, 0, 0.65)')
  })

  it('lays the 6% state layer under the text of the link under the pointer and writes it in 0.88 black, as the original does with 6% of black', async () => {
    show(<Breadcrumbs items={trail} />)
    await userEvent.hover(part('breadcrumbs-link', 1))
    await waitForSettled(at('breadcrumbs-link', 1))

    expect(style('breadcrumbs-link', 1).color).toBe('rgba(0, 0, 0, 0.88)')
    expect(alphaOf(style('breadcrumbs-link', 1).backgroundColor)).toBeCloseTo(0.0528, 3)
  })

  it('writes the links in 0.65 white and the current page in 0.85 white in the dark mode', async () => {
    await showDark(<Breadcrumbs items={trail} />)

    expect(style('breadcrumbs-link').color).toBe('rgba(255, 255, 255, 0.65)')
    expect(style('breadcrumbs-current').color).toBe('rgba(255, 255, 255, 0.85)')
  })
})
