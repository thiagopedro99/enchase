import { useState } from 'react'
import { Button, Modal, Popover } from 'enchase'
import { containerArgType } from '@docs/shared/argTypes.ts'

import { defaultArrow, defaultCloseOnEsc, defaultCloseOnOutsideClick, defaultOffset, defaultPadding, defaultPlacement, defaultRole, placements } from './defaultData.ts'

import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ComponentProps } from 'react'

const panel = (
  <div style={{ display: 'grid', gap: '0.5rem', inlineSize: '16rem' }}>
    <strong>Order details</strong>
    <span>Three items, delivery expected on Friday.</span>
    <Button size="sm">View order</Button>
  </div>
)

const meta = {
  title: 'Components/Popover',
  component: Popover,
  args: {
    placement: defaultPlacement,
    offset: defaultOffset,
    padding: defaultPadding,
    role: defaultRole,
    arrow: defaultArrow,
    closeOnEsc: defaultCloseOnEsc,
    closeOnOutsideClick: defaultCloseOnOutsideClick,
    label: 'Order details',
    content: panel,
    children: <Button>Open details</Button>
  },
  parameters: {
    docs: {
      description: {
        component: 'A floating panel attached to a trigger. Its position adjusts itself near the edge (it flips to the other side, slides and shrinks), the focus is managed, and Esc or a click outside closes it.'
      }
    }
  },
  argTypes: {
    placement: {
      description: 'Side and alignment relative to the trigger. start and end follow the direction of the UIProvider. Near the edge the popover flips to the other side, slides to fit and shrinks to the available space.',
      control: 'select',
      options: placements,
      table: { defaultValue: { summary: defaultPlacement } }
    },
    offset: {
      description: 'Distance in px between the trigger and the popover.',
      control: 'number',
      table: { defaultValue: { summary: String(defaultOffset) } }
    },
    padding: {
      description: 'Margin in px to the edge of the window.',
      control: 'number',
      table: { defaultValue: { summary: String(defaultPadding) } }
    },
    role: {
      description: 'Role of the content, which also becomes aria-haspopup on the trigger. The default is dialog. With menu, Tab closes the popup and moves the focus on, but the arrow-key navigation and the items are yours: use Menu for the whole pattern.',
      control: 'select',
      options: ['dialog', 'listbox', 'tree', 'grid', 'menu'],
      table: { defaultValue: { summary: defaultRole } }
    },
    label: {
      description: 'Accessible name of the content (aria-label).',
      control: 'text'
    },
    arrow: {
      description: 'Shows an arrow that points to the trigger. When the box has a border (--enchase-popover-content-border-width), the arrow carries the border on its two outer sides.',
      control: 'boolean',
      table: { defaultValue: { summary: String(defaultArrow) } }
    },
    closeOnEsc: {
      description: 'Esc closes only the top layer and returns the focus to the trigger.',
      control: 'boolean',
      table: { defaultValue: { summary: String(defaultCloseOnEsc) } }
    },
    closeOnOutsideClick: {
      description: 'A click outside closes the popover without taking the focus away from where the click landed.',
      control: 'boolean',
      table: { defaultValue: { summary: String(defaultCloseOnOutsideClick) } }
    },
    open: {
      description: 'Controlled state. Without it, the component keeps its own state (defaultOpen and onOpenChange).',
      control: 'boolean'
    },
    defaultOpen: {
      description: 'Initial state when the popover is uncontrolled.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } }
    },
    onOpenChange: {
      description: 'Called with the new state when the user opens or closes it: click on the trigger, Esc or a click outside. Combine it with open to control it from outside.',
      control: false
    },
    container: containerArgType,
    animation: {
      description: 'false turns off the transition. { recipe: "fade" } swaps the pop for a fade; { tuning: { duration, scale } } adjusts the duration and the scale.',
      control: 'object',
      table: { type: { summary: 'false | { recipe, tuning }' }, defaultValue: { summary: 'pop' } }
    },
    className: {
      description: 'Class of the element that wraps the trigger (data-slot="popover-trigger").',
      control: 'text'
    },
    contentClassName: {
      description: 'Class of the content (data-slot="popover-content"), the box that carries the background, the border, the shadow and the arrow. What scrolls and carries the padding is the body (data-slot="popover-body"). You can also style it by data-state and data-placement.',
      control: 'text'
    },
    children: {
      description: 'The trigger: a click on it opens and closes the popover. It sits inside a span (data-slot="popover-trigger") and, when it is a React element, receives aria-expanded, aria-controls and aria-haspopup.',
      control: false
    },
    content: {
      description: 'Content of the popover. It renders in a portal on the body, only while the popover is open and during the exit.',
      control: false
    },
    style: { description: 'Style of the element that wraps the trigger.', control: false },
    contentStyle: { description: 'Style of the content.', control: false }
  }
} satisfies Meta<typeof Popover>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithArrow: Story = {
  args: { arrow: true }
}

export const Placements: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: '1.5rem', padding: '8rem 4rem', flexWrap: 'wrap' }}>
      {(['top', 'bottom', 'start', 'end'] as const).map((placement) => (
        <Popover key={placement} {...args} placement={placement}>
          <Button variant="outline">{placement}</Button>
        </Popover>
      ))}
    </div>
  )
}

const ModalDemo = (args: ComponentProps<typeof Popover>) => {
  const [open, setOpen] = useState(true)

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open modal</Button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Modal with popover">
        <Popover {...args}>
          <Button variant="outline">Open popover</Button>
        </Popover>
      </Modal>
    </>
  )
}

export const OverAModal: Story = {
  render: (args) => <ModalDemo {...args} />
}

export const NoAnimation: Story = {
  args: { animation: false }
}
