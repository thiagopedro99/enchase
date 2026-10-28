import { useState } from 'react'
import { Button, Flex, Menu } from 'enchase'
import { ExternalLinkIcon, EyeIcon, LogOutIcon, PlusIcon } from 'enchase/icons'
import { containerArgType } from '@docs/shared/argTypes.ts'
import { actions, defaultOffset, defaultOpen, defaultPlacement, languages, placements } from './defaultData.ts'

import type { Meta, StoryObj } from '@storybook/react-vite'
import type { MenuEntry } from 'enchase'

const SelectionDemo = () => {
  const [last, setLast] = useState('nothing yet')

  const items: MenuEntry[] = [
    { id: 'edit', label: 'Edit', onSelect: () => setLast('Edit') },
    { id: 'duplicate', label: 'Duplicate', onSelect: () => setLast('Duplicate') },
    { id: 'delete', label: 'Delete', onSelect: () => setLast('Delete') }
  ]

  return (
    <Flex align="center" gap="1rem" wrap>
      <Menu label="Actions" items={items}>
        <Button variant="outline">Actions</Button>
      </Menu>
      <span aria-live="polite">Last action: {last}</span>
    </Flex>
  )
}

const ControlledDemo = () => {
  const [open, setOpen] = useState(false)

  return (
    <Flex align="center" gap="1rem" wrap>
      <Menu label="Actions" items={actions} open={open} onOpenChange={setOpen}>
        <Button variant="outline">Actions</Button>
      </Menu>
      <Button variant="ghost" onClick={() => setOpen((current) => !current)}>
        {open ? 'Close from outside' : 'Open from outside'}
      </Button>
    </Flex>
  )
}

const meta = {
  title: 'Components/Menu',
  component: Menu,
  args: {
    label: 'Actions',
    items: actions,
    placement: defaultPlacement,
    offset: defaultOffset,
    defaultOpen,
    children: <Button variant="outline">Actions</Button>
  },
  parameters: {
    docs: {
      description: {
        component:
          'A button that opens a list of actions. It is a `Popover` with `role="menu"`: the arrow keys, Home and End move through the items, typing letters jumps to the item that starts with them, Enter, Space or a click chooses the item, and the menu closes and gives the focus back to the button. Esc closes it too, and Tab closes it and moves the focus on, as in the menus of the operating system. Use it for commands, such as the actions of a row. For a choice that stays selected, use the `Select`; for a panel with fields or text, use the `Popover`.'
      }
    }
  },
  argTypes: {
    items: {
      description: 'The entries of the menu, in order. An item is { id, label, textValue?, icon?, disabled?, onSelect? } and a separator is { id, separator: true }. The label is any node; give textValue when it is not a string, so that typing letters can find the item. A disabled item is announced as unavailable, is skipped by the arrow keys and by typing, and does nothing when it is clicked.',
      control: false
    },
    label: { description: 'Accessible name of the menu (aria-label of the list). It is not shown: name what the actions are about.', control: 'text' },
    open: { description: 'Opens and closes the menu, when you control it. Use it together with onOpenChange.', control: false },
    defaultOpen: { description: 'Whether the menu starts open, when you do not control it. An open menu does not take the focus until the user interacts.', control: 'boolean', table: { defaultValue: { summary: String(defaultOpen) } } },
    onOpenChange: { description: 'Called with the new state whenever the menu opens or closes: click, keyboard, Esc, a click outside or a chosen item.', control: false },
    placement: {
      description: 'Side and alignment relative to the button. start and end follow the direction of the UIProvider. Near the edge the menu flips to the other side, slides to fit and shrinks to the available space, scrolling inside.',
      control: 'select',
      options: placements,
      table: { defaultValue: { summary: defaultPlacement } }
    },
    offset: { description: 'Distance in px between the button and the menu.', control: 'number', table: { defaultValue: { summary: String(defaultOffset) } } },
    container: containerArgType,
    animation: { description: 'false turns off the motion; { tuning: { duration } } changes how long the menu takes to appear and the hover color to change.', control: false },
    className: { description: 'Class of the wrapper around the button (data-slot="popover-trigger"). It wins over the library class without !important.', control: false },
    style: { description: 'Style of the wrapper around the button, merged with the library style (yours wins).', control: false },
    contentClassName: { description: 'Class of the box of the menu (data-slot="popover-content"): the background, the border and the shadow. The list inside is data-slot="menu" and each item is data-slot="menu-item".', control: false },
    contentStyle: { description: 'Style of the box of the menu, merged with the library style (yours wins).', control: false },
    children: { description: 'The element that opens the menu, normally a button. It receives aria-haspopup, aria-expanded and aria-controls, and the arrow keys: ArrowDown opens the menu on the first item and ArrowUp on the last.', control: false }
  }
} satisfies Meta<typeof Menu>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithIcons: Story = {
  args: {
    label: 'Page',
    items: [
      { id: 'new', label: 'New page', icon: <PlusIcon /> },
      { id: 'preview', label: 'Preview', icon: <EyeIcon /> },
      { id: 'open', label: 'Open in a new tab', icon: <ExternalLinkIcon /> },
      { id: 'separator', separator: true },
      { id: 'sign-out', label: 'Sign out', icon: <LogOutIcon /> }
    ],
    children: <Button variant="outline">Page</Button>
  },
  parameters: {
    docs: { description: { story: 'An icon is decorative: it is hidden from assistive technology and the label is what names the item.' } }
  }
}

export const Selection: Story = {
  parameters: {
    controls: { disable: true },
    docs: { description: { story: 'Choosing an item calls its `onSelect`, closes the menu and gives the focus back to the button. Try it with the keyboard: ArrowDown on the button opens the menu, and Enter chooses.' } }
  },
  render: () => <SelectionDemo />
}

export const Controlled: Story = {
  parameters: {
    controls: { disable: true },
    docs: { description: { story: 'With `open` and `onOpenChange` you keep the state, for example to close the menu from somewhere else.' } }
  },
  render: () => <ControlledDemo />
}

export const LongList: Story = {
  args: {
    label: 'Language',
    items: languages.map((name) => ({ id: name.toLowerCase(), label: name })),
    children: <Button variant="outline">Language</Button>
  },
  parameters: {
    docs: { description: { story: 'The menu takes the room it has and scrolls inside when the list is longer. Type the first letters of a language to jump to it; typing the same letter again goes to the next one that starts with it.' } }
  }
}

export const WithoutMotion: Story = {
  args: { animation: false }
}
