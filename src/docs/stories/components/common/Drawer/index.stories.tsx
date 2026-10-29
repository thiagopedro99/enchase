import { useState } from 'react'
import { Button, Drawer, Flex } from 'enchase'
import { containerArgType } from '@docs/shared/argTypes.ts'
import { defaultCloseOnEsc, defaultCloseOnOverlayClick, defaultShowCloseButton, defaultSide, defaultSize, filters, sides, sizes } from './defaultData.ts'

import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

type DrawerDemoProps = ComponentProps<typeof Drawer> & { label: string }

const DrawerDemo = ({ label, ...args }: DrawerDemoProps) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>{label}</Button>
      <Drawer {...args} open={open} onClose={() => setOpen(false)} />
    </>
  )
}

const SizesDemo = () => {
  const [size, setSize] = useState<(typeof sizes)[number] | null>(null)

  return (
    <>
      <Flex gap="0.75rem" wrap>
        {sizes.map((name) => (
          <Button key={name} variant="outline" onClick={() => setSize(name)}>
            Open {name}
          </Button>
        ))}
      </Flex>

      <Drawer open={size !== null} onClose={() => setSize(null)} title={`Size ${size ?? defaultSize}`} size={size ?? defaultSize}>
        The panel is as wide as its size says, and never wider than 90% of the screen.
      </Drawer>
    </>
  )
}

const meta = {
  title: 'Components/Drawer',
  component: Drawer,
  args: {
    open: false,
    onClose: () => undefined,
    title: 'Filters',
    children: 'The focus stays trapped in the panel, the page behind it is inert and Esc returns the focus to the button.',
    side: defaultSide,
    size: defaultSize,
    showCloseButton: defaultShowCloseButton,
    closeOnOverlayClick: defaultCloseOnOverlayClick,
    closeOnEsc: defaultCloseOnEsc
  },
  parameters: {
    docs: {
      description: {
        component:
          'A panel that slides in from the edge of the page, rendered in a portal like the `Modal`: the focus stays trapped in the panel, the page behind it is inert and the scroll of the page is locked, and Esc or a click on the overlay closes it. It is always controlled by `open` and `onClose`. The side follows the direction of the page, so `start` is the right edge in a right-to-left page. Use it for a menu, a filter panel or a form that should not take the whole screen. When the content is taller than the panel, the body scrolls and becomes a focusable region named by the title (or by `ariaLabel`), so a keyboard user can scroll it.'
      }
    }
  },
  argTypes: {
    open: {
      description: 'Opens and closes the drawer. It is always controlled: you keep the state and change it in onClose. It renders in a portal on the body, only after mounting, and stays mounted until the exit animation ends.',
      control: false
    },
    onClose: {
      description: 'Called when the user asks to close: close button, click on the overlay or Esc, depending on showCloseButton, closeOnOverlayClick and closeOnEsc. The drawer does not close itself.',
      control: false
    },
    title: { description: 'Title of the drawer (h2), which gives the accessible name. Without it, use ariaLabel.', control: 'text' },
    ariaLabel: { description: 'Accessible name of the drawer when there is no title.', control: 'text' },
    side: {
      description: 'Edge of the page the panel slides in from. start is the left edge in a left-to-right page and the right edge in a right-to-left one; end is the opposite.',
      control: 'inline-radio',
      options: sides,
      table: { defaultValue: { summary: `'${defaultSide}'` } }
    },
    size: {
      description: 'Width of the panel: sm is 320 px, md is 400 px and lg is 560 px, and it is never wider than 90% of the screen.',
      control: 'inline-radio',
      options: sizes,
      table: { defaultValue: { summary: `'${defaultSize}'` } }
    },
    showCloseButton: { description: 'Shows the close button in the header.', control: 'boolean', table: { defaultValue: { summary: String(defaultShowCloseButton) } } },
    closeOnOverlayClick: { description: 'Closes when the overlay is clicked.', control: 'boolean', table: { defaultValue: { summary: String(defaultCloseOnOverlayClick) } } },
    closeOnEsc: { description: 'Closes with Esc. With stacked overlays, only the top one closes.', control: 'boolean', table: { defaultValue: { summary: String(defaultCloseOnEsc) } } },
    className: { description: 'Class of the panel. It wins over the library class without !important.', control: false },
    style: { description: 'Style of the panel, merged with the library style (yours wins).', control: false },
    container: containerArgType,
    animation: { description: 'false turns off the motion; { tuning: { duration } } changes how long the slide takes. The panel always travels at least its own width.', control: false },
    children: { description: 'Content of the drawer body, which scrolls when it is taller than the screen.', control: 'text' },
    footer: { description: 'Fixed content below the body, such as the action buttons.', control: false }
  }
} satisfies Meta<typeof Drawer>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => <DrawerDemo {...args} label="Open drawer" footer={<Button>Apply filters</Button>} />
}

export const FromTheEnd: Story = {
  args: { side: 'end', title: 'Notifications' },
  render: (args) => <DrawerDemo {...args} label="Open from the end" />
}

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => <SizesDemo />
}

export const LongContent: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'The header and the footer stay in place and the body scrolls when the content is taller than the screen. While it scrolls, the body is a region that Tab reaches, named by the title, so a keyboard user can scroll it with the arrow keys and Page Down.'
      }
    }
  },
  render: (args) => (
    <DrawerDemo {...args} label="Open with long content" footer={<Button>Apply filters</Button>}>
      <ul style={{ margin: 0, paddingInlineStart: '1.25rem' }}>
        {[...filters, ...filters, ...filters].map((name, index) => (
          <li key={`${name}-${index}`}>{name}</li>
        ))}
      </ul>
    </DrawerDemo>
  )
}

export const WithoutMotion: Story = {
  render: (args) => <DrawerDemo {...args} label="Open without animation" animation={false} />
}
