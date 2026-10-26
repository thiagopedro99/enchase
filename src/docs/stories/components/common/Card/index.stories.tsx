import { Card, Grid } from 'enchase'
import { asArgType } from '@docs/shared/argTypes.ts'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Components/Card',
  component: Card,
  args: {
    variant: 'default',
    children: 'Card content'
  },
  parameters: {
    docs: {
      description: {
        component: 'A surface that groups content, in the variants `default`, `elevated` and `outlined`. Only the `elevated` one rises when the pointer is over it. With `as`, the root becomes another structure tag, such as an `li` in a list of cards. For a card that is clickable as a whole, use `CardLink` or `CardButton`.'
      }
    }
  },
  argTypes: {
    as: asArgType,
    variant: {
      description: 'Appearance of the card. Only elevated rises when the pointer is over it.',
      control: 'select',
      options: ['default', 'elevated', 'outlined'],
      table: { defaultValue: { summary: 'default' } }
    },
    padding: {
      description: 'Inner spacing (any CSS value). Without it, the default spacing applies, and a class of your own always wins over it.',
      control: 'text'
    },
    animation: {
      description: 'false turns the motion off. { tuning: { duration, distance } } sets the lift (seconds and pixels). The lift only runs with a fine pointer and with no preference for reduced motion.',
      control: 'object',
      table: { type: { summary: 'false | { recipe, tuning }' }, defaultValue: { summary: 'lift' } }
    },
    className: {
      description: 'Class of the card (data-slot="card"). You can also style it by data-variant and data-motion.',
      control: 'text'
    },
    children: { control: 'text' },
    style: { control: false }
  }
} satisfies Meta<typeof Card>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Elevated: Story = {
  args: { variant: 'elevated' }
}

export const Outlined: Story = {
  args: { variant: 'outlined' }
}

export const NoLift: Story = {
  args: { variant: 'elevated', animation: false }
}

export const ListOfCards: Story = {
  render: (args) => (
    <Grid as="ul" columns={3} aria-label="Projects">
      {['Component library', 'Metrics dashboard', 'Example store'].map((label) => (
        <Card key={label} {...args} as="li">
          {label}
        </Card>
      ))}
    </Grid>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A real list: the `Grid` is a `ul` and each `Card` is an `li`, with no hand-written `role`. Because the `li` is an item of the grid, it stretches to the height of the row without `block-size: 100%`.'
      }
    }
  }
}
