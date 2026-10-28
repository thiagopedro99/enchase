import { describePortalContainerContract } from '@tests/shared/contracts/portalContainerContract.tsx'
import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { useState } from 'react'
import { axe } from '@tests/axe.ts'

import { Menu } from '@components/common/Menu/index.tsx'

import type { MenuEntry } from '@components/common/Menu/types.ts'

const entries = (onSelect: (id: string) => void = () => undefined): MenuEntry[] => [
  { id: 'edit', label: 'Edit', onSelect: () => onSelect('edit') },
  { id: 'duplicate', label: 'Duplicate', onSelect: () => onSelect('duplicate') },
  { id: 'split', separator: true },
  { id: 'archive', label: 'Archive', disabled: true, onSelect: () => onSelect('archive') },
  { id: 'delete', label: 'Delete', onSelect: () => onSelect('delete') }
]

const page = (items: MenuEntry[] = entries()) => (
  <div>
    <button>Before</button>
    <Menu label="Actions" items={items}>
      <button>Open</button>
    </Menu>
    <button>After</button>
  </div>
)

const trigger = () => screen.getByRole('button', { name: 'Open' })

const item = (name: string) => screen.getByRole('menuitem', { name })

const closed = () => waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())

describePortalContainerContract({
  name: 'Menu',
  slot: 'popover-content',
  render: (container) => (
    <Menu open label="Actions" items={entries()} container={container} onOpenChange={vi.fn()}>
      <button>Open</button>
    </Menu>
  )
})

