import { Badge, Button } from 'enchase'
import { defaultSize, defaultVariant, variantLabels, variants } from './defaultData.ts'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Components/Badge',
  component: Badge,
  args: {
    children: 'New',
    variant: defaultVariant,
    size: defaultSize
  },
  parameters: {
    docs: {
      description: {
        component: 'A small label for a state or a count, such as "New", "Paid" or "3". The color comes from pairs of theme roles, with the contrast checked, and the text always carries the meaning: never rely on color alone. It is a `<span>` and accepts the attributes of the `<span>`.'
      }
    }
  },
  argTypes: {
    children: {
      description: 'Content of the badge: a short text, a number or an icon next to the text.',
      control: 'text'
    },
    variant: {
      description: 'Color of the badge, by theme role: neutral is gray, primary uses the main color and success, warning, error and info follow the states.',
      control: 'select',
      options: variants,
      table: { defaultValue: { summary: `'${defaultVariant}'` } }
    },
    size: {
      description: 'Size of the badge: sm is 20 px tall and md is 24 px.',
      control: 'inline-radio',
      options: ['sm', 'md'],
      table: { defaultValue: { summary: `'${defaultSize}'` } }
    }
  }
} satisfies Meta<typeof Badge>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
      {variants.map((variant) => (
        <Badge key={variant} {...args} variant={variant}>
          {variantLabels[variant]}
        </Badge>
      ))}
    </div>
  )
}

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
      <Badge {...args} size="sm">
        Small
      </Badge>
      <Badge {...args} size="md">
        Medium
      </Badge>
    </div>
  )
}

export const WithAButton: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Button variant="outline">
      Inbox <Badge variant="primary">3</Badge>
    </Button>
  )
}
