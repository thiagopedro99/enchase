import { Button, VisuallyHidden } from 'enchase'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Components/VisuallyHidden',
  component: VisuallyHidden,
  args: { children: 'Text for screen readers only' },
  argTypes: {
    className: { description: 'Class of the element (data-slot="visually-hidden").', control: 'text' },
    style: { control: false }
  },
  parameters: {
    docs: {
      description: {
        component: 'Hides the text from the screen but keeps it in the accessibility tree. Use it to name controls that only have an icon.'
      }
    }
  }
} satisfies Meta<typeof VisuallyHidden>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const NamedIconButton: Story = {
  render: () => (
    <Button variant="outline">
      <span aria-hidden="true">+</span>
      <VisuallyHidden>Add item</VisuallyHidden>
    </Button>
  )
}
