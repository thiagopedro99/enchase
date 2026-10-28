import { useState } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { Menu } from '@components/common/Menu/index.tsx'
import { Modal } from '@components/common/Modal/index.tsx'
import UIProvider from '@components/uiProvider/index.tsx'
import { ptBR } from '@locales/ptBR.ts'
import { renderInBrowser } from './harness.tsx'
import { onRoot, parts, style } from './hookProbes.ts'

import type { MenuEntry } from '@components/common/Menu/types.ts'
import type { ReactElement } from 'react'

const entries = (log: string[] = []): MenuEntry[] => [
  { id: 'edit', label: 'Edit', onSelect: () => log.push('edit') },
  { id: 'duplicate', label: 'Duplicate', onSelect: () => log.push('duplicate') },
  { id: 'split', separator: true },
  { id: 'archive', label: 'Archive', disabled: true, onSelect: () => log.push('archive') },
  { id: 'delete', label: 'Delete', onSelect: () => log.push('delete') }
]

const languages: MenuEntry[] = Array.from({ length: 40 }, (_, index) => ({ id: `language-${index}`, label: `Language ${String(index + 1).padStart(2, '0')}` }))

const menu = () => document.body.querySelector<HTMLElement>('[data-slot="popover-content"]')

const body = () => document.body.querySelector<HTMLElement>('[data-slot="popover-body"]') as HTMLElement

const trigger = () => page.getByRole('button', { name: 'Open' })

const focused = () => document.activeElement?.textContent

const textBox = (element: Element) => {
  const range = document.createRange()

  range.selectNodeContents(element)

  return range.getBoundingClientRect()
}

const within = (item: Element, container: Element) => {
  const box = item.getBoundingClientRect()
  const area = container.getBoundingClientRect()

  return box.top >= area.top - 1 && box.bottom <= area.bottom + 1
}

const neighbours = (log?: string[], items: MenuEntry[] = entries(log)): ReactElement => (
  <div>
    <button>Before</button>
    <Menu label="Actions" items={items}>
      <button>Open</button>
    </Menu>
    <button>After</button>
  </div>
)

const opened = () => expect.poll(() => menu()?.getAttribute('data-state')).toBe('open')

const openByClick = async () => {
  await userEvent.click(trigger())
  await opened()
}

const reachTrigger = async () => {
  for (let step = 0; step < 4 && document.activeElement !== trigger().element(); step += 1) await userEvent.tab()
}

const openWithKey = async (key: string) => {
  await reachTrigger()
  await userEvent.keyboard(key)
  await opened()
}

afterEach(async () => {
  document.documentElement.removeAttribute('style')
  await page.viewport(1280, 800)
})

