import { Skeleton } from 'enchase'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Components/Skeleton',
  component: Skeleton,
  args: {
    variant: 'text'
  },
  parameters: {
    docs: {
      description: {
        component: 'A placeholder shown while the content loads, with an animated shimmer, in text, circle and rectangle shapes.'
      }
    }
  },
  argTypes: {
    variant: {
      description: 'Shape of the placeholder.',
      control: 'select',
      options: ['text', 'circular', 'rectangular'],
      table: { defaultValue: { summary: 'text' } }
    },
    width: {
      description: 'Width (any CSS value). On the circular variant, width or height sets both sides.',
      control: 'text'
    },
    height: {
      description: 'Height (any CSS value).',
      control: 'text'
    },
    animation: {
      description: 'false turns the shimmer off. { tuning: { duration } } changes the duration in seconds. With reduced motion the shimmer becomes a pulse of opacity.',
      control: 'object',
      table: { type: { summary: 'false | { recipe, tuning }' }, defaultValue: { summary: 'shimmer' } }
    },
    className: {
      description: 'Class of the element (data-slot="skeleton"), which wins over the default sizes and radii.',
      control: 'text'
    },
    style: { control: false }
  }
} satisfies Meta<typeof Skeleton>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Circular: Story = {
  args: { variant: 'circular', width: '48px' }
}

export const Rectangular: Story = {
  args: { variant: 'rectangular', height: '120px' }
}

export const ProfileCard: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', maxInlineSize: '20rem' }}>
      <Skeleton variant="circular" width="48px" />
      <div style={{ flex: 1, display: 'grid', gap: '0.5rem' }}>
        <Skeleton width="70%" />
        <Skeleton width="40%" />
      </div>
    </div>
  )
}

export const NoAnimation: Story = {
  args: { animation: false }
}
