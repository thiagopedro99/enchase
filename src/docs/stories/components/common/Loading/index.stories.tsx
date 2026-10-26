import { InlineLoading, Loading } from 'enchase'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Components/Loading',
  component: Loading,
  args: {
    size: 'md',
    overlay: false
  },
  parameters: {
    docs: {
      description: {
        component: 'A ring-shaped loading indicator, with optional text. With `overlay`, it covers the page, makes the rest inert and locks scrolling.'
      }
    }
  },
  argTypes: {
    size: {
      description: 'Diameter of the ring.',
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      table: { defaultValue: { summary: 'md' } }
    },
    overlay: {
      description: 'Covers the page, makes the rest inert and locks scrolling while it is mounted.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } }
    },
    text: {
      description: 'Visible text. Without it, a screen reader announces labels.loading.',
      control: 'text'
    },
    color: {
      description: 'Color of the spinning arc (any CSS color).',
      control: 'color'
    },
    animation: {
      description: 'false stops the spinning. { tuning: { duration } } sets the seconds of one full turn. With reduced motion the spin becomes an opacity pulse.',
      control: 'object',
      table: { type: { summary: 'false | { recipe, tuning }' }, defaultValue: { summary: 'spin' } }
    },
    className: {
      description: 'Class of the root element (data-slot="loading").',
      control: 'text'
    },
    style: { control: false }
  }
} satisfies Meta<typeof Loading>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithText: Story = {
  args: { text: 'Saving changes' }
}

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <Loading key={size} {...args} size={size} />
      ))}
    </div>
  )
}

export const Inline: Story = {
  render: () => (
    <p>
      Sending <InlineLoading label="Sending" />
    </p>
  )
}

export const NoAnimation: Story = {
  args: { animation: false }
}
