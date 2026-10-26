import { Button, InlineLoading } from 'enchase'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Components/InlineLoading',
  component: InlineLoading,
  args: {
    size: 'sm'
  },
  argTypes: {
    size: {
      description: 'Diameter of the ring, for use next to text or inside a button.',
      control: 'inline-radio',
      options: ['xs', 'sm', 'md'],
      table: { defaultValue: { summary: 'sm' } }
    },
    color: {
      description: 'Color of the spinning arc (any CSS color).',
      control: 'color'
    },
    label: {
      description: 'Text for screen readers only. Without it, it announces labels.loading from the UIProvider.',
      control: 'text'
    },
    animation: {
      description: 'false stops the spinning. { tuning: { duration } } sets the seconds of one full turn. With reduced motion the spin becomes an opacity pulse.',
      control: 'object',
      table: { type: { summary: 'false | { recipe, tuning }' }, defaultValue: { summary: 'spin' } }
    },
    className: {
      description: 'Class of the root element (data-slot="inline-loading").',
      control: 'text'
    },
    style: { control: false }
  },
  parameters: {
    docs: {
      description: {
        component: 'An inline loading indicator: a span with role="status" and the ring. To cover a block or the whole page, use the Loading.'
      }
    }
  }
} satisfies Meta<typeof InlineLoading>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const InsideAButton: Story = {
  render: (args) => (
    <Button disabled>
      <InlineLoading {...args} label="Saving" /> Saving
    </Button>
  )
}