describe('Menu in a real browser', () => {
  it('opens under the button, on its start edge, and clear of it', async () => {
    renderInBrowser(<div style={{ position: 'absolute', top: 120, left: 300 }}>{neighbours()}</div>)
    await openByClick()
    const button = trigger().element().getBoundingClientRect()
    const box = (menu() as HTMLElement).getBoundingClientRect()

    expect(menu()).toHaveAttribute('data-placement', 'bottom-start')
    expect(box.top).toBeGreaterThanOrEqual(button.bottom)
    expect(Math.abs(box.left - button.left)).toBeLessThanOrEqual(1)
  })

  it('aligns to the right edge of the button in a right-to-left page', async () => {
    renderInBrowser(
      <div dir="rtl">
        <UIProvider locale={{ ...ptBR, dir: 'rtl' }} motion={{ mode: 'never' }}>
          <div style={{ position: 'absolute', top: 120, left: 500 }}>{neighbours()}</div>
        </UIProvider>
      </div>
    )
    await openByClick()
    const button = trigger().element().getBoundingClientRect()
    const box = (menu() as HTMLElement).getBoundingClientRect()

    const item = parts('menu-item')[0]

    expect(Math.abs(box.right - button.right)).toBeLessThanOrEqual(1)
    expect(Math.abs(item.getBoundingClientRect().right - parseFloat(getComputedStyle(item).paddingRight) - textBox(parts('menu-item-label')[0]).right)).toBeLessThanOrEqual(1)
  })

  it('puts the focus on the first item when a click opens the menu', async () => {
    renderInBrowser(neighbours())
    await openByClick()

    await expect.poll(focused).toBe('Edit')
    expect(trigger().element()).toHaveAttribute('aria-expanded', 'true')
  })

  it('opens on the first item with ArrowDown and on the last with ArrowUp, with the focus ring showing', async () => {
    renderInBrowser(neighbours())
    await openWithKey('{ArrowDown}')
    await expect.poll(focused).toBe('Edit')

    const item = document.activeElement as HTMLElement

    expect(item.matches(':focus-visible')).toBe(true)
    expect(getComputedStyle(item).outlineStyle).not.toBe('none')
    expect(parseFloat(getComputedStyle(item).outlineWidth)).toBeGreaterThanOrEqual(2)
    expect(getComputedStyle(item).outlineOffset).toBe('-2px')

    await userEvent.keyboard('{Escape}')
    await expect.poll(menu).toBeNull()
    await openWithKey('{ArrowUp}')

    await expect.poll(focused).toBe('Delete')
  })

  it('moves the focus with the arrows, wrapping around and skipping the disabled item', async () => {
    renderInBrowser(neighbours())
    await openByClick()
    await expect.poll(focused).toBe('Edit')

    for (const [key, expected] of [
      ['{ArrowDown}', 'Duplicate'],
      ['{ArrowDown}', 'Delete'],
      ['{ArrowDown}', 'Edit'],
      ['{ArrowUp}', 'Delete'],
      ['{Home}', 'Edit'],
      ['{End}', 'Delete']
    ]) {
      await userEvent.keyboard(key)
      await expect.poll(focused).toBe(expected)
    }
  })

  it('jumps to the item that starts with the typed letter and cycles through the ones that share it', async () => {
    renderInBrowser(neighbours())
    await openByClick()
    await expect.poll(focused).toBe('Edit')

    await userEvent.keyboard('d')
    await expect.poll(focused).toBe('Duplicate')
    await userEvent.keyboard('d')
    await expect.poll(focused).toBe('Delete')
  })

  it.each([
    ['Enter', '{Enter}'],
    ['Space', ' ']
  ])('chooses the focused item with %s, closes the menu and gives the focus back to the button', async (_, key) => {
    const log: string[] = []

    renderInBrowser(neighbours(log))
    await openByClick()
    await expect.poll(focused).toBe('Edit')
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard(key)

    await expect.poll(menu).toBeNull()
    expect(log).toEqual(['duplicate'])
    expect(document.activeElement).toBe(trigger().element())
  })

  it('chooses an item with a click and does nothing when the item is disabled', async () => {
    const log: string[] = []

    renderInBrowser(neighbours(log))
    await openByClick()
    await userEvent.click(parts('menu-item')[2], { force: true })

    expect(log).toEqual([])
    expect(menu()).toBeTruthy()

    await userEvent.click(parts('menu-item')[3])

    await expect.poll(menu).toBeNull()
    expect(log).toEqual(['delete'])
  })

  it('closes with Tab and moves the focus to the next element after the button', async () => {
    renderInBrowser(neighbours())
    await openByClick()
    await expect.poll(focused).toBe('Edit')
    await userEvent.tab()

    await expect.poll(menu).toBeNull()
    expect(document.activeElement).toBe(page.getByRole('button', { name: 'After' }).element())
  })

  it('closes with Shift+Tab and gives the focus back to the button', async () => {
    renderInBrowser(neighbours())
    await openByClick()
    await expect.poll(focused).toBe('Edit')
    await userEvent.tab({ shift: true })

    await expect.poll(menu).toBeNull()
    expect(document.activeElement).toBe(trigger().element())
  })

  it('closes with Esc and gives the focus back to the button', async () => {
    renderInBrowser(neighbours())
    await openByClick()
    await expect.poll(focused).toBe('Edit')
    await userEvent.keyboard('{Escape}')

    await expect.poll(menu).toBeNull()
    expect(document.activeElement).toBe(trigger().element())
  })

  it('closes with a click outside and leaves the focus where the click landed', async () => {
    renderInBrowser(neighbours())
    await openByClick()
    await userEvent.click(page.getByRole('button', { name: 'Before' }))

    await expect.poll(menu).toBeNull()
    expect(document.activeElement).toBe(page.getByRole('button', { name: 'Before' }).element())
  })

  it('tints the item under the pointer, but not the disabled one', async () => {
    renderInBrowser(neighbours())
    await openByClick()
    const [edit, duplicate, archive] = parts('menu-item')

    expect(getComputedStyle(duplicate).backgroundColor).toBe('rgba(0, 0, 0, 0)')

    await userEvent.hover(duplicate)

    await expect.poll(() => getComputedStyle(duplicate).backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(edit).backgroundColor).toBe('rgba(0, 0, 0, 0)')

    await userEvent.hover(archive)

    expect(getComputedStyle(archive).backgroundColor).toBe('rgba(0, 0, 0, 0)')
  })

  it('draws the separator as a line between the groups', async () => {
    renderInBrowser(neighbours())
    await openByClick()
    const separator = parts('menu-separator')[0]
    const [, duplicate, archive] = parts('menu-item')

    expect(Math.round(separator.getBoundingClientRect().height)).toBe(1)
    expect(separator.getBoundingClientRect().top).toBeGreaterThanOrEqual(duplicate.getBoundingClientRect().bottom)
    expect(separator.getBoundingClientRect().bottom).toBeLessThanOrEqual(archive.getBoundingClientRect().top)
  })

  it('keeps the items at the 24px floor of the target size', async () => {
    renderInBrowser(neighbours())
    await openByClick()

    for (const item of parts('menu-item')) expect(item.getBoundingClientRect().height).toBeGreaterThanOrEqual(24)
  })
})

