import { Button, Tooltip } from 'enchase'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Components/Tooltip',
  component: Tooltip,
  args: {
    text: 'Save changes',
    position: 'top',
    describe: true,
    openDelay: 0,
    closeDelay: 120,
    children: <Button>Save</Button>
  },
  parameters: {
    docs: {
      description: {
        component: 'A text tooltip for a trigger, opened by pointer and by focus. It gives the trigger an accessible description and adjusts its position near the edge of the screen. Esc closes an open tooltip but is not intercepted: a `Modal` or `Popover` around the trigger receives the same key.'
      }
    }
  },
  argTypes: {
    text: {
      description: 'Text of the tooltip. With describe on, it also becomes the accessible description of the trigger.',
      control: 'text'
    },
    position: {
      description: 'Side of the trigger where the tooltip appears. start and end follow the direction of the UIProvider (left and right in ltr, the reverse in rtl). Near the edge of the screen the tooltip flips to the other side and shifts to fit.',
      control: 'select',
      options: ['top', 'bottom', 'left', 'right', 'start', 'end'],
      table: { defaultValue: { summary: 'top' } }
    },
    describe: {
      description: 'Turns on the accessible description of the trigger. Turn it off when the trigger already has the same text as its name, like an icon-only button.',
      control: 'boolean',
      table: { defaultValue: { summary: 'true' } }
    },
    openDelay: {
      description: 'Milliseconds between entering the trigger and showing the tooltip. 0 shows it at once. With another tooltip open, or one closed less than 300 ms ago, the next one opens without waiting and without animation.',
      control: 'number',
      table: { defaultValue: { summary: '100' } }
    },
    closeDelay: {
      description: 'Milliseconds between leaving the trigger and hiding the tooltip. Moving the pointer onto the tooltip itself keeps it open.',
      control: 'number',
      table: { defaultValue: { summary: '120' } }
    },
    animation: {
      description: 'false turns off the transition. The default recipe is "pop", a fade with a light scale; { recipe: "fade" } only fades; { tuning: { duration } } changes the duration in seconds.',
      control: 'object',
      table: { type: { summary: 'false | { recipe, tuning }' }, defaultValue: { summary: 'pop' } }
    },
    className: {
      description: 'Class of the element that wraps the trigger (data-slot="tooltip-trigger").',
      control: 'text'
    },
    bubbleClassName: {
      description: 'Class of the tooltip (data-slot="tooltip-bubble"). You can also style it by data-slot, data-position and data-state.',
      control: 'text'
    },
    children: { description: 'The trigger. It sits inside a div (data-slot="tooltip-trigger") and, with describe on, receives aria-describedby.', control: false },
    style: { description: 'Style of the element that wraps the trigger.', control: false },
    bubbleStyle: { description: 'Style of the tooltip.', control: false }
  }
} satisfies Meta<typeof Tooltip>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Positions: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: '1.5rem', padding: '3rem 4rem', flexWrap: 'wrap' }}>
      {(['top', 'bottom', 'left', 'right'] as const).map((position) => (
        <Tooltip key={position} {...args} position={position} text={`Side: ${position}`}>
          <Button variant="outline">{position}</Button>
        </Tooltip>
      ))}
    </div>
  )
}

export const IconOnly: Story = {
  args: { text: 'Close', describe: false, children: <Button variant="ghost" aria-label="Close">×</Button> }
}

export const WithDelay: Story = {
  args: { openDelay: 400, closeDelay: 200 }
}

export const NoAnimation: Story = {
  args: { animation: false }
}