describe('Menu', () => {
  it('keeps the menu out of the page until it opens, and names it on the trigger', async () => {
    const user = userEvent.setup()
    renderWithProviders(page())

    expect(trigger()).toHaveAttribute('aria-haspopup', 'menu')
    expect(trigger()).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()

    await user.click(trigger())
    const menu = await screen.findByRole('menu', { name: 'Actions' })

    expect(trigger()).toHaveAttribute('aria-expanded', 'true')
    expect(trigger()).toHaveAttribute('aria-controls', menu.id)
  })

  it('lists the items, the separator and the state of the disabled item', async () => {
    const user = userEvent.setup()
    renderWithProviders(page())

    await user.click(trigger())
    await screen.findByRole('menu')

    expect(screen.getAllByRole('menuitem').map((element) => element.textContent)).toEqual(['Edit', 'Duplicate', 'Archive', 'Delete'])
    expect(screen.getAllByRole('separator')).toHaveLength(1)
    expect(item('Archive')).toHaveAttribute('aria-disabled', 'true')
    expect(item('Edit')).not.toHaveAttribute('aria-disabled')
  })

  it.each([
    ['a click', async (user: ReturnType<typeof userEvent.setup>) => user.click(trigger()), 'Edit'],
    ['Enter', async (user: ReturnType<typeof userEvent.setup>) => { trigger().focus(); await user.keyboard('{Enter}') }, 'Edit'],
    ['Space', async (user: ReturnType<typeof userEvent.setup>) => { trigger().focus(); await user.keyboard(' ') }, 'Edit'],
    ['ArrowDown', async (user: ReturnType<typeof userEvent.setup>) => { trigger().focus(); await user.keyboard('{ArrowDown}') }, 'Edit'],
    ['ArrowUp', async (user: ReturnType<typeof userEvent.setup>) => { trigger().focus(); await user.keyboard('{ArrowUp}') }, 'Delete']
  ] as const)('opens with %s and focuses the item %s', async (_, open, focused) => {
    const user = userEvent.setup()
    renderWithProviders(page())

    await open(user)
    await screen.findByRole('menu')

    await waitFor(() => expect(item(focused)).toHaveFocus())
  })

  it('moves the focus with the arrows, wrapping around and skipping the disabled item', async () => {
    const user = userEvent.setup()
    renderWithProviders(page())

    await user.click(trigger())
    await waitFor(() => expect(item('Edit')).toHaveFocus())
    await user.keyboard('{ArrowDown}')
    expect(item('Duplicate')).toHaveFocus()
    await user.keyboard('{ArrowDown}')
    expect(item('Delete')).toHaveFocus()
    await user.keyboard('{ArrowDown}')
    expect(item('Edit')).toHaveFocus()
    await user.keyboard('{ArrowUp}')
    expect(item('Delete')).toHaveFocus()
    await user.keyboard('{ArrowUp}')
    expect(item('Duplicate')).toHaveFocus()
  })

  it('goes to the first and to the last enabled item with Home and End', async () => {
    const user = userEvent.setup()
    renderWithProviders(page())

    await user.click(trigger())
    await waitFor(() => expect(item('Edit')).toHaveFocus())
    await user.keyboard('{End}')
    expect(item('Delete')).toHaveFocus()
    await user.keyboard('{Home}')
    expect(item('Edit')).toHaveFocus()
  })

  it('jumps to the item that starts with the typed letters and cycles through the ones that share the first', async () => {
    const user = userEvent.setup()
    renderWithProviders(page())

    await user.click(trigger())
    await waitFor(() => expect(item('Edit')).toHaveFocus())
    await user.keyboard('d')
    expect(item('Duplicate')).toHaveFocus()
    await user.keyboard('d')
    expect(item('Delete')).toHaveFocus()
  })

  it('types ahead on the text value when the label is not a string', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      page([
        { id: 'one', label: <span>Alpha</span>, textValue: 'Alpha' },
        { id: 'two', label: <strong>Beta</strong>, textValue: 'Beta' }
      ])
    )

    await user.click(trigger())
    await waitFor(() => expect(screen.getAllByRole('menuitem')[0]).toHaveFocus())
    await user.keyboard('b')

    expect(screen.getAllByRole('menuitem')[1]).toHaveFocus()
  })

  it('keeps one item in the tab order and moves it with the focus', async () => {
    const user = userEvent.setup()
    renderWithProviders(page())

    await user.click(trigger())
    await waitFor(() => expect(item('Edit')).toHaveFocus())

    expect(screen.getAllByRole('menuitem').map((element) => element.tabIndex)).toEqual([0, -1, -1, -1])

    await user.keyboard('{ArrowDown}')

    expect(screen.getAllByRole('menuitem').map((element) => element.tabIndex)).toEqual([-1, 0, -1, -1])
  })

  it('keeps the tab stop on an enabled item when a disabled item is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(page())

    await user.click(trigger())
    await waitFor(() => expect(item('Edit')).toHaveFocus())
    await user.click(item('Archive'))

    expect(item('Archive').tabIndex).toBe(-1)
    expect(item('Edit').tabIndex).toBe(0)
  })

  it.each([
    ['a click', async (user: ReturnType<typeof userEvent.setup>) => user.click(item('Duplicate'))],
    ['Enter', async (user: ReturnType<typeof userEvent.setup>) => { item('Duplicate').focus(); await user.keyboard('{Enter}') }],
    ['Space', async (user: ReturnType<typeof userEvent.setup>) => { item('Duplicate').focus(); await user.keyboard(' ') }]
  ] as const)('selects an item with %s, closes the menu and gives the focus back to the trigger', async (_, select) => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    renderWithProviders(page(entries(onSelect)))

    await user.click(trigger())
    await screen.findByRole('menu')
    await select(user)

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith('duplicate')
    await closed()
    expect(trigger()).toHaveFocus()
  })

  it('does nothing when a disabled item is clicked, and leaves the menu open', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    renderWithProviders(page(entries(onSelect)))

    await user.click(trigger())
    await screen.findByRole('menu')
    await user.click(item('Archive'))

    expect(onSelect).not.toHaveBeenCalled()
    expect(screen.getByRole('menu')).toBeInTheDocument()
  })

  it('closes with Escape and gives the focus back to the trigger', async () => {
    const user = userEvent.setup()
    renderWithProviders(page())

    await user.click(trigger())
    await waitFor(() => expect(item('Edit')).toHaveFocus())
    await user.keyboard('{Escape}')

    await closed()
    expect(trigger()).toHaveFocus()
  })

  it('closes with Tab and takes the focus to the next element after the trigger', async () => {
    const user = userEvent.setup()
    renderWithProviders(page())

    await user.click(trigger())
    await waitFor(() => expect(item('Edit')).toHaveFocus())
    await user.tab()

    await waitFor(() => expect(screen.getByRole('button', { name: 'After' })).toHaveFocus())
    await closed()
  })

  it('closes with Shift+Tab and gives the focus back to the trigger', async () => {
    const user = userEvent.setup()
    renderWithProviders(page())

    await user.click(trigger())
    await waitFor(() => expect(item('Edit')).toHaveFocus())
    await user.tab({ shift: true })

    await waitFor(() => expect(trigger()).toHaveFocus())
    await closed()
  })

  it('closes when the page outside it is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(page())

    await user.click(trigger())
    await screen.findByRole('menu')
    await user.click(screen.getByRole('button', { name: 'Before' }))

    await closed()
  })

  it('keeps the handlers of the trigger and does not open when its key handler prevents the default', async () => {
    const user = userEvent.setup()
    const onKeyDown = vi.fn((event: { preventDefault: () => void }) => event.preventDefault())
    const onClick = vi.fn()

    renderWithProviders(
      <Menu label="Actions" items={entries()}>
        <button onKeyDown={onKeyDown} onClick={onClick}>
          Open
        </button>
      </Menu>
    )
    trigger().focus()
    await user.keyboard('{ArrowDown}')

    expect(onKeyDown).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()

    await user.click(trigger())

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(await screen.findByRole('menu')).toBeInTheDocument()
  })

  it('can be controlled, and an open default menu does not take the focus', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()

    const Controlled = () => {
      const [open, setOpen] = useState(false)

      return (
        <Menu
          label="Actions"
          items={entries()}
          open={open}
          onOpenChange={(next) => {
            onOpenChange(next)
            setOpen(next)
          }}
        >
          <button>Open</button>
        </Menu>
      )
    }

    const { unmount } = renderWithProviders(<Controlled />)

    await user.click(trigger())
    await screen.findByRole('menu')
    await user.click(item('Edit'))

    expect(onOpenChange.mock.calls.map(([next]) => next)).toEqual([true, false])
    await closed()
    unmount()

    renderWithProviders(
      <Menu defaultOpen label="Actions" items={entries()}>
        <button>Open</button>
      </Menu>
    )
    await screen.findByRole('menu')

    expect(screen.getAllByRole('menuitem').every((element) => element !== document.activeElement)).toBe(true)
  })

  it('does not take the focus when the menu is opened from outside after a click on the button closed it', async () => {
    const user = userEvent.setup()

    const Outside = () => {
      const [open, setOpen] = useState(false)

      return (
        <>
          <button onClick={() => setOpen(true)}>Open from outside</button>
          <Menu label="Actions" items={entries()} open={open} onOpenChange={setOpen}>
            <button>Open</button>
          </Menu>
        </>
      )
    }

    renderWithProviders(<Outside />)
    await user.click(trigger())
    await waitFor(() => expect(item('Edit')).toHaveFocus())
    await user.click(trigger())
    await closed()
    await user.click(screen.getByRole('button', { name: 'Open from outside' }))
    await screen.findByRole('menu')

    expect(screen.getAllByRole('menuitem').every((element) => element !== document.activeElement)).toBe(true)
  })

  it('shows the icon of an item hidden from assistive technology, apart from its label', async () => {
    const user = userEvent.setup()
    renderWithProviders(page([{ id: 'edit', label: 'Edit', icon: <svg data-testid="pen" /> }]))

    await user.click(trigger())
    const icon = (await screen.findByTestId('pen')).parentElement as HTMLElement

    expect(icon).toHaveAttribute('aria-hidden', 'true')
    expect(icon).toHaveAttribute('data-slot', 'menu-item-icon')
    expect(item('Edit')).toHaveAccessibleName('Edit')
  })

  it('marks the parts with slots and lets the user class and style win', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Menu label="Actions" items={entries()} className="mine" style={{ color: 'rgb(1, 2, 3)' }} contentClassName="panel" contentStyle={{ color: 'rgb(4, 5, 6)' }}>
        <button>Open</button>
      </Menu>
    )

    await user.click(trigger())
    const menu = await screen.findByRole('menu')

    expect(menu).toHaveAttribute('data-slot', 'popover-content')
    expect(menu.className.split(' ')).toContain('panel')
    expect(menu).toHaveStyle({ color: 'rgb(4, 5, 6)' })
    expect(document.querySelector('[data-slot="popover-trigger"]')).toHaveClass('mine')
    expect(menu.querySelector('[data-slot="menu"]')).toBeInTheDocument()
    expect(menu.querySelectorAll('[data-slot="menu-item"]')).toHaveLength(4)
    expect(menu.querySelectorAll('[data-slot="menu-item-label"]')).toHaveLength(4)
    expect(menu.querySelector('[data-slot="menu-separator"]')).toBeInTheDocument()
  })

  it('turns the motion variables to zero when the animation is off', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Menu label="Actions" items={entries()} animation={false}>
        <button>Open</button>
      </Menu>
    )

    await user.click(trigger())
    const list = (await screen.findByRole('menu')).querySelector('[data-slot="menu"]') as HTMLElement

    expect(list.style.getPropertyValue('--enchase-menu-duration')).toBe('0ms')
  })

  it('has no axe violations while open', async () => {
    const user = userEvent.setup()
    renderWithProviders(page())

    await user.click(trigger())
    const menu = await screen.findByRole('menu')

    expect(await axe(menu)).toHaveNoViolations()
  })

  it('renders an optional prop that is passed as undefined exactly as if it was omitted', async () => {
    const required = { open: true, label: 'Actions', items: entries(), children: <button>Open</button> }

    const explicit = {
      defaultOpen: undefined,
      onOpenChange: undefined,
      placement: undefined,
      offset: undefined,
      container: undefined,
      animation: undefined,
      className: undefined,
      style: undefined,
      contentClassName: undefined,
      contentStyle: undefined
    }

    const rendered = async (props: Record<string, unknown>) => {
      const view = renderWithProviders(<Menu {...required} {...props} />)

      await waitFor(() => expect(screen.getByRole('menu')).toHaveAttribute('data-state', 'open'))

      const html = screen.getByRole('menu').outerHTML.replace(/_r_[a-z0-9]+_/g, '#')

      view.unmount()

      return html
    }

    const omitted = await rendered({})

    expect(await rendered(explicit)).toBe(omitted)
  })
})