describe('Menu inside a modal', () => {
  const InModal = () => {
    const [open, setOpen] = useState(true)

    return (
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Settings">
        <Menu label="Actions" items={entries()}>
          <button>Open</button>
        </Menu>
      </Modal>
    )
  }

  it('opens above the modal, is not inert and closes first with Esc, leaving the modal open', async () => {
    renderInBrowser(<InModal />)
    await expect.poll(() => parts('modal-panel').length).toBe(1)
    await openByClick()
    await expect.poll(focused).toBe('Edit')

    const item = parts('menu-item')[0]
    const box = item.getBoundingClientRect()

    expect(menu()?.closest('[inert]')).toBeNull()
    expect(document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2)).toBe(item.querySelector('[data-slot="menu-item-label"]') ?? item)

    await userEvent.keyboard('{Escape}')

    await expect.poll(menu).toBeNull()
    expect(parts('modal-panel').length).toBe(1)
    expect(document.activeElement).toBe(trigger().element())

    await userEvent.keyboard('{Escape}')

    await expect.poll(() => parts('modal-panel').length).toBe(0)
  })

  it('chooses an item and keeps the focus inside the modal', async () => {
    renderInBrowser(<InModal />)
    await expect.poll(() => parts('modal-panel').length).toBe(1)
    await openByClick()
    await expect.poll(focused).toBe('Edit')
    await userEvent.keyboard('{Enter}')

    await expect.poll(menu).toBeNull()
    expect(document.activeElement).toBe(trigger().element())
    expect(parts('modal-panel')[0].contains(document.activeElement)).toBe(true)
  })
})

describe('Menu with a list taller than the window', () => {
  const tall = (
    <div style={{ minHeight: 3000 }}>
      <div style={{ position: 'absolute', top: 16, left: 16 }}>
        <Menu label="Language" items={languages}>
          <button>Open</button>
        </Menu>
      </div>
    </div>
  )

  it('shrinks to the room it has and scrolls inside', async () => {
    await page.viewport(1280, 320)
    renderInBrowser(tall)
    window.scrollTo(0, 0)
    await openByClick()

    expect((menu() as HTMLElement).getBoundingClientRect().bottom).toBeLessThanOrEqual(window.innerHeight)
    expect(body().scrollHeight).toBeGreaterThan(body().clientHeight)
    expect(getComputedStyle(body()).overflowY).toBe('auto')
  })

  it('shows the last item when ArrowUp opens the menu, without scrolling the page', async () => {
    await page.viewport(1280, 320)
    renderInBrowser(tall)
    window.scrollTo(0, 0)
    await openWithKey('{ArrowUp}')

    await expect.poll(focused).toBe('Language 40')
    await expect.poll(() => within(document.activeElement as Element, body())).toBe(true)
    expect(window.scrollY).toBe(0)
  })

  it('scrolls the focused item into view as the arrows and the typed letters move on, without scrolling the page', async () => {
    await page.viewport(1280, 320)
    renderInBrowser(tall)
    window.scrollTo(0, 0)
    await openByClick()
    await expect.poll(focused).toBe('Language 01')

    await userEvent.keyboard('{End}')
    await expect.poll(focused).toBe('Language 40')
    await expect.poll(() => within(document.activeElement as Element, body())).toBe(true)

    await userEvent.keyboard('{Home}')
    await expect.poll(focused).toBe('Language 01')
    await expect.poll(() => within(document.activeElement as Element, body())).toBe(true)
    expect(body().scrollTop).toBe(0)

    for (let step = 0; step < 15; step += 1) await userEvent.keyboard('{ArrowDown}')

    await expect.poll(focused).toBe('Language 16')
    await expect.poll(() => within(document.activeElement as Element, body())).toBe(true)
    expect(body().scrollTop).toBeGreaterThan(0)
    expect(window.scrollY).toBe(0)
  })
})

describe('Menu from its hooks', () => {
  const open = async (items: MenuEntry[]) => {
    renderInBrowser(
      <Menu defaultOpen label="Actions" items={items}>
        <button>Open</button>
      </Menu>
    )
    await expect.poll(() => parts('menu').length).toBe(1)
  }

  it('takes the room of the list, the gap and the padding of the items from their hooks', async () => {
    onRoot({
      '--enchase-menu-min-width': '321px',
      '--enchase-menu-padding-block': '3px',
      '--enchase-menu-padding-inline': '5px',
      '--enchase-menu-item-padding-block': '7px',
      '--enchase-menu-item-padding-inline': '9px',
      '--enchase-menu-item-gap': '11px'
    })
    await open([{ id: 'edit', label: 'Edit', icon: <svg /> }])

    expect(style('menu').minWidth).toBe('321px')
    expect([style('menu').paddingTop, style('menu').paddingBottom, style('menu').paddingLeft, style('menu').paddingRight]).toEqual(['3px', '3px', '5px', '5px'])
    expect([style('menu-item').paddingTop, style('menu-item').paddingBottom, style('menu-item').paddingLeft, style('menu-item').paddingRight]).toEqual(['7px', '7px', '9px', '9px'])
    expect(style('menu-item').columnGap).toBe('11px')
  })

  it('takes the type, the corners and the colors of the items from their hooks', async () => {
    onRoot({
      '--enchase-menu-item-font-size': '13px',
      '--enchase-menu-item-font-weight': '650',
      '--enchase-menu-item-line-height': '21px',
      '--enchase-menu-item-radius': '13px',
      '--enchase-menu-item-color': 'rgb(1, 2, 3)',
      '--enchase-menu-item-color-disabled': 'rgb(4, 5, 6)'
    })
    await open([
      { id: 'edit', label: 'Edit' },
      { id: 'archive', label: 'Archive', disabled: true }
    ])
    const [edit, archive] = [0, 1].map((index) => getComputedStyle(parts('menu-item')[index]))

    expect([edit.fontSize, edit.fontWeight, edit.lineHeight, edit.borderTopLeftRadius, edit.color]).toEqual(['13px', '650', '21px', '13px', 'rgb(1, 2, 3)'])
    expect(archive.color).toBe('rgb(4, 5, 6)')
  })

  it('takes the size of the icon and the look of the separator from their hooks', async () => {
    onRoot({
      '--enchase-menu-item-icon-width': '17px',
      '--enchase-menu-item-icon-height': '19px',
      '--enchase-menu-separator-margin-block': '6px',
      '--enchase-menu-separator-margin-inline': '2px',
      '--enchase-menu-separator-background': 'rgb(7, 8, 9)'
    })
    await open([
      { id: 'edit', label: 'Edit', icon: <svg /> },
      { id: 'split', separator: true },
      { id: 'delete', label: 'Delete' }
    ])

    expect([style('menu-item-icon').width, style('menu-item-icon').height]).toEqual(['17px', '19px'])
    expect([style('menu-separator').marginTop, style('menu-separator').marginBottom, style('menu-separator').marginLeft, style('menu-separator').marginRight]).toEqual(['6px', '6px', '2px', '2px'])
    expect(style('menu-separator').backgroundColor).toBe('rgb(7, 8, 9)')
  })

  it('eases the color of the items for as long as the animation says', async () => {
    renderInBrowser(
      <Menu defaultOpen label="Actions" items={entries()} animation={{ tuning: { duration: 0.4 } }}>
        <button>Open</button>
      </Menu>,
      'auto'
    )
    await expect.poll(() => parts('menu-item').length).toBe(4)

    expect(style('menu-item').transitionDuration.split(',').map((value) => value.trim())).toEqual(['0.4s', '0.4s'])
  })

  it('does not ease anything when the animation is off', async () => {
    renderInBrowser(
      <Menu defaultOpen label="Actions" items={entries()} animation={false}>
        <button>Open</button>
      </Menu>,
      'auto'
    )
    await expect.poll(() => parts('menu-item').length).toBe(4)

    expect(style('menu-item').transitionDuration.split(',').map((value) => value.trim())).toEqual(['0s', '0s'])
  })
})
